const { ethers } = require("ethers");
const dark_forest_artifact = require("../../artifacts/contracts/DarkForest.sol/DarkForest.json");
require("dotenv").config();
// const fs = require('fs');
// const { stdout, stderr } = require("process");

async function main() {

    // const logfile = fs.createWriteStream('./unicorn_auto_staker.log', { flags: 'a' });
    // // redirect stdout / stderr
    // stdout.pipe(logfile);
    // stderr.pipe(logfile);


    console.log("Running stake_unicorn script");

    // get json rpc provider for mumbai testnet
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);

    // create a new wallet from the private key defined in the .env file
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;

    // define the test contract addresses
    // const DARK_FOREST_CONTRACT = "0xd4F109Ef933161A572f090fE3Dffe7e33814b9F6";
    const DARK_FOREST_CONTRACT = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    // define contract abi's
    const DarkForestAbiJson = dark_forest_artifact.abi;

    // create the contract objects
    const DarkForestContract = new ethers.Contract(DARK_FOREST_CONTRACT, DarkForestAbiJson, wallet);

    // check number of unicorns staked by address
    const numStaked = await DarkForestContract.numStaked(address);
    console.log(`address: ${address} has ${numStaked} unicorns staked`)

    // check current stake period
    console.log(`Staking period for Unicorns is set to ${await DarkForestContract.stakePeriodSeconds()} seconds`)

    // get tokenId of the 1st Unicorn
    if (numStaked > 0) {    
      const tokenId = await DarkForestContract.tokenOfStakerByIndex(address, 0);
      console.log(`TokenId of staked Unicorn ${tokenId}`)

      // Create a new JavaScript Date object based on the timestamp, 
      // multiplied by 1000 so that the argument is in milliseconds, not seconds.
      let unix_timestamp = await DarkForestContract.unstakesAt(tokenId);
      var date = new Date(unix_timestamp * 1000);
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'};
      var formattedDateTime = date.toLocaleDateString("en-US", options);
      console.log(`My Unicorn with Id "${tokenId}" unstakes at: ${formattedDateTime}`)
    } else {
      console.log("No Unicorns staked");
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });