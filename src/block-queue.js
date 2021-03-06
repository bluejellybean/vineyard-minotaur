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
const blockQueueConfigDefaults = {
    maxSize: 10,
    maxBlockRequests: 5,
    minSize: 1
};
class ExternalBlockQueue {
    constructor(client, blockIndex, config) {
        this.blocks = [];
        this.requests = [];
        this.listeners = [];
        this.client = client;
        this.blockIndex = blockIndex;
        this.config = Object.assign({}, blockQueueConfigDefaults, config);
    }
    getBlockIndex() {
        return this.blockIndex;
    }
    removeRequest(blockIndex) {
        this.requests = this.requests.filter(r => r.blockIndex != blockIndex);
    }
    removeBlocks(blocks) {
        this.blocks = this.blocks.filter(b => blocks.every(b2 => b2.index != b.index));
    }
    onResponse(blockIndex, block) {
        this.removeRequest(blockIndex);
        if (!block) {
            if (this.listeners.length > 0) {
                const listeners = this.listeners;
                this.listeners = [];
                for (let listener of listeners) {
                    listener.reject(new Error("Error loading block"));
                }
            }
        }
        else {
            this.blocks.push(block);
            const listeners = this.listeners;
            if (this.listeners.length > 0) {
                const readyBlocks = this.getConsecutiveBlocks();
                if (readyBlocks.length > 0) {
                    this.listeners = [];
                    this.removeBlocks(readyBlocks);
                    for (let listener of listeners) {
                        listener.resolve(readyBlocks);
                    }
                }
            }
            // else {
            //   console.log('no listeners')
            // }
        }
    }
    addRequest(index) {
        // console.log('add block', index)
        const tryRequest = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const block = yield this.client.getFullBlock(index);
                yield this.onResponse(index, block);
            }
            catch (error) {
                console.error('Error reading block', index, error);
                yield tryRequest();
                // this.onResponse(index, undefined)
            }
        });
        const promise = tryRequest();
        this.requests.push({
            blockIndex: index,
            promise: promise
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.highestBlockIndex === undefined) {
                this.highestBlockIndex = yield this.client.getHeighestBlockIndex();
            }
            const remaining = this.highestBlockIndex - this.blockIndex;
            let count = Math.min(remaining, this.config.maxBlockRequests - this.requests.length, this.config.maxSize - this.requests.length - this.blocks.length);
            if (count < 0)
                count = 0;
            console.log('Adding blocks', Array.from(new Array(count), (x, i) => i + this.blockIndex).join(', '));
            for (let i = 0; i < count; ++i) {
                this.addRequest(this.blockIndex++);
            }
        });
    }
    // Ensures that batches of blocks are returned in consecutive order
    getConsecutiveBlocks() {
        if (this.blocks.length == 0)
            return [];
        const results = this.blocks.concat([]).sort((a, b) => a.index > b.index ? 1 : -1);
        const oldestRequest = this.requests.map(r => r.blockIndex).sort()[0];
        const oldestResult = results[0].index;
        if (oldestRequest && oldestResult > oldestRequest) {
            return [];
        }
        const blocks = [];
        let i = oldestResult;
        for (let r of results) {
            if (r.index != i++)
                break;
            blocks.push(r);
        }
        if (blocks.length < this.config.minSize && this.requests.length > 0) {
            return [];
        }
        return blocks;
    }
    getBlocks() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.update();
            const readyBlocks = this.getConsecutiveBlocks();
            if (readyBlocks.length > 0) {
                this.removeBlocks(readyBlocks);
                return Promise.resolve(readyBlocks);
            }
            else if (this.requests.length == 0) {
                return Promise.resolve([]);
            }
            else {
                return new Promise((resolve, reject) => {
                    this.listeners.push({
                        resolve: resolve,
                        reject: reject
                    });
                });
            }
        });
    }
}
exports.ExternalBlockQueue = ExternalBlockQueue;
//# sourceMappingURL=block-queue.js.map