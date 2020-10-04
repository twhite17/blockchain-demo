
import * as bc from './index';
import axios, { AxiosAdapter, AxiosPromise, AxiosResponse } from 'axios';

export function newBlockRequest(block: bc.EncryptedBlock, baseUrl: string): AxiosPromise{
    return axios({method: 'post', url: baseUrl+'/bpi/blocks/new', data: block }).catch(v => {console.log(v); return v})
}

export function newBlockRequestAll(block: bc.EncryptedBlock, hostList: Array<{publicKey: string, address: string}>): Promise<AxiosResponse<any>[]>{
    return Promise.all(hostList.map(host => newBlockRequest(block, host.address)));
}



