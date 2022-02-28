const config = require("../config")
const devDarkForestContract = config.devDarkForestContract;
const devUnicornContract = config.devUnicornNFTContract;

const checkUnicornWalletBalance = async (account) => {
    return (await devUnicornContract.balanceOf(account)).toNumber();
}

const checkUnicornStakedBalance = async (address) => {
    return (await devDarkForestContract.numStaked(address)).toNumber();
}

const checkStakingInterval = async () => {
    return await devDarkForestContract.stakePeriodSeconds();
}

const setStakingPeriodSeconds = async (period, devDarkForestContract) => {
    console.log(`setting staking period to ${period} seconds`)
    try {
        const tx = await devDarkForestContract.setStakePeriodSeconds(period);
        await tx.wait();
    } catch (err) {
        console.error(err);
    }
}

const unstakeAllUnicorns = async (stakedUnicorns, address) => {
    let unicorns = [];
    if (stakedUnicorns > 0) {
        for (let i = 0; i < stakedUnicorns; i++) {
            const tokenId = (await devDarkForestContract.tokenOfStakerByIndex(address, i)).toNumber();
            // unstake a unicorn
            unicorns.push({i, tokenId});
          }
        } else {
            console.log(`No unicorns are currently staked`)
        }

        for (let i = 0; i < unicorns.length; i++) {
            const tokenId = unicorns[i].tokenId
            try {
              const tx = await devDarkForestContract.rescueUnicorn(tokenId);
              await tx.wait();
            } catch (err) {
              console.error(err);
            }
        }
    console.log(`Unstaking complete`)
}

const stakeAllUnicorns = async (balanceOf, address) => {

    let unicorns = [];
    for (let i = 0; i < balanceOf; i++) {
        const tokenId = (await devUnicornContract.tokenOfOwnerByIndex(address, i)).toNumber();
        unicorns.push({
            i,
            tokenId
        })
    }

    for (let i = 0; i < balanceOf; i++) {
        const tokenId = unicorns[i].tokenId;
        try {
            const tx = await devUnicornContract['safeTransferFrom(address,address,uint256,bytes)'](
                address, // from
                config.DEV_DARK_FOREST_CONTRACT, // to
                tokenId,
                config.gasPrice
            );
            await tx.wait();
        } catch (err) {
            console.log(`Error: ${err}`)
            process.exit(1);
        }
    }
}

const mintUnicorns = async (address, quantity) => {
    console.log(`Minting ${quantity} unicorn(s)`)
    
    const uri = {
        "name": "Unicorn",
        "description": "Test Unicorn NFT",
        "image": "https://gateway.pinata.cloud/ipfs/QmeZ8EJ6PTtdJcYPPvrbeRMvVAJV9azSuQcUgExwu4tp3C"
    }

    for(i = 0; i < quantity; i++) {
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

