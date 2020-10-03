
import express from 'express';
import fs from 'fs';
import * as bc from './index';

type filename = string;

interface ServerConfiguration{
    server: {
        port: number
        key: {
            public: filename,
            private: filename
        }
    },
    hosts: Array<Host>
};

interface Host{
    publicKey: string,
    address: string
}

interface Error{
    message: string
}

const app = express();

const config: ServerConfiguration = JSON.parse(fs.readFileSync("./conf/config.json").toString());

const blockDifficulty = 2;

let blocklist: Array<bc.Block> = [bc.createBlock(0, 0, {}, "", blockDifficulty)];

app.get("/api/blocks/latest", (req, res) => {
    res.send(blocklist[blocklist.length - 1]);
})

app.get("/api/blocks/:block", (req, res) => {
    let block;
    try{
        block = blocklist[parseInt(req.params.block)];
    }catch(e){
        block = {message: `server does not have block ${req.params.block}`};
    }

    if(block === undefined) res.send({message: `server does not have block ${req.params.block}`});

    res.send(block);
})

app.post("/api/blocks/")



app.listen(config.server.port, () => {
    console.log(`starting server at localhost on port ${config.server.port}`)
})

