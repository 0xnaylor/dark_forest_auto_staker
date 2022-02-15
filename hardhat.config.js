const { task } = require("hardhat/config");

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
const infura_url = process.env.INFURA_URL;
const private_key = process.env.PRIVATE_KEY;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("infura_url", "Prints infura url", async () => {
  console.log(`infura url: ${infura_url}`)
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "mumbai",
  networks: {
    hardhat: {
    },
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/" + infura_url,
      accounts: [private_key]
    },
    mainnet: {
      url: "https://polygon-mainnet.infura.io/v3/" + infura_url,
      accounts: [private_key]
    },
  },
    solidity: {
      compilers: [
        {
          version: "0.8.9",
          settings: {
            optimizer: {
              enabled: true,
              runs: 200
            }
          }
        }
      ]
      
    }
  }
