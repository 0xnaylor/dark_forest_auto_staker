const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const darkForestAbiJson = require("../../abi/darkforest_abi.json");
require("dotenv").config();

async function main() {
    console.log("Running set_staking_period script");

    // get json rpc provider for mumbai testnet
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);

    // create a new wallet from the private key defined in the .env file
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;

    // define the test contract addresses
    const DARK_FOREST_CONTRACT = "0xd4F109Ef933161A572f090fE3Dffe7e33814b9F6";

    // create the contract objects
    const DarkForestContract = new ethers.Contract(DARK_FOREST_CONTRACT, darkForestAbiJson, wallet);

    // check current stake period
    console.log(`Unicorns are currently staked for ${await DarkForestContract.stakePeriodSeconds()} seconds`)

    // set new stake period of 1 minute (in seconds)
    const stakePeriod = 1 * 60;
    try {
        const tx = await DarkForestContract.setStakePeriodSeconds(stakePeriod);
        console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
        await tx.wait();
    } catch (err) {
        console.error(err);
    }

    // check current stake period
    console.log(`Unicorns are currently staked for ${await DarkForestContract.stakePeriodSeconds()} seconds`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });