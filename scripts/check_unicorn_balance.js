const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const dark_forest_artifact = require("../artifacts/contracts/DarkForest.sol/DarkForest.json");
const crypto_unicorns_artifact = require("../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");

require("dotenv").config();

async function main() {
    console.log("Running check_unicorn_balance script");

    // get json rpc provider for mumbai testnet
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);

    // create a new wallet from the private key defined in the .env file
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;

    // define the test contract addresses
    const UNICORN_NFT_CONTRACT = "0xa857eB8Bee42886e5a5a2Df13800Cb9Bc9dbA6C4";

    // define contract abi's
    const CryptoUnicornAbiJson = crypto_unicorns_artifact.abi;

    // create the contract object
    const UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, CryptoUnicornAbiJson, wallet);

    // confirm how many unicorns are owned by the address
    const tokensOwned = await UnicornNFTContract.balanceOf(address);
    console.log(`Address: ${address} owns ${tokensOwned} Unicorns`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });