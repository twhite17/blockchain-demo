
import * as Block from './Block';
import aes from 'crypto-js/aes';
import * as CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';

export interface HostMap{
    publicKey: string,
    address: string,
    displayName: string
}

export interface UserMap{
    publicKey: string,
    userName: string,
}

export interface Data{
    [key: string]: any
}

export type EncryptedData = string;

export interface EncryptedBlock{
    block: EncryptedData,
    encryptedAESKey: string,
    hostname: string,
}

// merges any number of javascript objects in a recursive fashion
// predicate is a rule that all items in merged into the final object should follow
// this is used to stop others from setting values they shouldn't as shown later
export function deepMerge(predicate: (_:string) => boolean, ...objects: Array<Data>) : Data{
    let mergeList: Data = {};
    let newObject: Data = {};
    for(let object of objects){
        for(let item of Object.keys(object)){
            if(typeof object[item] === 'object'){
                let prevMergeList = mergeList[item];
                mergeList[item] = (prevMergeList) ? [...prevMergeList, object[item]] : [object[item]];
            }else{
                if(predicate(item)){
                    newObject[item] = object[item];
                }
            }
        }
    }

    for(let mergeItem of Object.keys(mergeList)){
        newObject[mergeItem] = deepMerge(predicate, ...mergeList[mergeItem]);
    }

    return newObject;
}

// for now this is probably not super secure, I have no idea what crypto-js does behind the scenes here
export function encryptAES(data: string, password: string): string{
    let result = aes.encrypt(data, password)
    if(result === undefined) throw new Error(`Cannot Encrypt ${data} with password ${password}`);
    return result.toString();
}

export function decryptAES(data: string, password: string): string{
    let result = aes.decrypt(data, password);
    if(result === undefined) throw new Error(`Cannot Decrypt ${data} with password ${password}`);
    return result.toString(CryptoJS.enc.Utf8);
}

export function encryptBlock(block: Block.Block, key : string, host: string) : EncryptedBlock{

    let data = JSON.stringify(block);

    let keyAES = (Math.floor(Math.random() * 1000000)).toString();

    const keyRSA = new NodeRSA(key);


    let encryptedAESKey = keyRSA.encryptPrivate(keyAES, 'base64');

    return {block: encryptAES(data, keyAES), encryptedAESKey, hostname: host} as EncryptedBlock;
}


// potentially unsafe decryption
export function decryptBlock(block: EncryptedBlock, key : string, host: string) : Block.Block{
    

    const keyRSA = new NodeRSA(key);

    let keyAES = keyRSA.decryptPublic(block.encryptedAESKey, 'utf-8');

    return JSON.parse(decryptAES(block.block, keyAES)) as Block.Block;

}



