const { ethers } = require("ethers");
const darkForestAbiJson = require("../abi/darkforest_abi.json");
const unicornAbiJson = require("../abi/cryptoUnicornAbi.json");
require("dotenv").config();
const logger = require("./utils/logger.js").logger;
const config = require("../config");
const stakeUnicorns = require("./stakeUnicorns");

let darkForestContractAddr = "";
let unicornContractAddr = ""
let unicornNFTContract;
let darkForestContract
let address

async function main(environment) {

    console.log(`Running in: ${environment}`)

    // set up the environment
    if (environment === 'dev') {
        // running in dev
        address = await config.devSigner.getAddress();
        darkForestContractAddr = config.DEV_DARK_FOREST_CONTRACT;
        unicornContractAddr = config.DEV_UNICORN_NFT_CONTRACT;
        darkForestContract = new ethers.Contract(darkForestContractAddr, darkForestAbiJson, provider);
        unicornNFTContract = config.devUnicornNFTContract
    } else {
        // running in test
        address = config.testAddress;
        darkForestContractAddr = config.MUMBAI_DARK_FOREST_CONTRACT;
        unicornContractAddr = config.MUMBAI_UNICORN_NFT_CONTRACT;
        darkForestContract = config.testDarkForestContract
        unicornNFTContract = config.testUnicornNFTContract;
    }
    
    console.log(`Running in environment: ${environment}`)
    console.log(`Dark Forest contract address: ${darkForestContractAddr}`)
    console.log(`Unicorn contract address: ${unicornContractAddr}`)

    // retrieve staking period from contract (in seconds)
    // currently set to 86400 seconds = 24 hours
    const stakingPeriod = await darkForestContract.stakePeriodSeconds();
    
    // convert to milliseconds and add 5 minutes (ensures the stakingPeriod has completed for all staked unicorns)
    const interval = (stakingPeriod * 1000 ) + 300000;
    
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
        await unstakeUnicorns(stakedUnicorns);
    } 
    
    // If the user has unicorns in their wallet, we assume they want to stake them.
    const balanceOf = (await unicornNFTContract.balanceOf(address)).toNumber();

    if (balanceOf > 0) {
        await stakeUnicorns(balanceOf, address, unicornNFTContract, darkForestContractAddr);
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

module.exports = main
