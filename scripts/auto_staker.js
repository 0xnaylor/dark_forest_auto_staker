const { ethers } = require("ethers");
require("@nomiclabs/hardhat-ethers");
const darkForestAbiJson = require("../artifacts/contracts/DarkForest.sol/DarkForest.json");
const cryptoUnicornAbiJson = require("../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");
require("dotenv").config();

async function main() {

    // get json rpc provider for mumbai testnet
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);

    // create a new wallet from the private key defined in the .env file
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const address = wallet.address;
    
    console.log("Your address: ", address);

    // define the test contract addresses
    const DARK_FOREST_CONTRACT = "0xD1273B20a5d320f52A57200c4E301D08247C10B7";
    const UNICORN_NFT_CONTRACT = "0x3C77b23c6303A20b5C72346Bc17FA16B0f950D35";

    // define contract abi's
    const darkForestAbi = darkForestAbiJson.abi;
    const cryptoUnicornAbi = cryptoUnicornAbiJson.abi;

    // create the contract objects
    const darkForestContract = new ethers.Contract(DARK_FOREST_CONTRACT, darkForestAbi, wallet);
    const unicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, cryptoUnicornAbi, wallet);

    const gas_price = ethers.utils.parseUnits(String(40.0), 'gwei');
    
    const stakingPeriod = (await darkForestContract.stakePeriodSeconds()).toNumber();
    // interval needs to be in milliseconds
    const interval = (stakingPeriod * 1000 ) + 60000; // +1 minute window to ensure the stakingPeriod has completed for all unicorns

    console.log(`interval: ${interval}`)

    console.log(`Staking Period defined in contract (seconds): ${stakingPeriod}`);
    console.log(`This script will unstake/restake every ${interval/1000} seconds`);

    // perform once immediately
    autoStake()
    // the perform every interval
    const intervalObj = setInterval(() => {
        autoStake();
    }, interval);
      
    // can have a button that actives this.
    // clearInterval(intervalObj);
    
    async function autoStake() {
        let date = new Date();
        console.log("*******************************************")
        console.log(`Auto Stake Trigger ${date}`);

        // find out how many unicorns the user has staked
        const stakedUnicorns = (await darkForestContract.numStaked(address)).toNumber();
        
        // if user has unicorns staked, unstake them if possible
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
        
        // If the user has unicorns in their wallet, we assume they want to stake them.
        const balanceOf = (await unicornNFTContract.balanceOf(address)).toNumber();

        if (balanceOf > 0) {
            let unicorns = [];
            for (let i = 0; i < balanceOf; i++) {
                const tokenId = (await unicornNFTContract.tokenOfOwnerByIndex(address, i)).toNumber();
                unicorns.push({
                    i,
                    tokenId
                })
            }
            console.log(`The user has ${unicorns.length} unicorns to stake`);

            for (let i = 0; i < balanceOf; i++) {
                const unicorn = unicorns[i];
                console.log(`Staking Unicorn #${unicorn.tokenId}...`);
                try {
                    // Stake
                    const tx = await unicornNFTContract['safeTransferFrom(address,address,uint256,bytes)'](
                        address, // from
                        DARK_FOREST_CONTRACT, // to
                        unicorn.tokenId, // tokenId
                        gas_price
                    );
                    console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
                    await tx.wait();
                } catch (err) {
                    console.error(err);
                    process.exit(1);
                }
            }
            console.log(`Staking complete`)
        } else {
            console.log(`User has no unicorns to stake`)
        }
    }
}

export default main;

// main();