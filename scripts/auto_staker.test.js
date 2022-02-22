const stake = require("./auto_staker");
const { ethers } = require("ethers");
const crypto_unicorns_artifact = require("../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");
const dark_forest_artifact = require("../artifacts/contracts/DarkForest.sol/DarkForest.json");

require("dotenv").config();


// const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
const provider = new ethers.providers.JsonRpcProvider();
const signer = provider.getSigner();
let address;
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// test environment
const MUMBAI_UNICORN_NFT_CONTRACT = "0x81511Ab37A82fa9b917B98be86a881Dc6177B022";
const MUMBAI_DARK_FOREST_CONTRACT = "0xd4F109Ef933161A572f090fE3Dffe7e33814b9F6";
// local development environment
const DEV_DARK_FOREST_CONTRACT = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const DEV_UNICORN_NFT_CONTRACT = "0x5FbDB2315678afecb367f032d93F642f64180aa3";


const CryptoUnicornAbiJson = crypto_unicorns_artifact.abi;
const DarkForestAbiJson = dark_forest_artifact.abi;
const UnicornNFTContract = new ethers.Contract(DEV_UNICORN_NFT_CONTRACT, CryptoUnicornAbiJson, signer);
const DarkForestContract = new ethers.Contract(DEV_DARK_FOREST_CONTRACT, DarkForestAbiJson, signer);

// set default test timeout to 10 seconds
jest.setTimeout(100000)


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

beforeAll(async() => {
    address = await signer.getAddress();
});

// describe('test helper functions', () => {

//     test('retrieves unicorn wallet balance', async () => {  
//         const balance = await checkUnicornWalletBalance()
//         console.log(`Unicorn wallet balance: ${balance}`)
//     });
    
//     test('retrieves unicorn staked balance', async () => {  
//         const balance = await checkUnicornStakedBalance()
//         console.log(`Unicorn staked balance: ${balance}`)
//     });
    
//     test('retrieves dark forest staking period', async () => {  
//         const period = await checkStakingInterval()
//         console.log(`Dark Forest Staking period: ${period}`)
//     });
    
//     test('set dark forest staking period', async () => {  
//         const currentStakingPeriod = await checkStakingInterval()
//         console.log(`Dark Forest current staking period: ${currentStakingPeriod}`)
    
//         await setStakingPeriodSeconds(120);
    
//         expect((await checkStakingInterval()).toNumber()).toBe(120);
//     });
// })

describe('Test staking', () => {

    beforeAll(async () => {
        await unstakeAllUnicorns();
    })

    // test('stake all unicorns', async () => {

    //     const oldWalletBalance = await checkUnicornWalletBalance();
    //     const oldStakedBalance = await checkUnicornStakedBalance();

    //     console.log(`oldWalletBalance: ${oldWalletBalance}`)
    //     console.log(`oldStakedBalance: ${oldStakedBalance}`)
        
    //     await stakeUnicorns(oldWalletBalance)
    //     const newWalletBalance = await checkUnicornWalletBalance();
    //     const newStakedBalance = await checkUnicornStakedBalance();
    //     console.log(`newWalletBalance: ${newWalletBalance}`)
    //     console.log(`newStakedBalance: ${newStakedBalance}`)
     

    //     // expect(newStakedBalance).toEqual(oldWalletBalance);
    //     // expect(newWalletBalance).toEqual(oldStakedBalance);
    
    // });

    test('stake unicorn ', async () => {
        
        
        let tokenId;

        if (await checkUnicornWalletBalance() > 0) {
            tokenId = (await UnicornNFTContract.tokenOfOwnerByIndex(address, 0)).toNumber();
        } else {
            await mintUnicorn(address)
        }
        
        const oldWalletBalance = await checkUnicornWalletBalance();
        const oldStakedBalance = await checkUnicornStakedBalance();

        console.log(`oldWalletBalance: ${oldWalletBalance}`)
        console.log(`oldStakedBalance: ${oldStakedBalance}`)
        
        await stake(tokenId);
        const newStakedBalance = setTimeout(checkUnicornStakedBalance, 10000);
        // const balance = await checkUnicornStakedBalance();
        // console.log(`staked balance: ${balance}`);
  
        // const newWalletBalance = await checkUnicornWalletBalance();
        // const newStakedBalance = await checkUnicornStakedBalance();
        // console.log(`newWalletBalance: ${newWalletBalance}`)
        console.log(`newStakedBalance: ${newStakedBalance}`)
     

        expect(newStakedBalance).toEqual(oldWalletBalance);
        expect(newWalletBalance).toEqual(oldStakedBalance);
    
    });
})

const flushPromises = () => new Promise(setImmediate)

async function mintUnicorn(address) {
    // create uri for unicorn1
    const uri = {
        "name": "Unicorn",
        "description": "Test Unicorn NFT",
        "image": "https://gateway.pinata.cloud/ipfs/QmeZ8EJ6PTtdJcYPPvrbeRMvVAJV9azSuQcUgExwu4tp3C"
    }

    // mint
    try {
      const tx = await UnicornNFTContract.safeMint(address, uri);
      await tx.wait();
      console.log(`Unicorn minted`)
  } catch (err) {
      console.error(err);
      process.exit(1);
  }
}

async function checkUnicornWalletBalance() {
    return await UnicornNFTContract.balanceOf(address);
}

async function checkUnicornStakedBalance() {
    return await DarkForestContract.numStaked(address);
}

// async function checkStakingInterval() {
//     return await DarkForestContract.stakePeriodSeconds();
// }

async function setStakingPeriodSeconds(period) {
    try {
        const tx = await DarkForestContract.setStakePeriodSeconds(period);
        console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
        await tx.wait();
    } catch (err) {
        console.error(err);
    }
}

async function unstakeAllUnicorns() {
    const stakedUnicorns = await checkUnicornStakedBalance();
    if (stakedUnicorns > 0) {
        for (let i = 0; i < stakedUnicorns; i++) {
            const tokenId = await DarkForestContract.tokenOfStakerByIndex(address, 0);
            console.log(`About to rescue tokenId "${tokenId}" from the DarkForest contract: ${DEV_DARK_FOREST_CONTRACT}`)
            // unstake a unicorn
            try {
              const tx = await DarkForestContract.rescueUnicorn(tokenId);
              await tx.wait();
            } catch (err) {
              console.error(err);
            }
          }
        }
    console.log(`Unstaking complete`)
}