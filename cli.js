const Arweave = require('arweave');
const fs = require('fs').promises;
const { exec } = require('child_process');

// --- Configuration ---
const ARWEAVE_CONFIG = {
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
};

/**
 * Executes a shell command and returns it as a Promise.
 * @param {string} cmd The command to execute.
 * @returns {Promise<string>} The stdout from the command.
 */
function execPromise(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${stderr}`);
                return reject(error);
            }
            resolve(stdout.trim());
        });
    });
}

/**
 * Uploads a file to Arweave and returns the transaction ID.
 * @param {string} filePath Path to the file to upload.
 * @param {string} walletPath Path to the Arweave keyfile.
 * @returns {Promise<string>} The Arweave transaction ID.
 */
async function uploadToArweave(filePath, walletPath) {
    console.log('Initializing Arweave...');
    const arweave = Arweave.init(ARWEAVE_CONFIG);

    console.log('Loading wallet...');
    const wallet = JSON.parse(await fs.readFile(walletPath));

    console.log(`Reading file: ${filePath}...`);
    const data = await fs.readFile(filePath);

    console.log('Creating Arweave transaction...');
    const transaction = await arweave.createTransaction({ data }, wallet);
    // Add a content type tag for browsers
    // In a real app, you might use a library like 'mime-types'
    transaction.addTag('Content-Type', 'application/octet-stream');

    console.log('Signing transaction...');
    await arweave.transactions.sign(transaction, wallet);

    console.log('Submitting transaction to Arweave...');
    const uploader = await arweave.transactions.getUploader(transaction);

    while (!uploader.isComplete) {
        await uploader.uploadChunk();
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks} chunks`);
    }

    console.log(`✅ File uploaded successfully to Arweave. TXID: ${transaction.id}`);
    return transaction.id;
}

/**
 * Registers a file's metadata with the AO smart contract.
 * @param {string} processId The AO process ID.
 * @param {string} txid The Arweave transaction ID.
 * @param {string} fileName The name of the file.
 * @param {number} fileSize The size of the file in bytes.
 */
async function registerWithAO(processId, txid, fileName, fileSize) {
    console.log(`\nRegistering with AO process: ${processId}...`);

    const dataPayload = JSON.stringify({
        txid: txid,
        name: fileName,
        size: fileSize
    }).replace(/"/g, '\\"'); // Escape quotes for the shell command

    const command = `aos --process ${processId} --action Upload --data "${dataPayload}"`;

    console.log(`Executing: ${command}`);
    try {
        const result = await execPromise(command);
        console.log('✅ Registration with AO successful!');
        console.log('AO Response:', result);
    } catch (error) {
        console.error('❌ Failed to register with AO.');
        throw error;
    }
}

/**
 * Main function to run the CLI tool.
 */
async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 3) {
        console.error('Usage: node cli.js <path-to-file> <ao-process-id> <path-to-wallet.json>');
        process.exit(1);
    }

    const [filePath, processId, walletPath] = args;

    try {
        // --- Step 1: Upload to Arweave ---
        const stats = await fs.stat(filePath);
        const txid = await uploadToArweave(filePath, walletPath);

        // --- Step 2: Register with AO ---
        const fileName = require('path').basename(filePath);
        await registerWithAO(processId, txid, fileName, stats.size);

        console.log('\n🎉 Process complete!');
        console.log(`Arweave TXID: https://arweave.net/${txid}`);

    } catch (error) {
        console.error('\n❌ An error occurred during the process:');
        console.error(error.message);
        process.exit(1);
    }
}

main();