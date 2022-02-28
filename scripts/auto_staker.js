require("dotenv").config();
const logger = require("./utils/logger.js").logger;
const config = require("../config");
const stakeUnicorns = require("./stakeUnicorns");
const unstakeUnicorns = require("./unstakeUnicorns")

let darkForestContractAddr = "";
let unicornContractAddr = "";
let unicornNFTContract;
let darkForestContract;
let address;
let intervalMS;

async function main(environment) {

    console.log(`Running in: ${environment}`)

    // set up the environment
    if (environment === 'dev') {
        // running in dev
        address = await config.devSigner.getAddress();
        darkForestContractAddr = config.DEV_DARK_FOREST_CONTRACT;
        unicornContractAddr = config.DEV_UNICORN_NFT_CONTRACT;
        darkForestContract = congif.devDarkForestContract;
        unicornNFTContract = config.devUnicornNFTContract;
    } else if (environment === 'test') {
        // running in test
        address = config.testAddress;
        darkForestContractAddr = config.MUMBAI_DARK_FOREST_CONTRACT;
        unicornContractAddr = config.MUMBAI_UNICORN_NFT_CONTRACT;
        darkForestContract = config.testDarkForestContract;
        unicornNFTContract = config.testUnicornNFTContract;
    } else if (environment === 'main') {
        // running against mainnet
        address = config.mainnetAddress;
        darkForestContractAddr = config.MAINNET_DARK_FOREST_CONTRACT;
        unicornContractAddr = config.MAINNET_UNICORN_NFT_CONTRACT;
        darkForestContract = config.mainnetDarkForestContract;
        unicornNFTContract = config.mainnetUnicornContract;
    }
    
    console.log(`Running in environment: ${environment}`)
    console.log(`Dark Forest contract address: ${darkForestContractAddr}`)
    console.log(`Unicorn contract address: ${unicornContractAddr}`)

    // retrieve staking period from contract (returns seconds so convert to milliseconds)
    const stakingPeriodMS = (await darkForestContract.stakePeriodSeconds()) * 1000;
    
    // add 5 minutes (ensures the stakingPeriod has completed for all staked unicorns)
    intervalMS = (stakingPeriodMS) + 300000;
    
    logger.info({message: `Crypto Unicorns Auto Staker Log`});
    logger.info({message: "==================================================="})
    logger.info({message: `Your wallet address: ${address}`});
    logger.info({message: `Staking Period defined in contract: ${formatTime(stakingPeriodMS)}`});
    logger.info({message: `This script will unstake/restake every ${formatTime(intervalMS)}`});

    // perform once immediately
    autoStake()
    // then perform every interval
    const intervalObj = setInterval(() => {
        autoStake();
    }, intervalMS);
}

async function autoStake() {
    let trigger = Date.now();
    logger.info({message: "==================================================="})
    logger.info({message: `Auto Stake Trigger - ${new Date()}`});

    // find out how many unicorns the user has staked
    const stakedUnicorns = (await darkForestContract.numStaked(address)).toNumber();
    
    // if user has unicorns staked, unstake them if possible
    if (stakedUnicorns > 0) {
        await unstakeUnicorns(stakedUnicorns, address, darkForestContract);
    } else {
        logger.info({message: `User has no staked unicorns`});
    }
    
    // If the user has unicorns in their wallet, we assume they want to stake them.
    const balanceOf = (await unicornNFTContract.balanceOf(address)).toNumber();

    if (balanceOf > 0) {
        await stakeUnicorns(balanceOf, address, unicornNFTContract, darkForestContractAddr);
    } else {
        logger.info({message: `User has no unicorns to stake`});
    }

    let nextTrigger = new Date (trigger + intervalMS);
    logger.info({message: `Next run at: ${nextTrigger}`})
}

const formatTime = (interval) => {
    // 1 second = 1000 ms
    const intervalSeconds = interval / 1000;
    // 1 minute = 60000 ms
    const intervalMinutes = (interval / 60000).toFixed(2);
    // 1 hour = 3600000 ms
    const intervalHours = (interval / 3600000).toFixed(2);
    
    if (interval > 3600000) {
        // display message in hours
        return `${intervalHours} hours`
    } else if(interval > 60000 && interval < 3599999) {
        // display message in minutes
        return `${intervalMinutes} minutes`
    } else {
        return `${intervalSeconds} seconds`
    }
}

module.exports = main
