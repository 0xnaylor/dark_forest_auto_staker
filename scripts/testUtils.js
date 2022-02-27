const config = require("../config")
const devDarkForestContract = config.devDarkForestContract;
const devUnicornContract = config.devUnicornNFTContract;
const stakeUnicorns = require("./stakeUnicorns")

const checkUnicornWalletBalance = async (account) => {
    return (await devUnicornContract.balanceOf(account)).toNumber();
}

const checkUnicornStakedBalance = async (address) => {
    return (await devDarkForestContract.numStaked(address)).toNumber();
}

const checkStakingInterval = async () => {
    return await devDarkForestContract.stakePeriodSeconds();
}

const setStakingPeriodSeconds = async (period) => {
    console.log(`setting staking period to ${period} seconds`)
    try {
        const tx = await devDarkForestContract.setStakePeriodSeconds(period);
        await tx.wait();
    } catch (err) {
        console.error(err);
    }
}

const unstakeAllUnicorns = async (stakedUnicorns, address) => {
    console.log(`unicorns staked: ${stakedUnicorns}`)
    let unicorns = [];
    if (stakedUnicorns > 0) {
        for (let i = 0; i < stakedUnicorns; i++) {
            const tokenId = (await devDarkForestContract.tokenOfStakerByIndex(address, i)).toNumber();
            // unstake a unicorn
            unicorns.push({i, tokenId});
          }
        }

        for (let i = 0; i < stakedUnicorns; i++) {
            const tokenId = unicorns[i].tokenId
            try {
              const tx = await devDarkForestContract.rescueUnicorn(tokenId);
              await tx.wait();
              console.log(`unstake unicorn: ${tokenId}`)
            } catch (err) {
              console.error(err);
            }
        }
    console.log(`Unstaking complete`)
}

const stakeAllUnicorns = async (address) => {
    
    // find out balance in wallet 
    const walletBalance = await checkUnicornWalletBalance(address)

    if (walletBalance > 0) {
        // stake any remaining in wallet
        await stakeUnicorns(walletBalance, address, devUnicornContract, config.DEV_DARK_FOREST_CONTRACT);
    } else {
        console.log('There are no unicorns in your wallet to stake')
    }
}

const mintUnicorns = async (address, quantity) => {
    console.log(`Minting ${quantity} unicorn(s)`)
    
    const uri = {
        "name": "Unicorn",
        "description": "Test Unicorn NFT",
        "image": "https://gateway.pinata.cloud/ipfs/QmeZ8EJ6PTtdJcYPPvrbeRMvVAJV9azSuQcUgExwu4tp3C"
    }

    for(i = 1; i <= quantity; i++) {
        try {
            const tx = await devUnicornContract.safeMint(address, uri);
            await tx.wait();
            console.log(`Unicorn ${i} minted`)
          } catch (err) {
            console.error(err);
            process.exit(1);
          }
    }
}

const wait = (ms) => {
    console.log(`waiting ${ms /1000} seconds`)
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }


exports.mintUnicorns = mintUnicorns;
exports.checkUnicornWalletBalance = checkUnicornWalletBalance;
exports.checkUnicornStakedBalance = checkUnicornStakedBalance;
exports.checkStakingInterval = checkStakingInterval;
exports.setStakingPeriodSeconds = setStakingPeriodSeconds;
exports.unstakeAllUnicorns = unstakeAllUnicorns;
exports.stakeAllUnicorns = stakeAllUnicorns;
exports.wait = wait;

