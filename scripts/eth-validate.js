"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_functions_1 = require("vineyard-ethereum/src/client-functions");
const Web3 = require('web3');
const config = require('../config/config');
const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumConfig.ethereum.client.http));
function main(startBlock, endBlock) {
    return __awaiter(this, void 0, void 0, function* () {
        let blockNumber = startBlock ? startBlock : 0;
        let web3Block = web3.eth.getBlock(blockNumber);
        // update to the correct db select
        // let dbBlock = web3Block
        let dbBlock = web3.eth.getBlock(blockNumber);
        dbBlock.mixHash = 'asdasd';
        console.log(' wat - ', web3Block);
        console.log(' wha - ', dbBlock);
        client_functions_1.validateBlock(web3Block, dbBlock)
            .then((resolved) => {
            console.log('resolved', resolved);
        });
    });
}
exports.main = main;
main(5787517);
//# sourceMappingURL=eth-validate.js.map