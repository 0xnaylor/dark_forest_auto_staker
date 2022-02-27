const { config } = require("dotenv");

const logger = require("./utils/logger.js").logger;

async function unstakeUnicorns(stakedUnicorns, address, darkForestContract) {
    console.log(`unstakeUnicorns called with: ${stakedUnicorns} stakedUnicorns`)
    let unicorns = [];
    logger.info({message: `User has ${stakedUnicorns} unicorns staked in the Dark Forest contract`});
    let count = 0;
    for(i = 0; i < stakedUnicorns; i++){
        const tokenId = (await darkForestContract.tokenOfStakerByIndex(address, i)).toNumber();
        const unstakedAt = (await darkForestContract.unstakesAt(tokenId)).toNumber();
        const timeNow = Math.floor(Date.now() / 1000);
        console.log(`Unstakes at: ${unstakedAt}`)
        console.log(`Time is now: ${timeNow}`)
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
    console.log(`${count} unicorns can be unstaked`)

    for (let i = 0; i < stakedUnicorns; i++) {
        const unicorn = unicorns[i];
        if (unicorn.canUnstake) {
            logger.info({message: `Unstaking Unicorn #${unicorn.tokenId}...`});
            console.log(`Unstaking Unicorn #${unicorn.tokenId}...`)
            // Unstake
            try {
                console.log(`dark forest contract functions: ${darkForestContract}`)
                const tx = await darkForestContract.exitForest(unicorn.tokenId, 
                    { gasPrice: config.gasPrice }
                );
                logger.info({message: `https://mumbai.polygonscan.com/tx/${tx.hash}`});
                await tx.wait();
            } catch (err) {
                logger.info({message: err});
                console.log(`Error: ${err}`)
                process.exit(1);
            }
        }
    }
    logger.info({message: `Unstaking complete`});
}

module.exports = unstakeUnicorns;