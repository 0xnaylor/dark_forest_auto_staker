require("dotenv").config();
const logger = require("./utils/logger.js").logger;
const config = require("../config");
const stakeUnicorns = require("./stakeUnicorns");
const unstakeUnicorns = require("./unstakeUnicorns")

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
        darkForestContract = congif.devDarkForestContract;
        unicornNFTContract = config.devUnicornNFTContract;
    } else {
        // running in test
        address = config.testAddress;
        darkForestContractAddr = config.MUMBAI_DARK_FOREST_CONTRACT;
        unicornContractAddr = config.MUMBAI_UNICORN_NFT_CONTRACT;
        darkForestContract = config.testDarkForestContract;
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
        await unstakeUnicorns(stakedUnicorns, address, darkForestContract);
    } 
    
    // If the user has unicorns in their wallet, we assume they want to stake them.
    const balanceOf = (await unicornNFTContract.balanceOf(address)).toNumber();

    if (balanceOf > 0) {
        await stakeUnicorns(balanceOf, address, unicornNFTContract, darkForestContractAddr);
    } else {
        logger.info({message: `User has no unicorns to stake`});
    }
}

module.exports = main
