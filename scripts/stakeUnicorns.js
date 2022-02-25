const config = require("../config")
const logger = require("./utils/logger.js").logger;

async function stakeUnicorns(balanceOf, walletAddress, unicornContract, darkForestAddress) {

    let unicorns = [];
    for (let i = 0; i < balanceOf; i++) {
        const tokenId = (await unicornContract.tokenOfOwnerByIndex(walletAddress, i)).toNumber();
        unicorns.push({
            i,
            tokenId
        })
    }
    logger.info({message: `The user has ${unicorns.length} unicorns to stake`});

    for (let i = 0; i < balanceOf; i++) {
        const tokenId = unicorns[i].tokenId;
        try {
            // Stake
            console.log(`Staking Unicorn #${tokenId}`)
            logger.info({message: `Staking Unicorn #${tokenId}`});
            const tx = await unicornContract['safeTransferFrom(address,address,uint256,bytes)'](
                walletAddress, // from
                darkForestAddress, // to
                tokenId,
                config.gasPrice
            );
            logger.info({message: `https://mumbai.polygonscan.com/tx/${tx.hash}`});
            await tx.wait();
        } catch (err) {
            logger.info({message: err});
            process.exit(1);
        }
    }
    logger.info({message: `Staking complete`});  
}

module.exports = stakeUnicorns;