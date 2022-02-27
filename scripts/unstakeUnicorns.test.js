const config = require("../config")
const testUtils = require("./testUtils")
const unstakeUnicorns = require("./unstakeUnicorns")
jest.setTimeout(100000)

let address;

beforeAll(async () => {
    address = await config.devSigner.getAddress();
    const walletBalance = await testUtils.checkUnicornWalletBalance(address);

    // set staking period to 5 seconds
    await testUtils.setStakingPeriodSeconds(5);
})

beforeEach(async () => {
    await testUtils.stakeAllUnicorns(address);
    const stakedBalance = await testUtils.checkUnicornStakedBalance(address);

    // staked balance needs to be greater than 1
    if (stakedBalance <= 1) {
        // we've already staked all our unicorns so we need to mint some more
        await testUtils.mintUnicorns(address, 3)
        // then stake them
        await testUtils.stakeAllUnicorns(address);
    }
})

test('unstake all unicorns', async () => {
    const walletBalance = await testUtils.checkUnicornWalletBalance(address);
    const stakedBalance = await testUtils.checkUnicornStakedBalance(address);

    // wait until tokens can be unstaked
    const tokenId = (await config.devDarkForestContract.tokenOfStakerByIndex(address, 0)).toNumber();
    const unstakedAt = (await config.devDarkForestContract.unstakesAt(tokenId)).toNumber();
    let timeNow;

    do {
        testUtils.wait(1000)
        timeNow = Math.floor(Date.now() / 1000);
        console.log(`Time now is: ${timeNow}, waiting for ${unstakedAt+5}`)
    } while (timeNow <= unstakedAt +5);

    await unstakeUnicorns(stakedBalance, address, config.devDarkForestContract);

    const newWalletBalance = await testUtils.checkUnicornWalletBalance(address);
    const newStakedBalance = await testUtils.checkUnicornStakedBalance(address);

    expect(newWalletBalance).toEqual(stakedBalance);
    expect(newStakedBalance).toEqual(0);
})

test('attempt to unstake all unicorns before stake period has completed and fails', async () => {
    const walletBalance = await testUtils.checkUnicornWalletBalance(address);
    const stakedBalance = await testUtils.checkUnicornStakedBalance(address);

    await unstakeUnicorns(stakedBalance, address, config.devDarkForestContract);

    const newWalletBalance = await testUtils.checkUnicornWalletBalance(address);
    const newStakedBalance = await testUtils.checkUnicornStakedBalance(address);
    
    expect(newWalletBalance).toEqual(0);
    expect(newStakedBalance).toEqual(stakedBalance);
})