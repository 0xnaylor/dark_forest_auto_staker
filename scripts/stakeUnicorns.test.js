const stakeUnicorns = require("./stakeUnicorns")
const testUtils = require("./testUtils")
const config = require("../config")

let address;

beforeAll(async () => {
    address = await config.devSigner.getAddress()
    await testUtils.unstakeAllUnicorns(address);
})

test('stake all unicorns in wallet', async () => {

    const unicornContract = config.devUnicornNFTContract;
        
    let tokenId;
    console.log`wallet address being used for "stake unicorn" test: ${address}`

    const currentUnicornBalance = await testUtils.checkUnicornWalletBalance(address);
    if (currentUnicornBalance > 0) {
        tokenId = (await unicornContract.tokenOfOwnerByIndex(address, 0)).toNumber();
    } else {
        // mint 3 unicorns
        testUtils.mintUnicorns(address, 3)
    }
    
    const walletBalance = await testUtils.checkUnicornWalletBalance(address);
    const stakedBalance = await testUtils.checkUnicornStakedBalance(address);

    console.log(`walletBalance: ${walletBalance}`)
    console.log(`stakedBalance: ${stakedBalance}`)
    
    await stakeUnicorns(walletBalance, address, unicornContract, config.DEV_DARK_FOREST_CONTRACT);
    const newWalletBalance = await testUtils.checkUnicornWalletBalance(address);
    const newStakedBalance = await testUtils.checkUnicornStakedBalance(address);

    console.log(`newWalletBalance: ${newWalletBalance}`)
    console.log(`newStakedBalance: ${newStakedBalance}`)
        
    expect(newStakedBalance).toEqual(walletBalance);
    expect(newWalletBalance).toEqual(0);
});