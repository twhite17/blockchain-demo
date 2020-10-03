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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var fs_1 = __importDefault(require("fs"));
var bc = __importStar(require("./index"));
;
var app = express_1.default();
var config = JSON.parse(fs_1.default.readFileSync("./conf/config.json").toString());
var blockDifficulty = 2;
var blocklist = [bc.createBlock(0, 0, {}, "", blockDifficulty)];
app.get("/api/blocks/latest", function (req, res) {
    res.send(blocklist[blocklist.length - 1]);
});
app.get("/api/blocks/:block", function (req, res) {
    var block;
    try {
        block = blocklist[parseInt(req.params.block)];
    }
    catch (e) {
        block = { message: "server does not have block " + req.params.block };
    }
    if (block === undefined)
        res.send({ message: "server does not have block " + req.params.block });
    res.send(block);
});
app.listen(config.server.port, function () {
    console.log("starting server at localhost on port " + config.server.port);
});
