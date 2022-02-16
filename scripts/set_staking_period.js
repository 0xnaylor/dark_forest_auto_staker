const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const dark_forest_artifact = require("../artifacts/contracts/DarkForest.sol/DarkForest.json");
require("dotenv").config();

async function main() {
    console.log("Running set_staking_period script");

    // get json rpc provider for mumbai testnet
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);

    // create a new wallet from the private key defined in the .env file
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;

    // define the test contract addresses
    const DARK_FOREST_CONTRACT = "0xD1273B20a5d320f52A57200c4E301D08247C10B7";

    // define contract abi's
    const DarkForestAbiJson = dark_forest_artifact.abi;

    // create the contract objects
    const DarkForestContract = new ethers.Contract(DARK_FOREST_CONTRACT, DarkForestAbiJson, wallet);

    // check current stake period
    console.log(`Unicorns are currently staked for ${await DarkForestContract.stakePeriodSeconds()} seconds`)

    // set new stake period of 2 minutes (in seconds)
    const stakePeriod = 2 * 60;
    try {
        const tx = await DarkForestContract.setStakePeriodSeconds(stakePeriod);
        console.log(`https://mumbai.polygonscan.com/${tx.hash}`)
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