"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newBlockRequestAll = exports.newBlockRequest = void 0;
var axios_1 = __importDefault(require("axios"));
function newBlockRequest(block, baseUrl) {
    return axios_1.default({ method: 'post', url: baseUrl + '/bpi/blocks/new', data: block }).catch(function (v) { console.log(v); return v; });
}
exports.newBlockRequest = newBlockRequest;
function newBlockRequestAll(block, hostList) {
    return Promise.all(hostList.map(function (host) { return newBlockRequest(block, host.address); }));
}
exports.newBlockRequestAll = newBlockRequestAll;
