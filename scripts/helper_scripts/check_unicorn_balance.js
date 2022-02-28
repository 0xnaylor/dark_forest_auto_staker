const { ethers } = require("ethers");
const config = require("../../config");
const crypto_unicorns_artifact = require("../../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");
require("dotenv").config();

async function main() {

    console.log("Running check_unicorn_balance script");
    const environment = process.argv[2];    
    let UnicornNFTContract;
    let address

    console.log(`Running in environment: ${environment}`)
    if (environment === 'dev') {
      // running in test
      UnicornNFTContract = config.devUnicornNFTContract;
      address = await config.devSigner.getAddress();
      console.log(`dev address: ${address}`)

    } else {
      // running in test
      UnicornNFTContract = config.testUnicornNFTContract;
      address = config.testAddress;
      console.log(`test address: ${address}`)
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