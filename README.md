# Crypto Unicorn Auto Staker

This project contains a lightweight node.js application that will periodically and automatically stake and unstake your crypto unicorn NFTs in the dark forest smart contract.

The staking period on the mainnet DarkForest contract is 24 hours, but for convenience this can be set to whatever you want on the test contract. 

This application is only concerned with the staking and unstaking of unicorn NFTs. It does not attempt to interact
with any other aspects of the dark forest contract, such as claiming or burning UNIM tokens. 

The entry point of the application is:
```
scripts/start.js
```
## Starting the application 
You will need to create an environmental variable (called PRIVATE_KEY) to hold your private key. This can be added as an OS system variable or by creating a .env file in the root directory of this project and adding it there.

***Note: this .env file should never be uploaded to GitHub or any other online repository.***

Ensure you have some matic in your wallet, as well as the unicorn NFTs you want to stake.

Once this is in place, to run the auto staking script use the following command from the root directory: 

Local Dev environment:
```
npm run dev_start
```
Mumbai Test environment:
```
npm run test_start
```
Mainnet environment:
```
npm run main_start
```
## Developer Notes

In order to test the script, two smart contracts need to be deployed:

- DarkForest.sol - code was published on polygonscan to is an exact copy.
- CryptoUnicorns.sol - code was not published on polygonscan so this was reverse engineered using boilerplate code from openzeppelin and reading through the logic in the DarkForest contract.

### Deploying
To deploy to the **local development environment** use the following commands from the root directory:
```
npx hardhat node
npx hardhat run --network localhost scripts/deploy_test_environment.js
```
To deploy to the **mumbai testnet** use the following command
```
npx hardhat run scripts/deploy_test_environment.js --network mumbai
``` 
If the addresses of any of the contracts change (such as redeplying contracts in the dev environment), the corresponding values need to be updated in ```config.js```

### Running tests
There are two test suites that test the applications staking and unstaking functionality. These can be run using the following commands:
```
npm test -- ./scripts/unstakeUnicorns.test.js
```
```
npm test -- ./scripts/stakeUnicorns.test.js
```

### Helper scripts
There are a number of helper scripts, which are intended to be used during development:
```
scripts/helper_scripts
```

## Running this script persistently

In order for this script to be run persistently, it was installed as a service on an azure windows server VM. 

The service was create using node-window and the scripts to install/unistall the service can be found in this project under: 
```
scripts/service_scripts
```
## Logging

The application writes to a log file so as to keep a record of every time the script runs, including all the transactions hashes for each stake/unstake and any errors. These can be found here: 
```
logs/unicorn_auto_staker.log
```
### Useful links:

https://abi.hashex.org/ - To publish and verify the contract code on Polygonscan use the following toool to create the ABI encoded contructor arguements

Terminus Whitepaper: https://docs.google.com/document/d/1ucd310WGEPN6LTdgX37_Uk5VHaEOP8kPX2FHDqzSCMk/edit#
Terminus is another smart contract used to manage token balances of multiple users.

Navigating the Dark Forest Medium Post:
https://medium.com/@moonstream/navigating-the-dark-forest-e160b60d5d1b

Crypto Unicorns Research Paper (by me):
https://medium.com/@0xnaylor/crypto-unicorns-looking-under-the-hood-aade27d64148

Dark Forest contract on Polygon Mainnet (published code):
https://polygonscan.com/address/0x8d528e98A69FE27b11bb02Ac264516c4818C3942#code

## Other Notes

There is also a react front end in this project as I was experimenting to see if metamask could be used as a signer for these transactions. However, by design, metamask requires manual intervention for every transaction so was unsuitable for this project. I have left it in so I can use it as a reference for other projects. 