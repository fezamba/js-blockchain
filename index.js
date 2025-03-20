import express from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { timeStamp } from 'console';

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
        return this.chain[-1];
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
        const encodedBlock = JSON.stringify(block, Object.keys(block).sort());
        return crypto.createHash("sha256").update(encodedBlock).digest("hex");
    }

    isChainValid(chain) {
    }

    addTransaction(sender, receiver, amount) {
    }

    addNode(address) {
    }

    replaceChain() {
    }
}

/* app.get('/', (req, res) => {
    res.json({ mensagem: 'Servidor Express rodando com import!' });
});

const id = uuidv4();
console.log(`UUID Gerado: ${id}`);

const hash = crypto.createHash('sha256').update('texto').digest('hex');
console.log(`Hash SHA-256: ${hash}`);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); */