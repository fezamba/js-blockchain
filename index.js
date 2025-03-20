import express from 'express';
import crypto from 'crypto';
import { URL } from "url";
import axios from 'axios';

const app = express();
app.use(express.json());

const port = 3000;
class Blockchain {
    constructor() {
        this.chain = [];
        this.transactions = [];
        this.nodes = new Set();
        this.createBlock(1, "0");
    }

    createBlock(proof, previousHash) {
        const block = {
            index: this.chain.length + 1,
            timeStamp: new Date().toISOString(),
            proof: proof,
            previousHash: previousHash,
            transactions: this.transactions
        };
        this.transactions = [];
        this.chain.push(block);
        return block;
    }

    getPreviousBlock() {
        return this.chain[this.chain.length - 1];
    }

    proofOfWork(previousProof) {
        let newProof = 1;
        let checkProof = false;
        while (!checkProof){
            let hashOperation = crypto.createHash('sha256').update(String(newProof ** 2 - previousProof ** 2)).digest('hex');
            if (hashOperation.substring(0, 4) === "0000"){
                checkProof = true;
            } else {
                newProof += 1;
            }
        }
        return newProof;
    }

    hash(block) {
        const sortedBlock = Object.keys(block).sort().reduce((obj, key) => {
            obj[key] = block[key];
            return obj;
        }, {});
        const encodedBlock = JSON.stringify(sortedBlock);
        return crypto.createHash("sha256").update(encodedBlock).digest("hex");
    }

    isChainValid(chain) {
        let previousBlock = chain[0];
        let blockIndex = 1;
        while (blockIndex < chain.length){
           let block = chain[blockIndex];
           if (block["previousHash"] !== this.hash(previousBlock)){
            return false;
           }
           let previousProof = previousBlock["proof"];
           let proof = block["proof"];
           let hashOperation = crypto.createHash('sha256').update(String(proof ** 2 - previousProof ** 2)).digest('hex');
           if (hashOperation.substring(0, 4) !== "0000"){
            return false;
           }
           previousBlock = block;
           blockIndex += 1;
        }
        return true;
    }

    addTransaction(sender, receiver, amount) {
        this.transactions.push({ sender, receiver, amount });
        const previousBlock = this.getPreviousBlock();
        return previousBlock.index + 1;
    }

    addNode(address) {
        try {
            const parsedUrl = new URL(address);
            this.nodes.add(`${parsedUrl.hostname}:${parsedUrl.port}`);
        } catch (error) {
            console.error("Invalid address:", address);
        }
    }

    async replaceChain() {
        const network = this.nodes;
        let longestChain = null;
        let maxLength = this.chain.length;

        for (const node of network) {
            try {
                const response = await axios.get(`http://${node}/get_chain`);
                const data = response.data;
                if (response.data) {
                    const length = data.length;
                    const chain = data.chain;

                    if (length > maxLength && this.isChainValid(chain)) {
                        maxLength = length;
                        longestChain = chain;
                    }
                }
            } catch (error) {
                console.error(`Erro ao acessar o nó ${node}:`, error);
            }
        }

        if (longestChain) {
            this.chain = longestChain;
            return true;
        }
        return false;
    }
}
const blockchain = new Blockchain();