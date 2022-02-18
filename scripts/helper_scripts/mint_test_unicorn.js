const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const crypto_unicorns_artifact = require("../../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");

require("dotenv").config();

async function main() {
    console.log("Running mint_test_unicorn script");

    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;

    const UNICORN_NFT_CONTRACT = "0x81511Ab37A82fa9b917B98be86a881Dc6177B022";
    const CryptoUnicornAbiJson = crypto_unicorns_artifact.abi;
    const UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, CryptoUnicornAbiJson, wallet);

    // create uri for unicorn1
    const uri = {
        "name": "Unicorn",
        "description": "Test Unicorn NFT",
        "image": "https://gateway.pinata.cloud/ipfs/QmeZ8EJ6PTtdJcYPPvrbeRMvVAJV9azSuQcUgExwu4tp3C"
    }

    // mint
   

    try {
      const tx =  await UnicornNFTContract.safeMint(address, uri);
      console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
      await tx.wait();
      console.log(`Unicorn minted`)
  } catch (err) {
      console.error(err);
      process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });