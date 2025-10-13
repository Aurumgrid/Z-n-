# Arweave Quick-Start Guide

Welcome to the Arweave Quick-Start Guide! This document provides a comprehensive overview of the Arweave network, its core concepts, and practical steps for developers and users to get started with permanent, decentralized data storage.

## Table of Contents

1.  [**What is Arweave?**](#1-what-is-arweave)
    -   The Permaweb
    -   Blockweave and Proof of Access
    -   The Endowment Model
2.  [**Core Concepts**](#2-core-concepts)
3.  [**Getting Started: Your First Wallet**](#3-getting-started-your-first-wallet)
4.  [**Funding Your Wallet**](#4-funding-your-wallet)
5.  [**Interacting with Arweave**](#5-interacting-with-arweave)
    -   Using `arweave-js` (for Developers)
    -   Using Command-Line Tools
6.  [**Uploading Your First File**](#6-uploading-your-first-file)
7.  [**Retrieving Data**](#7-retrieving-data)
8.  [**Gateways**](#8-gateways)
9.  [**Further Reading**](#9-further-reading)

---

### 1. What is Arweave?

Arweave is a decentralized storage network that aims to store data permanently. Unlike traditional cloud storage or even other decentralized networks, Arweave's unique economic model ensures that data stored on the network is available "forever" with a single, one-time payment.

-   **The Permaweb:** A human-readable layer built on top of the Arweave network. It hosts websites, applications, and documents that are permanent, decentralized, and cannot be altered or deleted.
-   **Blockweave and Proof of Access:** Instead of a traditional blockchain, Arweave uses a "blockweave." Each new block is linked to the previous block and also to a randomly chosen earlier block (a "recall block"). This structure incentivizes miners to store more of the network's data, not just the latest blocks. The consensus mechanism, Proof of Access (PoA), requires miners to prove they have access to this recall block to mine a new one.
-   **The Endowment Model:** To pay for permanent storage, Arweave uses a sustainable endowment. When you pay to upload data, a portion of the fee covers the initial cost of storage, while the majority is added to a storage endowment. The interest generated from this endowment is used to pay for the cost of storage indefinitely into the future.

### 2. Core Concepts

| Concept             | Description                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| **Transaction ID (TXID)** | The unique identifier for any data uploaded to Arweave. It's the equivalent of an IPFS CID.           |
| **Wallet**          | A JSON keyfile that holds your private key, used to sign transactions and prove ownership of your data. |
| **AR Token**        | The native cryptocurrency of the Arweave network, used to pay for storage fees.                           |
| **Gateway**         | A server that provides an easy-to-use HTTP interface to the Arweave network, making it accessible via a standard web browser. |
| **Tags**            | Key-value metadata that can be attached to a transaction, making the data queryable.                     |

### 3. Getting Started: Your First Wallet

Your Arweave wallet is a simple JSON file. It is critical to **back up this file securely**, as losing it means losing access to your funds and the ability to sign transactions.

You can generate a new wallet using `arweave-js`:

```bash
# 1. Install Node.js if you don't have it.
# 2. Install arweave-js
npm install -g arweave

# 3. Generate a new keyfile
arweave key-create > /path/to/your/arweave-keyfile.json
```

Keep the generated `arweave-keyfile.json` in a safe, private location.

### 4. Funding Your Wallet

To upload data, you need AR tokens. You can acquire AR from various cryptocurrency exchanges. Once you have AR, you can send it to the address associated with your keyfile.

To get your wallet address:

```bash
arweave key-to-address --key-file /path/to/your/arweave-keyfile.json
```

### 5. Interacting with Arweave

#### Using `arweave-js` (for Developers)

`arweave-js` is the primary JavaScript library for interacting with the Arweave network.

**Installation:**

```bash
npm install arweave
```

**Initialization:**

```javascript
const Arweave = require('arweave');

const arweave = Arweave.init({
    host: 'arweave.net', // Mainnet gateway
    port: 443,
    protocol: 'https'
});
```

#### Using Command-Line Tools

For quick, one-off interactions, the `arweave` CLI tool is very useful.

```bash
# Check your balance
arweave balance --wallet /path/to/your/keyfile.json

# Get network info
arweave network-info
```

### 6. Uploading Your First File

Here’s how to upload a file using `arweave-js`. This example reads a local file and uploads it as a transaction.

```javascript
const fs = require('fs').promises;
const Arweave = require('arweave');

async function uploadFile(filePath, key) {
    // Initialize Arweave
    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https'
    });

    // Load wallet
    const wallet = JSON.parse(await fs.readFile(key));

    // Read the file data
    const data = await fs.readFile(filePath);

    // Create and sign the transaction
    const transaction = await arweave.createTransaction({ data }, wallet);
    transaction.addTag('Content-Type', 'text/plain'); // Example tag

    await arweave.transactions.sign(transaction, wallet);

    // Submit the transaction
    const uploader = await arweave.transactions.getUploader(transaction);
    while (!uploader.isComplete) {
        await uploader.uploadChunk();
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }

    console.log(`File uploaded with TXID: ${transaction.id}`);
    return transaction.id;
}

// Usage
const keyfilePath = '/path/to/your/arweave-keyfile.json';
const dataPath = './my-file.txt';
uploadFile(dataPath, keyfilePath);
```

### 7. Retrieving Data

You can retrieve data using its Transaction ID (TXID).

**Using `arweave-js`:**

```javascript
async function retrieveData(txid) {
    const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' });
    const data = await arweave.transactions.getData(txid, { decode: true, string: true });
    console.log(data);
}

// Usage
retrieveData('YOUR_TRANSACTION_ID');
```

**Using a Gateway URL:**

The easiest way to access data is directly through a gateway's URL:

`https://arweave.net/<YOUR_TRANSACTION_ID>`

### 8. Gateways

Gateways are essential for making the permaweb accessible. They act as a bridge between the traditional web and the Arweave network. While `arweave.net` is the primary public gateway, there are many others available, which can help with redundancy and performance.

### 9. Further Reading

-   **Arweave Official Docs:** [https://docs.arweave.org/](https://docs.arweave.org/)
-   **Arweave Cookbook:** [https://cookbook.arweave.dev/](https://cookbook.arweave.dev/)
-   **arweave-js GitHub:** [https://github.com/ArweaveTeam/arweave-js](https://github.com/ArweaveTeam/arweave-js)