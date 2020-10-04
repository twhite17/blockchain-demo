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
var yargs_1 = __importDefault(require("yargs"));
var argv = yargs_1.default
    .option('config', { alias: 'c', description: 'Set config file', type: 'string', default: './conf/config.json' })
    .help()
    .alias('help', 'h').argv;
;
var app = express_1.default();
if (!argv.config)
    throw new Error("Error, config not provided");
var config = JSON.parse(fs_1.default.readFileSync(argv.config).toString());
var publicKey = fs_1.default.readFileSync("./conf/" + config.server.key.public).toString();
var privateKey = fs_1.default.readFileSync("./conf/" + config.server.key.private).toString();
var blockDifficulty = 2;
var globalData = {};
var blocklist = [bc.createBlock(0, 0, {}, "", blockDifficulty)];
app.use(express_1.default.json());
app.get("/api/blocks/get/latest", function (req, res) {
    res.send(blocklist[blocklist.length - 1]);
});
app.get("/api/blocks/get/all", function (req, res) {
    res.send(blocklist);
});
app.get("/api/blocks/get/:block", function (req, res) {
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
// yeah this is kinda silly but proof of concept ok?
// in order for this to be secure in pratice authorisation would be required to call this endpoint
// additionally instead of the request being tied to the server's private key, the user would provide their
// private key. This is an entire other area of security which I don't want to implment right now ok?
app.post("/api/blocks/new", function (req, res) {
    var data = req.body;
    var newBlock = bc.createNextBlock(blocklist[blocklist.length - 1], data, bc.getTime());
    var encryptedNewBlock = bc.encryptBlock(newBlock, privateKey, config.server.name);
    newBlockFunction(encryptedNewBlock);
    bc.newBlockRequestAll(encryptedNewBlock, config.hosts);
    res.send({ message: "Done!" });
});
function newBlockFunction(encryptedNewBlock) {
    var res = { send: function (_a) {
            var message = _a.message;
            return console.log(message);
        } };
    var source = config.hosts.filter(function (v) { return v.name === encryptedNewBlock.hostname; })[0];
    if (source === undefined) {
        res.send({ message: "failed: untrusted host" });
        return;
    }
    ;
    var encryptedPublicKey = source.publicKey;
    var newBlock = bc.decryptBlock(encryptedNewBlock, encryptedPublicKey, source.name);
    var lastBlock = blocklist[blocklist.length - 1];
    if (newBlock.previousHash !== lastBlock.hash) {
        res.send({ message: "failed: not valid place in chain" });
        return;
    }
    ;
    newBlock = bc.reHashBlock(newBlock, blockDifficulty);
    if (newBlock.timestamp <= lastBlock.timestamp) {
        res.send({ message: "failed: bad timestamp" });
        return;
    }
    ;
    if (newBlock.hash === undefined) {
        res.send({ message: "failed: unexpected error" });
        return;
    }
    ;
    if (bc.countZeros(newBlock.hash) !== blockDifficulty) {
        res.send({ message: "failed: bad hash" });
        return;
    }
    ;
    var valid = Object.keys(newBlock.data).reduce(function (pre, key) { return pre && (key.slice(0, source.name.length) + '@' === source.name + '@'); }, true);
    if (!valid) {
        res.send({ message: "failed: not valid data" });
        console.log("Rejected new block submitted by node " + source.name + " due to incorrect permissions");
        return;
    }
    blocklist.push(newBlock);
    globalData = __assign(__assign({}, globalData), newBlock.data);
    console.log("Successfully added Block number " + (blocklist.length - 1) + " with data " + JSON.stringify(newBlock.data));
}
// for sending data between nodes
app.post("/bpi/blocks/new", function (req, res) {
    var encryptedNewBlock = req.body;
    var source = config.hosts.filter(function (v) { return v.name === encryptedNewBlock.hostname; })[0];
    if (source === undefined) {
        res.send({ message: "failed: untrusted host" });
        return;
    }
    ;
    var encryptedPublicKey = source.publicKey;
    var newBlock = bc.decryptBlock(encryptedNewBlock, encryptedPublicKey, source.name);
    var lastBlock = blocklist[blocklist.length - 1];
    if (newBlock.previousHash !== lastBlock.hash) {
        res.send({ message: "failed: not valid place in chain" });
        return;
    }
    ;
    newBlock = bc.reHashBlock(newBlock, blockDifficulty);
    if (newBlock.timestamp <= lastBlock.timestamp) {
        res.send({ message: "failed: bad timestamp" });
        return;
    }
    ;
    if (newBlock.hash === undefined) {
        res.send({ message: "failed: unexpected error" });
        return;
    }
    ;
    if (bc.countZeros(newBlock.hash) !== blockDifficulty) {
        res.send({ message: "failed: bad hash" });
        return;
    }
    ;
    var valid = Object.keys(newBlock.data).reduce(function (pre, key) { return pre && (key.slice(0, source.name.length) + '@' === source.name + '@'); }, true);
    if (!valid) {
        res.send({ message: "failed: not valid data" });
        console.log("Rejected new block submitted by node " + source.name + " due to incorrect permissions");
        return;
    }
    blocklist.push(newBlock);
    globalData = __assign(__assign({}, globalData), newBlock.data);
    console.log("Successfully added Block number " + (blocklist.length - 1) + " with data " + JSON.stringify(newBlock.data));
    console.log("Global State is now : " + JSON.stringify(globalData));
});
app.listen(config.server.port, function () {
    console.log("starting server at localhost on port " + config.server.port);
});
