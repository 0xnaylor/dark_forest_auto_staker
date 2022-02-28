const config = require("../config")
const testUtils = require("./testUtils")
const unstakeUnicorns = require("./unstakeUnicorns")
jest.setTimeout(100000)

let address;

describe('testing unstaking functionality', () => {
    beforeAll(async () => {
        address = await config.devSigner.getAddress();
        await testUtils.setStakingPeriodSeconds(5, config.devDarkForestContract);
    })
    
    beforeEach(async () => {
    
        const stakedBalance = await testUtils.checkUnicornStakedBalance(address);
        // unstake all currently stake unicorns
        await testUtils.unstakeAllUnicorns(stakedBalance, address);
        const walletBalance = await testUtils.checkUnicornWalletBalance(address);
        
        // we want to test with more than 1 unicorn
        if (walletBalance <= 1) {
            await testUtils.mintUnicorns(address, 3)
        }
    
        // restake all unicorns
        await testUtils.stakeAllUnicorns(walletBalance, address);
    })
    
    test('unstake all unicorns', async () => {
        const stakedBalance = await testUtils.checkUnicornStakedBalance(address);
    
        // mock the current time
        const tokenId = (await config.devDarkForestContract.tokenOfStakerByIndex(address, 0)).toNumber();
        const unstakesAt = (await config.devDarkForestContract.unstakesAt(tokenId)).toNumber();
        const DATE_TO_USE = (unstakesAt + 10) * 1000;
        Date.now = jest.fn(() => DATE_TO_USE)
    
        // increase block timestamp artifically
        await config.devProvider.send('evm_increaseTime', [10]);
        await config.devProvider.send("evm_mine")
    
        await unstakeUnicorns(stakedBalance, address, config.devDarkForestContract);
    
        const newWalletBalance = await testUtils.checkUnicornWalletBalance(address);
        const newStakedBalance = await testUtils.checkUnicornStakedBalance(address);
    
        expect(newWalletBalance).toEqual(stakedBalance);
        expect(newStakedBalance).toEqual(0);
    })
    
    test('attempt to unstake all unicorns before stake period has completed and fails', async () => {
        const stakedBalance = await testUtils.checkUnicornStakedBalance(address);
    
        await unstakeUnicorns(stakedBalance, address, config.devDarkForestContract);
    
        const newWalletBalance = await testUtils.checkUnicornWalletBalance(address);
        const newStakedBalance = await testUtils.checkUnicornStakedBalance(address);
        
        expect(newWalletBalance).toEqual(0);
        expect(newStakedBalance).toEqual(stakedBalance);
    })
})
