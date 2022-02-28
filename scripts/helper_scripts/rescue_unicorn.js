const config = require("../../config.js");
const { ethers } = require("ethers");
const crypto_unicorns_artifact = require("../../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");
const dark_forest_artifact = require("../../artifacts/contracts/DarkForest.sol/DarkForest.json");
const dotenv = require("dotenv");

dotenv.config();

async function main() {
    console.log("Running rescue_unicorn script");

    const environment = process.argv[2];
    const cryptoUnicornAbiJson = crypto_unicorns_artifact.abi;
    const darkForestAbiJson = dark_forest_artifact.abi;
    
    let darkForestContractAddr = "";
    let unicornContractAddr = ""
    let provider;
    let signer;
    let wallet;
    let unicornNFTContract;
    let darkForestContract
    let address

    // set up the environment
    if (environment === 'dev') {
      // running in dev
      darkForestContractAddr = config.DEV_DARK_FOREST_CONTRACT;
      unicornContractAddr = config.DEV_UNICORN_NFT_CONTRACT;
      provider = new ethers.providers.JsonRpcProvider();
      signer = provider.getSigner();
      address = await signer.getAddress();
      darkForestContract = new ethers.Contract(darkForestContractAddr, darkForestAbiJson, provider);
      unicornNFTContract = new ethers.Contract(unicornContractAddr, cryptoUnicornAbiJson, provider);
    } else {
      // running in test
      darkForestContractAddr = config.MUMBAI_DARK_FOREST_CONTRACT;
      unicornContractAddr = config.MUMBAI_UNICORN_NFT_CONTRACT;
      provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
      wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      address = wallet.address;
      darkForestContract = new ethers.Contract(darkForestContractAddr, darkForestAbiJson, wallet);
      unicornNFTContract = new ethers.Contract(unicornContractAddr, cryptoUnicornAbiJson, wallet);
    }

    // // define the test contract addresses
    // const DARK_FOREST_CONTRACT = "0xd4F109Ef933161A572f090fE3Dffe7e33814b9F6";
    // const UNICORN_NFT_CONTRACT = "0x81511Ab37A82fa9b917B98be86a881Dc6177B022";

    // // define contract abi's
    // const darkForestAbi = darkForestAbiJson.abi;
    // const cryptoUnicornAbi = cryptoUnicornAbiJson.abi;

    // // create the contract objects
    // const DarkForestContract = new ethers.Contract(DARK_FOREST_CONTRACT, darkForestAbi, wallet);
    // const UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, cryptoUnicornAbi, wallet);

    // check number of unicorns staked by address
    console.log(`Number of Unicorns Staked (before unstaking): ${await darkForestContract.numStaked(address)}`);

    // confirm how many unicorns are owned by the address
    let tokensOwnedByAddress = await unicornNFTContract.balanceOf(address);
    console.log(`Address: ${address} owns ${tokensOwnedByAddress} Unicorn(s) before rescue`);

    // get tokenId of staked Unicorn
   

    const stakedUnicorns = (await darkForestContract.numStaked(address)).toNumber();
    for (let i = 0; i < stakedUnicorns; i++) {
      const tokenId = await darkForestContract.tokenOfStakerByIndex(address, 0);
      console.log(`Force unstaking tokenId "${tokenId}" from the DarkForest contract`)
      // unstake a unicorn
      try {
        const tx = await darkForestContract.rescueUnicorn(tokenId);
        console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
        await tx.wait();
      } catch (err) {
        console.error(err);
      }
      console.log("Rescue complete")
    }
    
    // check number of unicorns staked by address
    console.log(`Number of remaining unicorns staked: ${await darkForestContract.numStaked(address)}`);

    // confirm how many unicorns are owned by the address
    tokensOwnedByAddress = await unicornNFTContract.balanceOf(address);
    console.log(`Wallet: ${address} owns ${tokensOwnedByAddress} Unicorn(s) after rescue`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });