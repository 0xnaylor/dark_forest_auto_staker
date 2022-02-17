const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const dark_forest_artifact = require("../../artifacts/contracts/DarkForest.sol/DarkForest.json");
const crypto_unicorns_artifact = require("../../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");

require("dotenv").config();

async function main() {
    console.log("Running check_unicorn_balance script");

    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;
    const UNICORN_NFT_CONTRACT = "0x3C77b23c6303A20b5C72346Bc17FA16B0f950D35";
    const CryptoUnicornAbiJson = crypto_unicorns_artifact.abi;
    const UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, CryptoUnicornAbiJson, wallet);

    // confirm how many unicorns are owned by the address
    const tokensOwned = await UnicornNFTContract.balanceOf(address);
    console.log(`Address: ${address} has ${tokensOwned} unstaked Unicorns`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });