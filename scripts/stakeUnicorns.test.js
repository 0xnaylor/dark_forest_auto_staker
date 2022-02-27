const stakeUnicorns = require("./stakeUnicorns")
const testUtils = require("./testUtils")
const config = require("../config")
jest.setTimeout(1000000)

test('stake all unicorns in wallet', async () => {

    const address = await config.devSigner.getAddress()
    const stakedBalance = await testUtils.checkUnicornStakedBalance(address);
    await testUtils.unstakeAllUnicorns(stakedBalance, address);
    const walletBalance = await testUtils.checkUnicornWalletBalance(address);
    console.log(`walletBalance: ${walletBalance}`)
    console.log(`stakedBalance: ${stakedBalance}`)

    const unicornContract = config.devUnicornNFTContract;

    if (walletBalance === 0) {
        // mint 3 unicorns
        await testUtils.mintUnicorns(address, 3)
    }
    
    await stakeUnicorns(walletBalance, address, unicornContract, config.DEV_DARK_FOREST_CONTRACT);
    const newWalletBalance = await testUtils.checkUnicornWalletBalance(address);
    const newStakedBalance = await testUtils.checkUnicornStakedBalance(address);

    console.log(`newWalletBalance: ${newWalletBalance}`)
    console.log(`newStakedBalance: ${newStakedBalance}`)
        
    expect(newStakedBalance).toEqual(walletBalance);
    expect(newWalletBalance).toEqual(0);
});