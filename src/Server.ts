
import express from 'express';
import fs from 'fs';
import * as bc from './index';
import yargs from 'yargs';

const argv = yargs
    .option('config', {alias: 'c', description: 'Set config file', type: 'string', default: './conf/config.json'})
    .help()
    .alias('help', 'h').argv;

type filename = string;

interface ServerConfiguration{
    server: {
        port: number
        key: {
            public: filename,
            private: filename
        },
        name: string
    },
    hosts: Array<Host>
};

interface Host{
    publicKey: string,
    address: string,
    name: string
}

interface Error{
    message: string
}

const app = express();

if(!argv.config) throw new Error("Error, config not provided");

const config: ServerConfiguration = JSON.parse(fs.readFileSync(argv.config).toString());

const publicKey = fs.readFileSync("./conf/"+config.server.key.public).toString();

const privateKey = fs.readFileSync("./conf/"+config.server.key.private).toString();

const blockDifficulty = 2;

let blocklist: Array<bc.Block> = [bc.createBlock(0, 0, {}, "", blockDifficulty)];

app.use(express.json());

app.get("/api/blocks/get/latest", (req, res) => {
    res.send(blocklist[blocklist.length - 1]);
});

app.get("/api/blocks/get/all", (req, res) => {
    res.send(blocklist);
});

app.get("/api/blocks/get/:block", (req, res) => {
    let block;
    try{
        block = blocklist[parseInt(req.params.block)];
    }catch(e){
        block = {message: `server does not have block ${req.params.block}`};
    }

    if(block === undefined) res.send({message: `server does not have block ${req.params.block}`});

    res.send(block);
});

// yeah this is kinda silly but proof of concept ok?
// in order for this to be secure in pratice authorisation would be required to call this endpoint
// additionally instead of the request being tied to the server's private key, the user would provide their
// private key. This is an entire other area of security which I don't want to implment right now ok?
app.post("/api/blocks/new", (req, res) => {
    console.log(req.body);
    let data = req.body;
    let newBlock = bc.createNextBlock(blocklist[blocklist.length - 1], data, bc.getTime());
    let encryptedNewBlock = bc.encryptBlock(newBlock, privateKey, config.server.name);

    bc.newBlockRequest(encryptedNewBlock, "");
    bc.newBlockRequestAll(encryptedNewBlock, config.hosts);
    res.send({message: "Done!"});
})

// for sending data between nodes
app.post("/bpi/blocks/new", (req, res) => {
    let encryptedNewBlock : bc.EncryptedBlock = req.body;
    let source = config.hosts.filter(v => v.name === encryptedNewBlock.hostname)[0];
    if (source === undefined) {res.send({message: "failed: untrusted host"}); return;};
    let encryptedPublicKey = source.publicKey;

    let newBlock = bc.decryptBlock(encryptedNewBlock, encryptedPublicKey, source.name);
    let lastBlock = blocklist[blocklist.length - 1];

    if (newBlock.previousHash !== lastBlock.hash) {res.send({message: "failed: not valid place in chain"}); return;};

    newBlock = bc.reHashBlock(newBlock, blockDifficulty);

    if(newBlock.timestamp <= lastBlock.timestamp) {res.send({message: "failed: bad timestamp"}); return;};

    if(newBlock.hash === undefined) {res.send({message: "failed: unexpected error"}); return;};

    if(bc.countZeros(newBlock.hash) !== blockDifficulty){res.send({message: "failed: bad hash"}); return;};

    blocklist.push(newBlock);
    console.log(`Successfully added Block number ${blocklist.length - 1} with data ${newBlock.data}`);
    
})



app.listen(config.server.port, () => {
    console.log(`starting server at localhost on port ${config.server.port}`)
})

