const { ethers } = require("ethers");
const config = require("../../config");
const crypto_unicorns_artifact = require("../../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");
require("dotenv").config();

async function main() {

    console.log("Running check_unicorn_balance script");
    const environment = process.argv[2];
    const CryptoUnicornAbiJson = crypto_unicorns_artifact.abi;
    
    let UNICORN_NFT_CONTRACT = "";
    let provider;
    let signer;
    let wallet;
    let UnicornNFTContract;
    let address

    if (environment === 'dev') {
      // running in dev
      console.log(`Running in environment: ${environment}`)
      UNICORN_NFT_CONTRACT = config.DEV_UNICORN_NFT_CONTRACT;
      console.log(`Contract address: ${UNICORN_NFT_CONTRACT}`)
      provider = new ethers.providers.JsonRpcProvider();
      signer = provider.getSigner();
      address = await signer.getAddress();
      UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, CryptoUnicornAbiJson, provider);
    } else {
      // running in test
      console.log(`Running in environment: ${environment}`)
      UNICORN_NFT_CONTRACT = config.MUMBAI_UNICORN_NFT_CONTRACT;
      console.log(`Contract address: ${UNICORN_NFT_CONTRACT}`)
      provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
      wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      address = wallet.address;
      UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, CryptoUnicornAbiJson, wallet);
    }

    // confirm how many unicorns are owned by the address
    const tokensOwned = await UnicornNFTContract.balanceOf(address);
    console.log(`Address: ${address} has ${tokensOwned} unstaked Unicorns in their wallet`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });