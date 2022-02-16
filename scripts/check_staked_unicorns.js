const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const dark_forest_artifact = require("../artifacts/contracts/DarkForest.sol/DarkForest.json");
require("dotenv").config();

async function main() {
    console.log("Running stake_unicorn script");

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

    // check number of unicorns staked by address
    console.log(`Number of Unicorns Staked (check 1): ${await DarkForestContract.numStaked(address)}`);

    // check current stake period
    console.log(`Unicorns are staked for ${await DarkForestContract.stakePeriodSeconds()}`)

    // get tokenId of the 1st Unicorn
    const tokenId = await DarkForestContract.tokenOfStakerByIndex(address, 0);
    console.log(`TokenId of staked Unicorn ${tokenId}`)

    // Create a new JavaScript Date object based on the timestamp, 
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    let unix_timestamp = await DarkForestContract.unstakesAt(tokenId);
    var date = new Date(unix_timestamp * 1000);
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'};
    var formattedDateTime = date.toLocaleDateString("en-US", options);
    console.log(`My Unicorn with Id "${tokenId}" unstakes at: ${formattedDateTime}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });