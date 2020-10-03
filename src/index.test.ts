import * as Blockchain from './index';

let difficulty = 2;

let b1 : Blockchain.Block = Blockchain.createBlock(0,Blockchain.getTime(), {test: 21}, "", difficulty);


test('hash function produces hash', () => {
    expect(typeof Blockchain.hashFunction("hello")).toBe('string')
});

test('blockchain proof of work is correct', () => {
    expect(b1.hash).not.toBeNull();
    if(b1.hash == null) return;
    expect(parseInt(b1.hash?.slice(0, difficulty))).toBe(0);
});


test('creating second block from first', () => {

    // checks no errors are thrown in creating b2
    expect(() => Blockchain.createNextBlock(b1, {test: 22}, Blockchain.getTime())).not.toThrowError();
    
    // checks that previous hash is indeed equal to previous blocks hash
    expect(Blockchain.createNextBlock(b1, {test: 22}, Blockchain.getTime()).previousHash).toBe(b1.hash);


});

test('re-hashing blocks', () => {
    expect(Blockchain.reHashBlock(b1).hash).toBe(b1.hash);
    expect(Blockchain.reHashBlock(b1, difficulty).hash).toBe(b1.hash);
})

test('block validation', () => {
    let b2 = Blockchain.createNextBlock(b1, {test:22}, Blockchain.getTime());
    expect(Blockchain.validateBlock(b1, b2)).toBe(true);
})

test('comprehensive test..', () => {


    let a1 = Blockchain.createBlock(0, Blockchain.getTime(), {n: 1, message: "Hello World!"}, "", 3);
       
    let blocks = [a1];

    for(let i=1; i<10; i++){
        blocks.push(Blockchain.createNextBlock(
            blocks[i - 1],
            {n: i + 1, message: "Hello World!!!"},
            Blockchain.getTime()));
    }

})


test('testing deepmerge function', () => {

    let a = {test: {a: 1}};
    let b = {test: {b: 1}};
    let c = {test: {c: 1}, other: "Hello World"};

    expect(Blockchain.deepMerge(() => true, a, b, c)).toEqual({test: {a: 1, b: 1, c: 1}, other: "Hello World"});

})

test('testing block encryption', () => {
    let eb1 = Blockchain.encryptBlock(b1, `-----BEGIN RSA PRIVATE KEY-----
    MIICXgIBAAKBgQCz0qwsQXYk73xhLzPVZR5CVglP2fMNJQqRZy0neW/7c2+/1569
    qpkscSmocAiUAaoVnCVhp9CrO/63Anp9wmsbVS6EyhgQ7B8nSepx76wV7lk1Olri
    HdSyLrHCq8he+Ae5ZZWct0SVDVMGLv4tespdA+YpoUUqTE/kdif1hrSlNQIDAQAB
    AoGBAI0ZYb/YHbwdrpsTTrjC/1tN50Cg4/YMep5dNzEiOJw1mBoQNp7cnhQhN27T
    eeeo5qzOOQbHhxTVnqg7aaIES8V01sajxFB4FoKHLEnkj/Pb4lhAZz9UHQjTZrjc
    YMH2DtMWrv2Ul6d6vFyils2q198Wprcz0bs0V07GR+FEjmqBAkEA6PjjOnaa4QG4
    cMxftbB2lL+P87RFxcBX2+TjqdTYKKhF+rZV0vbfGgiSRaZxQGs4eAyzVAh4KJ8U
    VzaSHVDOMwJBAMWY5j9yXbAeQZ4aAPAY0AmtxuAP6U9+yFHtJgqV3Vt52YDYfD2R
    HZCpwks3ommoNqJxDLYDly/dZv4sSvn1hvcCQQCQeZhgryDJHMoGmZdZEz/Wax2Y
    YllKk0dpBH7y2R3byM7s9ZovpA0jFeGv89ITwupX+HhVSpNJja2NkDf4mh3lAkEA
    hICabZNYZeB0KfvQAzDwWH0ybk/dKRSgaee36cNDM7NK+g6xiWuFQtvDUUMWYvmM
    4XMjje5sdIloJis3f9R4UwJAYVWHGFGVC3/Mit/pH2YX7BF3N7vH1scbm4FKuOLy
    hnqeFjO3sX6g3UXsr+xlc7D0BJqZJX8mNkpy3RFXJTnw4w==
    -----END RSA PRIVATE KEY-----`, 'bob');

    let db1 = Blockchain.decryptBlock(eb1, `-----BEGIN PUBLIC KEY-----
    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCz0qwsQXYk73xhLzPVZR5CVglP
    2fMNJQqRZy0neW/7c2+/1569qpkscSmocAiUAaoVnCVhp9CrO/63Anp9wmsbVS6E
    yhgQ7B8nSepx76wV7lk1OlriHdSyLrHCq8he+Ae5ZZWct0SVDVMGLv4tespdA+Yp
    oUUqTE/kdif1hrSlNQIDAQAB
    -----END PUBLIC KEY-----`, 'bob');

    expect(db1).toEqual(b1);
})
