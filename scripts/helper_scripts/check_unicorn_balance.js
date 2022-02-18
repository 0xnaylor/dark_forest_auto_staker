const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const crypto_unicorns_artifact = require("../../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");

require("dotenv").config();

async function main() {
    console.log("Running check_unicorn_balance script");

    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;
    const UNICORN_NFT_CONTRACT = "0x81511Ab37A82fa9b917B98be86a881Dc6177B022";
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