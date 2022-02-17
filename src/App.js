import './styles/App.css';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

// Constants

const App = () => {

  const CONTRACT_ADDRESS = "0xE8d47313352F02C8932320630AD10Da745F64c04";

  // state variable used to store our users public wallet
  const [currentAccount, setCurrentAccount] = useState("");
  
  const checkIfWalletIsConnected = async () => {
    // make sure we have access to window.ethereum
    const { ethereum } = window;

    if(!ethereum) {
      console.log("Make sure you have metamask");
      return;
    } else {
      console.log("we have the ethereum object", ethereum);
    }

    // check if we're authorised to access the user's wallet
    const accounts = await ethereum.request({method: 'eth_accounts'});

    // User can have multiple authorised accounts, we grab the first one if its there
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("found an authorised account: ", account);
      setCurrentAccount(account);

      // Setup listener! This is for the case where a user comes to our site and ALREADY had their wallet connected + authorized.
      setupEventListener()
    } else {
      console.log("No authorised account found");
    }
  }

  const connectWallet = async () => {
    console.log("connect button clicked")
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask");
        return;
      }

      // request access to account
      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      // should print out public address once checkIfWalletIsConnected
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site and connected their wallet for the first time.
      setupEventListener();

    } catch (error) {
      console.log(error);
    }
  }

  const initiateAutoStake = async () => {
    console.log("placeholder")
  }

  // const askContractToMintNft = async () => {
    
  //   try {
  //     const { ethereum } = window;

  //     if (ethereum) {

  //       let chainId = await ethereum.request({ method: 'eth_chainId' });
  //       console.log("Connected to chain " + chainId);

  //       // String, hex code of the chainId of the Rinkebey test network
  //       const rinkebyChainId = "0x4"; 
  //       if (chainId !== rinkebyChainId) {
  //         alert("You are not connected to the Rinkeby Test Network!");
  //         return;
  //       }

  //       const provider = new ethers.providers.Web3Provider(ethereum);
  //       const signer = provider.getSigner();
  //       //const connectContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

  //       console.log("Going to pop wallet now to pay gas...");
  //       //let nftTxn = await connectContract.makeAnEpicNFT();

  //       console.log("Mining... Please wait.");
  //       await nftTxn.wait();

  //       console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
  //     } else {
  //       console.log("Ethereum object doesn't exist");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // This runs our function when the page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderAutoStakeUI = () => (
    <button onClick={initiateAutoStake} className="cta-button connect-wallet-button">
      Auto Stake
    </button>
  )

   // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        // connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        //   console.log(from, tokenId.toNumber())
        //   alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        // });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // const updateRemainingNftCount = async () => {

  //   const { ethereum } = window;

  //     if (ethereum) {
  //       // Same stuff again
  //       const provider = new ethers.providers.Web3Provider(ethereum);
  //       const signer = provider.getSigner();
  //       // const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

  //       setNftsAvailable = 5 - connectedContract.getTotalNFTsMintedSoFar();
  //           // console.log("nftsAvailable type: " + typeof nftsAvailable);
  //           // console.log(nftsAvailable);
  //       console.log("NFTs left for minting: " + nftsAvailable);
  //   }
  // }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Unicorn Auto Staker</p>
          <p className="sub-text">
            Automatically stake and unstake your unicorns in the dark forest
          </p>
          <p className="sub-text">
           This could say how many unicorns are staked and what time they will restake
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderAutoStakeUI()}
        </div>
      </div>
    </div>
  );
};

export default App;
