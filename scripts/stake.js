const config = require("../config")
const logger = require("./utils/logger.js").logger;

async function stake(tokenId, walletAddress, unicornContract, darkForestAddress) {

    console.log(`Staking Unicorn #${tokenId}... for owner ${walletAddress}`)
    logger.info({message: `Staking Unicorn #${tokenId}... for owner ${walletAddress}`});
    try {
        // Stake
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

module.exports = stake;