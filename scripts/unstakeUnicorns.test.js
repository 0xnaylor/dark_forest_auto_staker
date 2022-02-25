const config = require("../config")
const testUtils = require("./testUtils")

let address;

beforeAll(async () => {
    address = await config.devSigner.getAddress();
    const walletBalance = await testUtils.checkUnicornWalletBalance(address);
    console.log(`Wallet balance: ${walletBalance}`)
    
    await testUtils.stakeAllUnicorns(address);
    const stakedBalance = await testUtils.checkUnicornStakedBalance(address);
    console.log(`Staked balance: ${stakedBalance}`)

    // staked balance needs to be greater than 1
    if (stakedBalance <= 1) {
        console.log('staked unicorns is less than 2')
        // we've already staked all our unicorns so we need to mint some more
        await testUtils.mintUnicorns(address, 3)
        // then stake them
        await testUtils.stakeAllUnicorns(address);
    }
})

test('unstake all unicorns', async () => {
    const walletBalance = await testUtils.checkUnicornWalletBalance(address);
    const stakedBalance = await testUtils.checkUnicornStakedBalance(address);

    console.log(`walletBalance: ${walletBalance}`)
    console.log(`stakedBalance: ${stakedBalance}`)

    await testUtils.unstakeAllUnicorns(address);

    const newWalletBalance = await testUtils.checkUnicornWalletBalance(address);
    const newStakedBalance = await testUtils.checkUnicornStakedBalance(address);

    console.log(`newWalletBalance: ${newWalletBalance}`)
    console.log(`newStakedBalance: ${newStakedBalance}`)

    expect(newWalletBalance).toEqual(stakedBalance);
    expect(newStakedBalance).toEqual(0);
})