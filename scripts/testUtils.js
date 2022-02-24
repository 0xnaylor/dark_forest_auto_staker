const config = require("../config")

const darkForestContract = config.devDarkForestContract;
const unicornContract = config.devUnicornNFTContract;

const checkUnicornWalletBalance = async (account) => {
    console.log(`checkUnicornWalletBalance called for address: ${account}`)
    return (await unicornContract.balanceOf(account)).toNumber();
}

async function checkUnicornStakedBalance(_address) {
    console.log(`checkUnicornStakedBalance called for address: ${_address}`)
    return (await darkForestContract.numStaked(_address)).toNumber();
}

async function checkStakingInterval() {
    return await darkForestContract.stakePeriodSeconds();
}

async function setStakingPeriodSeconds(period) {
    try {
        const tx = await darkForestContract.setStakePeriodSeconds(period);
        console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
        await tx.wait();
    } catch (err) {
        console.error(err);
    }
}

async function unstakeAllUnicorns(address) {
    const stakedUnicorns = await darkForestContract.numStaked(address);
    if (stakedUnicorns > 0) {
        for (let i = 0; i < stakedUnicorns; i++) {
            const tokenId = await darkForestContract.tokenOfStakerByIndex(address, 0);
            console.log(`About to rescue tokenId "${tokenId}" from the DarkForest contract`)
            // unstake a unicorn
            try {
              const tx = await darkForestContract.rescueUnicorn(tokenId);
              await tx.wait();
            } catch (err) {
              console.error(err);
            }
          }
        }
    console.log(`Unstaking complete`)
}

async function mintUnicorn(address) {
    // create uri for unicorn1
    const uri = {
        "name": "Unicorn",
        "description": "Test Unicorn NFT",
        "image": "https://gateway.pinata.cloud/ipfs/QmeZ8EJ6PTtdJcYPPvrbeRMvVAJV9azSuQcUgExwu4tp3C"
    }

    // mint
    try {
      const tx = await unicornContract.safeMint(address, uri);
      await tx.wait();
      console.log(`Unicorn minted`)
  } catch (err) {
      console.error(err);
      process.exit(1);
  }
}

exports.mintUnicorn = mintUnicorn;
exports.checkUnicornWalletBalance = checkUnicornWalletBalance;
exports.checkUnicornStakedBalance = checkUnicornStakedBalance;
exports.checkStakingInterval = checkStakingInterval;
exports.setStakingPeriodSeconds = setStakingPeriodSeconds;
exports.unstakeAllUnicorns = unstakeAllUnicorns;

