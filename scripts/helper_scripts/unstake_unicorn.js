const config = require("../../config.js");
const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const darkForestAbiJson = require("../../artifacts/contracts/DarkForest.sol/DarkForest.json");
const dotenv = require("dotenv");

dotenv.config();

async function main() {
    console.log("Running stake_unicorn script");

    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;
    
    const DARK_FOREST_CONTRACT = "0xD1273B20a5d320f52A57200c4E301D08247C10B7";
    const darkForestAbi = darkForestAbiJson.abi;
    const darkForestContract = new ethers.Contract(DARK_FOREST_CONTRACT, darkForestAbi, wallet);

    // check number of unicorns staked by address
    const stakedUnicorns = (await darkForestContract.numStaked(address)).toNumber();

    if (stakedUnicorns > 0) {
      let unicorns = [];
      console.log(`User has ${stakedUnicorns} unicorns staked in the Dark Forest contract`)
      let count = 0;
      for(i = 0; i < stakedUnicorns; i++){
          const tokenId = (await darkForestContract.tokenOfStakerByIndex(address, i)).toNumber();
          const unstakedAt = (await darkForestContract.unstakesAt(tokenId)).toNumber();
          const timeNow = Math.floor(Date.now() / 1000);
          const canUnstake = timeNow > unstakedAt;

          if (canUnstake) {
              count++
          }

          unicorns.push({
              i,
              tokenId,
              canUnstake
          });
      }
      console.log(`${count} unicorns can be unstaked`)

      for (let i = 0; i < stakedUnicorns; i++) {
          const unicorn = unicorns[i];
          if (unicorn.canUnstake) {
              console.log(`Unstaking Unicorn #${unicorn.tokenId}...`)
              // Unstake
              try {
                  const tx = await darkForestContract.exitForest(unicorn.tokenId);
                  console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
                  await tx.wait();
              } catch (err) {
                  console.error(err);
                  process.exit(1);
              }
          }
      }
      console.log(`Unstaking complete`)
  } 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });