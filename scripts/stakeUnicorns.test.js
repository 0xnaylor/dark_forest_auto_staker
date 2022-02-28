const stakeUnicorns = require("./stakeUnicorns")
const testUtils = require("./testUtils")
const config = require("../config")
jest.setTimeout(1000000)

describe('testing staking functionality', () => {
    test('stake all unicorns in wallet', async () => {

        const address = await config.devSigner.getAddress()
        const stakedBalance = await testUtils.checkUnicornStakedBalance(address);
        await testUtils.unstakeAllUnicorns(stakedBalance, address);
        let walletBalance = await testUtils.checkUnicornWalletBalance(address);
    
        const unicornContract = config.devUnicornNFTContract;
    
        if (walletBalance === 0) {
            // mint 3 unicorns
            await testUtils.mintUnicorns(address, 3)
            walletBalance = await testUtils.checkUnicornWalletBalance(address);
        }
        
        await stakeUnicorns(walletBalance, address, unicornContract, config.DEV_DARK_FOREST_CONTRACT);
        const newWalletBalance = await testUtils.checkUnicornWalletBalance(address);
        const newStakedBalance = await testUtils.checkUnicornStakedBalance(address);
            
        expect(newStakedBalance).toEqual(walletBalance);
        expect(newWalletBalance).toEqual(0);
    });
})
