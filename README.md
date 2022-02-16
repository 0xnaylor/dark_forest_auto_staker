# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
To deploy to the mumbai testnet use the following command
```
npx hardhat run scripts/deploy_test_environment.js

```

To deploy to the mumbai testnet use the following command
```
npx hardhat run scripts/deploy_test_environment.js --network mumbai
``` 

The test environment includes:

The game - DarkForests.sol 
The ERC20 - UnicornMilk.sol
The ERC721 - CryptoUnicorns.sol


To interact with the deployed contract from the terminal:
```
const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
const wallet = new ethers.Wallet(<private key>, provider);
const UNICORN_NFT_CONTRACT = "0xa857eB8Bee42886e5a5a2Df13800Cb9Bc9dbA6C4";
const UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, CryptoUnicornAbiJson, wallet);
const tokensOwned = await UnicornNFTContract.balanceOf(address);
console.log(tokensOwned);
```


To publish and verify the contract code on Polygonscan use the following toool to create the ABI encoded contructor arguements:
https://abi.hashex.org/

Terminus Whitepaper:
https://docs.google.com/document/d/1ucd310WGEPN6LTdgX37_Uk5VHaEOP8kPX2FHDqzSCMk/edit#

Navigating the Dark Forest Medium Post:
https://medium.com/@moonstream/navigating-the-dark-forest-e160b60d5d1b

Crypto Unicorns Research Paper:
https://medium.com/@0xnaylor/crypto-unicorns-looking-under-the-hood-aade27d64148

Production Dark Forest contract:
https://polygonscan.com/address/0x8d528e98A69FE27b11bb02Ac264516c4818C3942#code



