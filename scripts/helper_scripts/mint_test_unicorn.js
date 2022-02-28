const { ethers } = require("ethers");
const config = require("../../config");
// require("@nomiclabs/hardhat-ethers");
const crypto_unicorns_artifact = require("../../artifacts/contracts/CryptoUnicorns.sol/CryptoUnicorns.json");

require("dotenv").config();

async function main() {
    console.log("Running mint_test_unicorn script");

    const environment = process.argv[2];
    const CryptoUnicornAbiJson = crypto_unicorns_artifact.abi;
    
    let UNICORN_NFT_CONTRACT = "";
    let provider;
    let signer;
    let wallet;
    let UnicornNFTContract;
    let address

    if (environment === 'dev') {
      // running in dev
      console.log(`Running in environment: ${environment}`)
      UNICORN_NFT_CONTRACT = config.DEV_UNICORN_NFT_CONTRACT;
      console.log(`Contract address: ${UNICORN_NFT_CONTRACT}`)
      provider = new ethers.providers.JsonRpcProvider();
      signer = provider.getSigner();
      address = await signer.getAddress();
      UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, CryptoUnicornAbiJson, signer);
    } else {
      // running in test
      console.log(`Running in environment: ${environment}`)
      UNICORN_NFT_CONTRACT = config.MUMBAI_UNICORN_NFT_CONTRACT;
      console.log(`Contract address: ${UNICORN_NFT_CONTRACT}`)
      provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today", 80001);
      wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      address = wallet.address;
      UnicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, CryptoUnicornAbiJson, wallet);
    }

    // create uri for unicorn1
    const uri = {
        "name": "Unicorn",
        "description": "Test Unicorn NFT",
        "image": "https://gateway.pinata.cloud/ipfs/QmeZ8EJ6PTtdJcYPPvrbeRMvVAJV9azSuQcUgExwu4tp3C"
    }

    // mint
    try {
      const tx =  await UnicornNFTContract.safeMint(address, uri);
      console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
      await tx.wait();
      console.log(`Unicorn minted`)
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });