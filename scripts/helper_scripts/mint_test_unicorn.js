const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const crypto_unicorns_artifact = require("../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");

require("dotenv").config();

async function main() {
    console.log("Running mint_test_unicorn script");

    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;

    const UNICORN_NFT_CONTRACT = "0x3C77b23c6303A20b5C72346Bc17FA16B0f950D35";
    const CryptoUnicornAbiJson = crypto_unicorns_artifact.abi;
    const UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, CryptoUnicornAbiJson, wallet);

    // create uri for unicorn1
    const uri = {
        "name": "Unicorn",
        "description": "Test Unicorn NFT",
        "image": "https://gateway.pinata.cloud/ipfs/QmeZ8EJ6PTtdJcYPPvrbeRMvVAJV9azSuQcUgExwu4tp3C"
    }

    // mint
    await UnicornNFTContract.safeMint(address, uri);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });