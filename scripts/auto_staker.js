const { ethers } = require("ethers");
const darkForestAbiJson = require("../abi/darkforest_abi.json");
const cryptoUnicornAbiJson = require("../abi/cryptoUnicornAbi.json");
require("dotenv").config();
const logger = require("./utils/logger.js").logger;
const config = require("../config");

// local addresses
const DEV_DARK_FOREST_CONTRACT = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const DEV_UNICORN_NFT_CONTRACT = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// mumbai addresses - will need updating after each new deploy
const MUMBAI_DARK_FOREST_CONTRACT = "0xd4F109Ef933161A572f090fE3Dffe7e33814b9F6";
const MUMBAI_UNICORN_NFT_CONTRACT = "0x81511Ab37A82fa9b917B98be86a881Dc6177B022";
// mainnet addresses
const MAINNET_DARK_FOREST_CONTRACT = "0x8d528e98A69FE27b11bb02Ac264516c4818C3942";
const MAINNET_UNICORN_NFT_CONTRACT = "0xdC0479CC5BbA033B3e7De9F178607150B3AbCe1f";

// Locally (uncomment following 3 lines)
const provider = new ethers.providers.JsonRpcProvider();
const signer = provider.getSigner();
let address;

// Mumbai and Mainnet (uncomment following 3 lines)
// const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// const address = wallet.address;

// point the following variables at which ever address is required
const darkForestContractAddr = DEV_DARK_FOREST_CONTRACT;
const unicornContractAddr = DEV_UNICORN_NFT_CONTRACT;

// Mumbai and Mainnet (uncomment following 2 lines)
// const darkForestContract = new ethers.Contract(darkForestContractAddr, darkForestAbiJson, wallet);
// const unicornNFTContract = new ethers.Contract(unicornContractAddr, cryptoUnicornAbiJson, wallet);

// Locally (uncomment following 2 lines)
const darkForestContract = new ethers.Contract(darkForestContractAddr, darkForestAbiJson, signer);
const unicornNFTContract = new ethers.Contract(unicornContractAddr, cryptoUnicornAbiJson, signer);

const gas_price = ethers.utils.parseUnits(String(config.GAS_PRICE), 'gwei');

async function main() {

    // locally (uncomment the following line)
    address = await signer.getAddress();

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
        await stakeUnicorns(balanceOf);
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
        const tokenId = unicorns[i].tokenId;
        await stake(tokenId, address);
    }

    logger.info({message: `Staking complete`});
}

async function stake(tokenId, _address) {
    console.log(`Gas: ${gas_price}`)
    console.log(`Staking Unicorn #${tokenId}... for owner ${_address}`)
    logger.info({message: `Staking Unicorn #${tokenId}... for owner ${_address}`});
    try {
        // Stake
        const tx = await unicornNFTContract['safeTransferFrom(address,address,uint256,bytes)'](
            _address, // from
            darkForestContractAddr, // to
            tokenId,
            gas_price
        );
        logger.info({message: `https://mumbai.polygonscan.com/tx/${tx.hash}`});
        await tx.wait();
    } catch (err) {
        logger.info({message: err});
        process.exit(1);
    }
}
module.exports = main, stakeUnicorns, stake;
