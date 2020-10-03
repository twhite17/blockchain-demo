"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Blockchain = __importStar(require("./index"));
var difficulty = 2;
var b1 = Blockchain.createBlock(0, Blockchain.getTime(), { test: 21 }, "", difficulty);
test('hash function produces hash', function () {
    expect(typeof Blockchain.hashFunction("hello")).toBe('string');
});
test('blockchain proof of work is correct', function () {
    var _a;
    expect(b1.hash).not.toBeNull();
    if (b1.hash == null)
        return;
    expect(parseInt((_a = b1.hash) === null || _a === void 0 ? void 0 : _a.slice(0, difficulty))).toBe(0);
});
test('creating second block from first', function () {
    // checks no errors are thrown in creating b2
    expect(function () { return Blockchain.createNextBlock(b1, { test: 22 }, Blockchain.getTime()); }).not.toThrowError();
    // checks that previous hash is indeed equal to previous blocks hash
    expect(Blockchain.createNextBlock(b1, { test: 22 }, Blockchain.getTime()).previousHash).toBe(b1.hash);
});
test('re-hashing blocks', function () {
    expect(Blockchain.reHashBlock(b1).hash).toBe(b1.hash);
    expect(Blockchain.reHashBlock(b1, difficulty).hash).toBe(b1.hash);
});
test('block validation', function () {
    var b2 = Blockchain.createNextBlock(b1, { test: 22 }, Blockchain.getTime());
    expect(Blockchain.validateBlock(b1, b2)).toBe(true);
});
test('comprehensive test..', function () {
    var a1 = Blockchain.createBlock(0, Blockchain.getTime(), { n: 1, message: "Hello World!" }, "", 3);
    var blocks = [a1];
    for (var i = 1; i < 10; i++) {
        blocks.push(Blockchain.createNextBlock(blocks[i - 1], { n: i + 1, message: "Hello World!!!" }, Blockchain.getTime()));
    }
});
test('testing deepmerge function', function () {
    var a = { test: { a: 1 } };
    var b = { test: { b: 1 } };
    var c = { test: { c: 1 }, other: "Hello World" };
    expect(Blockchain.deepMerge(function () { return true; }, a, b, c)).toEqual({ test: { a: 1, b: 1, c: 1 }, other: "Hello World" });
});
test('testing block encryption', function () {
    var eb1 = Blockchain.encryptBlock(b1, "-----BEGIN RSA PRIVATE KEY-----\n    MIICXgIBAAKBgQCz0qwsQXYk73xhLzPVZR5CVglP2fMNJQqRZy0neW/7c2+/1569\n    qpkscSmocAiUAaoVnCVhp9CrO/63Anp9wmsbVS6EyhgQ7B8nSepx76wV7lk1Olri\n    HdSyLrHCq8he+Ae5ZZWct0SVDVMGLv4tespdA+YpoUUqTE/kdif1hrSlNQIDAQAB\n    AoGBAI0ZYb/YHbwdrpsTTrjC/1tN50Cg4/YMep5dNzEiOJw1mBoQNp7cnhQhN27T\n    eeeo5qzOOQbHhxTVnqg7aaIES8V01sajxFB4FoKHLEnkj/Pb4lhAZz9UHQjTZrjc\n    YMH2DtMWrv2Ul6d6vFyils2q198Wprcz0bs0V07GR+FEjmqBAkEA6PjjOnaa4QG4\n    cMxftbB2lL+P87RFxcBX2+TjqdTYKKhF+rZV0vbfGgiSRaZxQGs4eAyzVAh4KJ8U\n    VzaSHVDOMwJBAMWY5j9yXbAeQZ4aAPAY0AmtxuAP6U9+yFHtJgqV3Vt52YDYfD2R\n    HZCpwks3ommoNqJxDLYDly/dZv4sSvn1hvcCQQCQeZhgryDJHMoGmZdZEz/Wax2Y\n    YllKk0dpBH7y2R3byM7s9ZovpA0jFeGv89ITwupX+HhVSpNJja2NkDf4mh3lAkEA\n    hICabZNYZeB0KfvQAzDwWH0ybk/dKRSgaee36cNDM7NK+g6xiWuFQtvDUUMWYvmM\n    4XMjje5sdIloJis3f9R4UwJAYVWHGFGVC3/Mit/pH2YX7BF3N7vH1scbm4FKuOLy\n    hnqeFjO3sX6g3UXsr+xlc7D0BJqZJX8mNkpy3RFXJTnw4w==\n    -----END RSA PRIVATE KEY-----", 'bob');
    var db1 = Blockchain.decryptBlock(eb1, "-----BEGIN PUBLIC KEY-----\n    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCz0qwsQXYk73xhLzPVZR5CVglP\n    2fMNJQqRZy0neW/7c2+/1569qpkscSmocAiUAaoVnCVhp9CrO/63Anp9wmsbVS6E\n    yhgQ7B8nSepx76wV7lk1OlriHdSyLrHCq8he+Ae5ZZWct0SVDVMGLv4tespdA+Yp\n    oUUqTE/kdif1hrSlNQIDAQAB\n    -----END PUBLIC KEY-----", 'bob');
    expect(db1).toEqual(b1);
});
