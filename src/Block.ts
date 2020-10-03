import sha256 from "crypto-js/sha256";

type UnixTimestamp = number;
type Hash = string;

export interface Block{
    index: number
    timestamp: UnixTimestamp,
    data: any,
    previousHash: Hash,
    hash?: Hash,
    nonce?: number
}

// provides an easy method to modify the hashing algorithm used.
export const hashFunction = (data: string) : string => sha256(data).toString();

export const getTime = () : UnixTimestamp => Math.round((new Date()).getTime() / 1000)

const repeat = (str: string, n: number) => {
    let result = "";
    for(let i: number=0; i<n; i++){
        result += str
    }
    return result;
} 

// takes a block which doesn't yet have it's hash value and hashes it
export function hashBlock(block: Block): Hash{
    let {
        index,
        timestamp,
        data,
        previousHash,
        nonce
    } = block;

    return hashFunction(
        index.toString() 
        + timestamp.toString()
        + JSON.stringify(data)
        + previousHash
        + nonce?.toString() ?? "" );
}


// creates a block
export function createBlock(
    index: number,
    timestamp: UnixTimestamp,
    data: any,
    previousHash: Hash = "",
    difficulty: number = 3
) : Block {

    let nonce = -1;
    let block : Block;
    let hash: Hash;
    let zeroStr = repeat("0", difficulty);
    do{
        nonce ++;
        block = {index, timestamp, data, previousHash, nonce} as Block;
        hash = hashBlock(block);

    }while(hash.slice(0, difficulty) !== zeroStr || hash.slice(0, difficulty + 1) === zeroStr + "0") 

    block = {
        hash,
        index,
        timestamp,
        data,
        previousHash,
        nonce
    } as Block;

    return block;
}

const countZeros = (str: string) : number => {
    let n = 0;
    let i = 0;
    while(str[i] == '0'){n++; i++;}
    return n;
}


export function createNextBlock(block: Block, data: any, timestamp: UnixTimestamp): Block{
    let {hash, index} = block;

    if(!hash) throw new Error("Error creating next block, \"hash\" cannot be null.");

    let newBlock = createBlock(index + 1, timestamp, data, hash, countZeros(hash));
    return newBlock;

}


// validates a block in regards to previous block, assumes that each of the blocks have been hashed
// and that their hashes are correct (you should validate these if you have downloaded blocks from the internet)
export function validateBlock(previousBlock: Block, block : Block): Boolean{
    return previousBlock.hash === block.previousHash;
}

// re-calculates any hash values from a block, this is reccomended if your block was downloaded from the internet
export function reHashBlock(block: Block, difficulty: number | undefined = undefined) : Block{
    if(!difficulty) {
        if(!block.hash) throw new Error("Cannot re-hash block, don't know the difficulty value required.")
        difficulty = countZeros(block.hash)
    }

    let {index, timestamp, data, previousHash} = block;
    return {...block, hash: createBlock(index, timestamp, data, previousHash, difficulty).hash}
}