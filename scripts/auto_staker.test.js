// const sum = require("./auto_staker");
const { ethers } = require("ethers");
const crypto_unicorns_artifact = require("../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");
const dark_forest_artifact = require("../artifacts/contracts/DarkForest.sol/DarkForest.json");

require("dotenv").config();


const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const address = wallet.address;
const UNICORN_NFT_CONTRACT = "0x81511Ab37A82fa9b917B98be86a881Dc6177B022";
const DARK_FOREST_CONTRACT = "0xd4F109Ef933161A572f090fE3Dffe7e33814b9F6";
const CryptoUnicornAbiJson = crypto_unicorns_artifact.abi;
const DarkForestAbiJson = dark_forest_artifact.abi;
const UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, CryptoUnicornAbiJson, wallet);
const DarkForestContract = new ethers.Contract(DARK_FOREST_CONTRACT, DarkForestAbiJson, wallet);

// set default test timeout to 10 seconds
jest.setTimeout(10000)


// test('adds 1 + 2 to equal 3', () => {
//   expect(sum(1, 2)).toBe(3);
// });

// scenarios to test

// 1. Staking
//    The user starts with 5 unicorns in the wallet, unstaked. (wallet balance = 5, staked balance = 0)
//    the stakeUnicorns function should stake all 5
//    This should result in wallet balance = 0, staked balance = 5

// 2. Unstaking successful
//    The user starts with 0 unicorns in the wallet because they are all staked. (wallet balance = 0, staked balance = 5)
//    If the correct amount of time has passed
//    the unStakeUnicorns function should unstake all 5
//    This should result in wallet balance = 5, staked balance = 0

// 2. Unstaking unsuccesful
//    The user starts with 0 unicorns in the wallet because they are all staked. (wallet balance = 0, staked balance = 5)
//    If the correct amount of time has not yet passed
//    the unStakeUnicorns function should unstake any unicorns
//    This should result in wallet balance = 0, staked balance = 5

// Helper functions required

// check unicorn wallet balance
// check staked balance
// check staking interval
// set staking interval

describe('test helper functions', () => {

    test('retrieves unicorn wallet balance', async () => {  
        const balance = await checkUnicornWalletBalance()
        console.log(`Unicorn wallet balance: ${balance}`)
    });
    
    test('retrieves unicorn staked balance', async () => {  
        const balance = await checkUnicornStakedBalance()
        console.log(`Unicorn staked balance: ${balance}`)
    });
    
    test('retrieves dark forest staking period', async () => {  
        const period = await checkStakingInterval()
        console.log(`Dark Forest Staking period: ${period}`)
    });
    
    test('set dark forest staking period', async () => {  
        const currentStakingPeriod = await checkStakingInterval()
        console.log(`Dark Forest current staking period: ${currentStakingPeriod}`)
    
        await setStakingPeriodSeconds(120);
    
        expect((await checkStakingInterval()).toNumber()).toBe(120);
    });
})




async function checkUnicornWalletBalance() {
    return await UnicornNFTContract.balanceOf(address);
}

async function checkUnicornStakedBalance() {
    return await DarkForestContract.numStaked(address);
}

async function checkStakingInterval() {
    return await DarkForestContract.stakePeriodSeconds();
}

async function setStakingPeriodSeconds(period) {
    try {
        const tx = await DarkForestContract.setStakePeriodSeconds(period);
        console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
        await tx.wait();
    } catch (err) {
        console.error(err);
    }
}