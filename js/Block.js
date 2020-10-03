"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reHashBlock = exports.validateBlock = exports.createNextBlock = exports.createBlock = exports.hashBlock = exports.getTime = exports.hashFunction = void 0;
var sha256_1 = __importDefault(require("crypto-js/sha256"));
// provides an easy method to modify the hashing algorithm used.
exports.hashFunction = function (data) { return sha256_1.default(data).toString(); };
exports.getTime = function () { return Math.round((new Date()).getTime() / 1000); };
var repeat = function (str, n) {
    var result = "";
    for (var i = 0; i < n; i++) {
        result += str;
    }
    return result;
};
// takes a block which doesn't yet have it's hash value and hashes it
function hashBlock(block) {
    var _a;
    var index = block.index, timestamp = block.timestamp, data = block.data, previousHash = block.previousHash, nonce = block.nonce;
    return exports.hashFunction((_a = index.toString()
        + timestamp.toString()
        + JSON.stringify(data)
        + previousHash
        + (nonce === null || nonce === void 0 ? void 0 : nonce.toString())) !== null && _a !== void 0 ? _a : "");
}
exports.hashBlock = hashBlock;
// creates a block
function createBlock(index, timestamp, data, previousHash, difficulty) {
    if (previousHash === void 0) { previousHash = ""; }
    if (difficulty === void 0) { difficulty = 3; }
    var nonce = -1;
    var block;
    var hash;
    var zeroStr = repeat("0", difficulty);
    do {
        nonce++;
        block = { index: index, timestamp: timestamp, data: data, previousHash: previousHash, nonce: nonce };
        hash = hashBlock(block);
    } while (hash.slice(0, difficulty) !== zeroStr || hash.slice(0, difficulty + 1) === zeroStr + "0");
    block = {
        hash: hash,
        index: index,
        timestamp: timestamp,
        data: data,
        previousHash: previousHash,
        nonce: nonce
    };
    return block;
}
exports.createBlock = createBlock;
var countZeros = function (str) {
    var n = 0;
    var i = 0;
    while (str[i] == '0') {
        n++;
        i++;
    }
    return n;
};
function createNextBlock(block, data, timestamp) {
    var hash = block.hash, index = block.index;
    if (!hash)
        throw new Error("Error creating next block, \"hash\" cannot be null.");
    var newBlock = createBlock(index + 1, timestamp, data, hash, countZeros(hash));
    return newBlock;
}
exports.createNextBlock = createNextBlock;
// validates a block in regards to previous block, assumes that each of the blocks have been hashed
// and that their hashes are correct (you should validate these if you have downloaded blocks from the internet)
function validateBlock(previousBlock, block) {
    return previousBlock.hash === block.previousHash;
}
exports.validateBlock = validateBlock;
// re-calculates any hash values from a block, this is reccomended if your block was downloaded from the internet
function reHashBlock(block, difficulty) {
    if (difficulty === void 0) { difficulty = undefined; }
    if (!difficulty) {
        if (!block.hash)
            throw new Error("Cannot re-hash block, don't know the difficulty value required.");
        difficulty = countZeros(block.hash);
    }
    var index = block.index, timestamp = block.timestamp, data = block.data, previousHash = block.previousHash;
    return __assign(__assign({}, block), { hash: createBlock(index, timestamp, data, previousHash, difficulty).hash });
}
exports.reHashBlock = reHashBlock;
