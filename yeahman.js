const ethers = require('ethers');
const { Keypair } = require('@solana/web3.js');
const bip39 = require('bip39');
const readline = require('readline');

// Create an interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to check if it's a valid Ethereum private key
function isValidEthPrivateKey(privateKey) {
    return /^0x[a-fA-F0-9]{64}$/.test(privateKey);
}

// Function to check if it's a valid Solana private key
function isValidSolPrivateKey(privateKey) {
    try {
        const keyBytes = JSON.parse(privateKey);
        const keypair = Keypair.fromSecretKey(new Uint8Array(keyBytes));
        return keypair.secretKey.length === 64; // Solana private key should be 64 bytes
    } catch (e) {
        return false;
    }
}

// Convert Ethereum private key to mnemonic
function ethPrivateKeyToMnemonic(privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.mnemonic.phrase;
}

// Convert Solana private key to mnemonic
async function solPrivateKeyToMnemonic(privateKey) {
    const keyBytes = JSON.parse(privateKey);
    const seed = Buffer.from(keyBytes.slice(0, 32)); // Use the first 32 bytes for seed generation
    return bip39.entropyToMnemonic(seed.toString('hex'));
}

// Function to handle conversion based on private key input
async function handlePrivateKeyInput(privateKey) {
    if (isValidEthPrivateKey(privateKey)) {
        console.log("Detected Ethereum private key.");
        const mnemonic = ethPrivateKeyToMnemonic(privateKey);
        console.log("Your 12-word mnemonic seed phrase is:", mnemonic);
    } else if (isValidSolPrivateKey(privateKey)) {
        console.log("Detected Solana private key.");
        const mnemonic = await solPrivateKeyToMnemonic(privateKey);
        console.log("Your 12-word mnemonic seed phrase is:", mnemonic);
    } else {
        console.log("Invalid private key format. Please try again.");
    }
    promptUserForKey();
}

// Prompt the user to input a private key
function promptUserForKey() {
    rl.question('\nEnter your private key (or type "cancel" to quit): ', async (inputKey) => {
        if (inputKey.toLowerCase() === 'cancel') {
            console.log('Exiting...');
            rl.close();
        } else {
            await handlePrivateKeyInput(inputKey);
        }
    });
}

// Start the script
console.log("Welcome to the Private Key to Mnemonic Converter!");
console.log("You can input Ethereum or Solana private keys, and they will be converted to 12-word mnemonic seed phrases.");
promptUserForKey();