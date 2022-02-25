const config = require("../config")
const devDarkForestContract = config.devDarkForestContract;
const devUnicornContract = config.devUnicornNFTContract;
const stakeUnicorns = require("./stakeUnicorns")

const checkUnicornWalletBalance = async (account) => {
    console.log(`checkUnicornWalletBalance called for address: ${account}`)
    return (await devUnicornContract.balanceOf(account)).toNumber();
}

const checkUnicornStakedBalance = async (address) => {
    console.log(`checkUnicornStakedBalance called for address: ${address}`)
    return (await devDarkForestContract.numStaked(address)).toNumber();
}

const checkStakingInterval = async () => {
    return await devDarkForestContract.stakePeriodSeconds();
}

const setStakingPeriodSeconds = async (period) => {
    try {
        const tx = await devDarkForestContract.setStakePeriodSeconds(period);
        console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
        await tx.wait();
    } catch (err) {
        console.error(err);
    }
}

const unstakeAllUnicorns = async (address) => {
    const stakedUnicorns = await devDarkForestContract.numStaked(address);
    if (stakedUnicorns > 0) {
        for (let i = 0; i < stakedUnicorns; i++) {
            const tokenId = await devDarkForestContract.tokenOfStakerByIndex(address, 0);
            console.log(`About to rescue tokenId "${tokenId}" from the DarkForest contract`)
            // unstake a unicorn
            try {
              const tx = await devDarkForestContract.rescueUnicorn(tokenId);
              await tx.wait();
            } catch (err) {
              console.error(err);
            }
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

exports.mintUnicorns = mintUnicorns;
exports.checkUnicornWalletBalance = checkUnicornWalletBalance;
exports.checkUnicornStakedBalance = checkUnicornStakedBalance;
exports.checkStakingInterval = checkStakingInterval;
exports.setStakingPeriodSeconds = setStakingPeriodSeconds;
exports.unstakeAllUnicorns = unstakeAllUnicorns;
exports.stakeAllUnicorns = stakeAllUnicorns;

