const { ethers } = require("ethers");
const darkForestAbiJson = require("../abi/darkforest_abi.json");
const cryptoUnicornAbiJson = require("../abi/cryptoUnicornAbi.json");
require("dotenv").config();
const logger = require("./utils/logger.js").logger;

// get json rpc provider for mumbai testnet
const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);

// create a new wallet from the private key defined in the .env file
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const address = wallet.address;

// define the test contract addresses
const DARK_FOREST_CONTRACT = "0xd4F109Ef933161A572f090fE3Dffe7e33814b9F6";
const UNICORN_NFT_CONTRACT = "0x81511Ab37A82fa9b917B98be86a881Dc6177B022";

// create the contract objects
const darkForestContract = new ethers.Contract(DARK_FOREST_CONTRACT, darkForestAbiJson, wallet);
const unicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, cryptoUnicornAbiJson, wallet);
const gas_price = ethers.utils.parseUnits(String(40.0), 'gwei');

async function main() {

    const stakingPeriod = (await darkForestContract.stakePeriodSeconds()).toNumber();
    // interval needs to be in milliseconds
    const interval = (stakingPeriod * 1000 ) + 60000; // +1 minute window to ensure the stakingPeriod has completed for all unicorns
    
    logger.info({message: `Your address: ${address}`});
    logger.info({message: `Interval: ${interval}`});
    logger.info({message: `Staking Period defined in contract (seconds): ${stakingPeriod}`});
    logger.info({message: `This script will unstake/restake every ${interval/1000} seconds`});

    // perform once immediately
    autoStake()
    // the perform every interval
    const intervalObj = setInterval(() => {
        autoStake();
    }, interval);
}

async function autoStake() {
    let date = new Date();
    logger.info({message: `Auto Stake Trigger - ${date}`});

    // find out how many unicorns the user has staked
    const stakedUnicorns = (await darkForestContract.numStaked(address)).toNumber();
    
    // if user has unicorns staked, unstake them if possible
    if (stakedUnicorns > 0) {
        unstakeUnicorns(stakedUnicorns);
    } 
    
    // If the user has unicorns in their wallet, we assume they want to stake them.
    const balanceOf = (await unicornNFTContract.balanceOf(address)).toNumber();

    if (balanceOf > 0) {
        stakeUnicorns(balanceOf);
    } else {
        logger.info({message: `User has no unicorns to stake`});
    }
}

async function unstakeUnicorns(stakedUnicorns) {
    let unicorns = [];
    logger.info({message: `User has ${stakedUnicorns} unicorns staked in the Dark Forest contract`});
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
    logger.info({message: `${count} unicorns can be unstaked`});

    for (let i = 0; i < stakedUnicorns; i++) {
        const unicorn = unicorns[i];
        if (unicorn.canUnstake) {
            logger.info({message: `Unstaking Unicorn #${unicorn.tokenId}...`});
            // Unstake
            try {
                const tx = await darkForestContract.exitForest(unicorn.tokenId);
                logger.info({message: `https://mumbai.polygonscan.com/tx/${tx.hash}`});
                await tx.wait();
            } catch (err) {
                logger.info({message: err});
                process.exit(1);
            }
        }
    }
    logger.info({message: `Unstaking complete`});
}

async function stakeUnicorns(balanceOf) {
    let unicorns = [];
    for (let i = 0; i < balanceOf; i++) {
        const tokenId = (await unicornNFTContract.tokenOfOwnerByIndex(address, i)).toNumber();
        unicorns.push({
            i,
            tokenId
        })
    }
    logger.info({message: `The user has ${unicorns.length} unicorns to stake`});

    for (let i = 0; i < balanceOf; i++) {
        const unicorn = unicorns[i];
        logger.info({message: `Staking Unicorn #${unicorn.tokenId}...`});
        try {
            // Stake
            const tx = await unicornNFTContract['safeTransferFrom(address,address,uint256,bytes)'](
                address, // from
                DARK_FOREST_CONTRACT, // to
                unicorn.tokenId, // tokenId
                gas_price
            );
            logger.info({message: `https://mumbai.polygonscan.com/tx/${tx.hash}`});
            await tx.wait();
        } catch (err) {
            logger.info({message: err});
            process.exit(1);
        }
    }
    logger.info({message: `Staking complete`});
}

main();

function sum(a, b) {
    return a + b;
}
module.exports = sum;
