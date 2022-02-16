const config = require("../config.js");
const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const darkForestAbiJson = require("../artifacts/contracts/DarkForest.sol/DarkForest.json");
const cryptoUnicornAbiJson = require("../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");
const dotenv = require("dotenv");

dotenv.config();

async function main() {
    console.log("Running stake_unicorn script");

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
    console.log(`Number of Unicorns Staked (check 1): ${await DarkForestContract.numStaked(address)}`);

    // confirm how many unicorns are owned by the address
    const tokensOwnedByAddress = await UnicornNFTContract.balanceOf(address);
    console.log(`Address: ${address} owns ${tokensOwnedByAddress} Unicorn(s)`);

    // find out tokenId of the 1st token
    const tokenId = await UnicornNFTContract.tokenOfOwnerByIndex(address, 0);
    console.log(`Token ID of 1st token owned by ${address}: ${tokenId} `)

    // console.log(`Gas price retrieved from config file: ${config.GAS_PRICE}`)
    // const gas_price = ethers.utils.parseUnits(String(40.0), 'gwei');
    // console.log(`Gas Price: ${gas_price}`)


    // for ambiguous functions (two functions with the same name), the signature must also be specified
    // message = await contract['getMessage(string)']('nice');

    console.log(`Crytpo Unicorns contract address: ${await DarkForestContract.CryptoUnicornsAddress}`)

    console.log(`About to ask the contract at ${UnicornNFTContract.address} to try and safeTransfer the ownership of tokenId ${tokenId} from ${address} to ${DARK_FOREST_CONTRACT}`)
    //stake a unicorn
    try {
        const tx = await UnicornNFTContract['safeTransferFrom(address,address,uint256,bytes)'](
            address, // from
            DARK_FOREST_CONTRACT, // to
            tokenId, // tokenId
            40000000000
        );
        console.log(`https://mumbai.polygonscan.com/${tx.hash}`)
        await tx.wait();
    } catch (err) {
        console.error(err);
    }

    

    // check number of unicorns staked by address
    console.log(`Number of Unicorns Staked (check 2): ${await DarkForestContract.numStaked(address)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });