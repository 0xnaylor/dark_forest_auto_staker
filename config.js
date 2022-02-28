const { ethers } = require("ethers");
const crypto_unicorns_artifact = require("./artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");
const dark_forest_artifact = require("./artifacts/contracts/DarkForest.sol/DarkForest.json");
require("dotenv").config();

// define contract address for different environments
const cryptoUnicornAbiJson = crypto_unicorns_artifact.abi;
const darkForestAbiJson = dark_forest_artifact.abi;
const DEV_DARK_FOREST_CONTRACT = "0xa6fA98A9A2496b8726897ea539344cea9890915f";
const DEV_UNICORN_NFT_CONTRACT = "0x4C70a29A4be0954eE358f03C18BecCb888549c01";
const MUMBAI_DARK_FOREST_CONTRACT = "0xd4F109Ef933161A572f090fE3Dffe7e33814b9F6";
const MUMBAI_UNICORN_NFT_CONTRACT = "0x81511Ab37A82fa9b917B98be86a881Dc6177B022";
const MAINNET_DARK_FOREST_CONTRACT = "0x8d528e98A69FE27b11bb02Ac264516c4818C3942";
const MAINNET_UNICORN_NFT_CONTRACT = "0xdC0479CC5BbA033B3e7De9F178607150B3AbCe1f";

// dev
const devProvider = new ethers.providers.JsonRpcProvider();
const devSigner = devProvider.getSigner();
const devUnicornNFTContract = new ethers.Contract(DEV_UNICORN_NFT_CONTRACT, cryptoUnicornAbiJson, devSigner);
const devDarkForestContract = new ethers.Contract(DEV_DARK_FOREST_CONTRACT, darkForestAbiJson, devSigner);

// test
const testProvider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, testProvider);
const testAddress = wallet.address;
const testUnicornNFTContract = new ethers.Contract(MUMBAI_UNICORN_NFT_CONTRACT, cryptoUnicornAbiJson, wallet);
const testDarkForestContract = new ethers.Contract(MUMBAI_DARK_FOREST_CONTRACT, darkForestAbiJson, wallet);

const gasPrice = ethers.utils.parseUnits(String(40.0), 'gwei');

// export what we want to use elsewhere
exports.gasPrice = gasPrice;

exports.DEV_DARK_FOREST_CONTRACT = DEV_DARK_FOREST_CONTRACT;
exports.DEV_UNICORN_NFT_CONTRACT = DEV_UNICORN_NFT_CONTRACT;
exports.MUMBAI_DARK_FOREST_CONTRACT = MUMBAI_DARK_FOREST_CONTRACT;
exports. MUMBAI_UNICORN_NFT_CONTRACT = MUMBAI_UNICORN_NFT_CONTRACT;
exports.MAINNET_DARK_FOREST_CONTRACT = MAINNET_DARK_FOREST_CONTRACT;
exports.MAINNET_UNICORN_NFT_CONTRACT = MAINNET_UNICORN_NFT_CONTRACT;

exports.testUnicornNFTContract = testUnicornNFTContract;
exports.devUnicornNFTContract = devUnicornNFTContract;
exports.devDarkForestContract = devDarkForestContract;
exports.testDarkForestContract = testDarkForestContract;

exports.testAddress = testAddress;
exports.devSigner = devSigner;
exports.devProvider = devProvider;

