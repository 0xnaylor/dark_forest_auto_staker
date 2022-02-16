const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const dark_forest_artifact = require("../artifacts/contracts/DarkForest.sol/DarkForest.json");
const crypto_unicorns_artifact = require("../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");

require("dotenv").config();

async function main() {
    console.log("Running mint_test_unicorn script");

    // wallet address: 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
    // Crypto Unicorns address: 0x3C77b23c6303A20b5C72346Bc17FA16B0f950D35
    // Unicorn Milk address: 0xB32e4d12D2733FE7711ba7EdFd2686D0829CF2E1
    // DarkForest deployed to: 0xD1273B20a5d320f52A57200c4E301D08247C10B7

    // get json rpc provider for mumbai testnet
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);

    // create a new wallet from the private key defined in the .env file
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;

    // define the test contract addresses
    const DARK_FOREST_CONTRACT = "0xD1273B20a5d320f52A57200c4E301D08247C10B7";
    const UNICORN_NFT_CONTRACT = "0x3C77b23c6303A20b5C72346Bc17FA16B0f950D35";

    // define contract abi's
    const DarkForestAbiJson = dark_forest_artifact.abi;
    const CryptoUnicornAbiJson = crypto_unicorns_artifact.abi;

    // create the contract objects
    const DarkForestContract = new ethers.Contract(DARK_FOREST_CONTRACT, DarkForestAbiJson, wallet);
    const UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, CryptoUnicornAbiJson, wallet);

    // create uri for unicorn1
    const unicorn1URI = {
        "name": "Unicorn 1",
        "description": "Test Unicorn 1 NFT",
        "image": "https://gateway.pinata.cloud/ipfs/QmeZ8EJ6PTtdJcYPPvrbeRMvVAJV9azSuQcUgExwu4tp3C"
    }

    // mint the unicorn
    await UnicornNFTContract.safeMint(address, unicorn1URI);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });