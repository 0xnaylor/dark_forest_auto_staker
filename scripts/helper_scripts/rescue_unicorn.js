const config = require("../config.js");
const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const darkForestAbiJson = require("../artifacts/contracts/DarkForest.sol/DarkForest.json");
const cryptoUnicornAbiJson = require("../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");
const dotenv = require("dotenv");

dotenv.config();

async function main() {
    console.log("Running rescue_unicorn script");

    // wallet address: 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
    // Crypto Unicorns address: 0x3C77b23c6303A20b5C72346Bc17FA16B0f950D35
    // Unicorn Milk address: 0xB32e4d12D2733FE7711ba7EdFd2686D0829CF2E1
    // DarkForest deployed to: 0xD1273B20a5d320f52A57200c4E301D08247C10B7

    // get json rpc provider for mumbai testnet
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);

    // create a new wallet from the private key defined in the .env file
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;

    // define the test contract addresses
    const DARK_FOREST_CONTRACT = "0xD1273B20a5d320f52A57200c4E301D08247C10B7";
    const UNICORN_NFT_CONTRACT = "0x3C77b23c6303A20b5C72346Bc17FA16B0f950D35";

    // define contract abi's
    const darkForestAbi = darkForestAbiJson.abi;
    const cryptoUnicornAbi = cryptoUnicornAbiJson.abi;

    // create the contract objects
    const DarkForestContract = new ethers.Contract(DARK_FOREST_CONTRACT, darkForestAbi, wallet);
    const UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, cryptoUnicornAbi, wallet);

    // check number of unicorns staked by address
    console.log(`Number of Unicorns Staked (before unstaking): ${await DarkForestContract.numStaked(address)}`);

    // confirm how many unicorns are owned by the address
    const tokensOwnedByAddress = await UnicornNFTContract.balanceOf(address);
    console.log(`Address: ${address} owns ${tokensOwnedByAddress} Unicorn(s) before rescue`);

    // get tokenId of staked Unicorn
    const tokenId = await DarkForestContract.tokenOfStakerByIndex(address, 0);
    console.log(`TokenId of staked Unicorn ${tokenId}`)

    console.log(`About to rescue tokenId "${tokenId}" from the DarkForest contract: ${DARK_FOREST_CONTRACT}`)
    // unstake a unicorn
    try {
        const tx = await DarkForestContract.rescueUnicorn(tokenId);
        console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
        await tx.wait();
    } catch (err) {
        console.error(err);
    }

    // check number of unicorns staked by address
    console.log(`Number of Unicorns Staked (after unstaking): ${await DarkForestContract.numStaked(address)}`);

    // confirm how many unicorns are owned by the address
    console.log(`Address: ${address} owns ${tokensOwnedByAddress} Unicorn(s) after rescue`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });