const { ethers } = require("ethers");
const darkForestAbiJson = require("../../abi/darkforest_abi.json");
const config = require("../../config");
require("dotenv").config();

async function main() {
    console.log("Running set_staking_period script");
    const environment = process.argv[2];
    const newStakingPeriod  = process.argv[3];

    let darkForestContractAddr = "";
    let provider;
    let signer;
    let wallet;
    let darkForestContract
    let address

    // set up the environment
    if (environment === 'dev') {
      // running in dev
      darkForestContractAddr = config.DEV_DARK_FOREST_CONTRACT;
      provider = new ethers.providers.JsonRpcProvider();
      signer = provider.getSigner();
      address = await signer.getAddress();
      darkForestContract = new ethers.Contract(darkForestContractAddr, darkForestAbiJson, provider);
    } else {
      // running in test
      darkForestContractAddr = config.MUMBAI_DARK_FOREST_CONTRACT;
      provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
      wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      address = wallet.address;
      darkForestContract = new ethers.Contract(darkForestContractAddr, darkForestAbiJson, wallet);
    }

    // check current stake period
    console.log(`Current staking period is set to: ${await darkForestContract.stakePeriodSeconds()} seconds`)

    // set new stake period of 1 hour (in seconds)
    const stakePeriod = 60 * 60;
    try {
        const tx = await darkForestContract.setStakePeriodSeconds(newStakingPeriod);
        console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
        await tx.wait();
    } catch (err) {
        console.error(err);
    }

    // check current stake period
    console.log(`Staking period is changed to: ${await darkForestContract.stakePeriodSeconds()} seconds`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });