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
    const DARK_FOREST_CONTRACT = "0x56FcC29948f88E4090A5DCde3D5eA7258A9b9B50";

    // define contract abi's
    const DarkForestAbiJson = dark_forest_artifact.abi;

    // create the contract objects
    const DarkForestContract = new ethers.Contract(DARK_FOREST_CONTRACT, DarkForestAbiJson, wallet);

    // check number of unicorns staked by address
    console.log(`Number of Unicorns Staked (check 1): ${await DarkForestContract.numStaked(address)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });