const stake = require("./auto_staker");
const { ethers } = require("ethers");
const crypto_unicorns_artifact = require("../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");
const dark_forest_artifact = require("../artifacts/contracts/DarkForest.sol/DarkForest.json");

require("dotenv").config();

// set default test timeout to 10 seconds
jest.setTimeout(100000)

// scenarios to test

// 1. Staking
//    The user starts with 5 unicorns in the wallet, unstaked. (wallet balance = 5, staked balance = 0)
//    the stakeUnicorns function should stake all 5
//    This should result in wallet balance = 0, staked balance = 5

// 2. Unstaking successful
//    The user starts with 0 unicorns in the wallet because they are all staked. (wallet balance = 0, staked balance = 5)
//    If the correct amount of time has passed
//    the unStakeUnicorns function should unstake all 5
//    This should result in wallet balance = 5, staked balance = 0

// 2. Unstaking unsuccesful
//    The user starts with 0 unicorns in the wallet because they are all staked. (wallet balance = 0, staked balance = 5)
//    If the correct amount of time has not yet passed
//    the unStakeUnicorns function should unstake any unicorns
//    This should result in wallet balance = 0, staked balance = 5


