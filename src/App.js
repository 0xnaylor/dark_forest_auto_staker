import './styles/App.css';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Swal from 'sweetalert2'
import darkForestAbiJson from "./contractABI/darkForestABI.json";
import cryptoUnicornAbiJson from "./contractABI/erc721ABI.json";

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [intervalObject, setIntervalObject] = useState(null);
  const [autoStakeActive, setAutoStakeActive] = useState(false);
  const [buttonText, setbuttonText] = useState("Begin auto staking");
  const { ethereum } = window;
  const signer = ethereum.getSigner;
  const mumbaiChainId = "0x13881";
  const DARK_FOREST_CONTRACT = "0xd4F109Ef933161A572f090fE3Dffe7e33814b9F6";
  const UNICORN_NFT_CONTRACT = "0x81511Ab37A82fa9b917B98be86a881Dc6177B022";
  
  const checkIfWalletIsConnected = async () => {

    checkMetamaskInstalled();

    // retrieve a list of accounts associated with the address.
    const accounts = await ethereum.request({method: 'eth_accounts'});
    handleAccountsChanged(accounts);
  }

  const checkMetamaskInstalled = () => {
    if(!ethereum) {
      console.log("Make sure you have metamask");
      Swal.fire({
        title: 'No Metamask Extension Detected',
        text: 'visit: https://metamask.io/',
        icon: 'error',
        confirmButtonText: 'Cool'
      })
      return;
    } else {
      console.log("we have the ethereum object", ethereum);
    }
  }

  // For now, 'eth_accounts' will continue to always return an array
  function handleAccountsChanged(accounts) {
    console.log("handleAccountsChanged called")
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== currentAccount) {
      setCurrentAccount(accounts[0]);
      console.log(`account connected: ${currentAccount}`)
    }
  }

  const connect = async () => {
    
    checkMetamaskInstalled();

    // check which network metamask is currently connected to:
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    
    if (chainId != mumbaiChainId) {
      switchChain();
    }

    console.log("connect called")
    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
  }

  const switchChain = async () => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: mumbaiChainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: mumbaiChainId,
                chainName: 'Mumbai',
                rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }    
  }

  const initiateAutoStake = async () => {
    setAutoStakeActive(true);
    setbuttonText("Auto staking active")

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    const darkForestContract = new ethers.Contract(DARK_FOREST_CONTRACT, darkForestAbiJson, signer);
    const unicornNFTContract = new ethers.Contract(UNICORN_NFT_CONTRACT, cryptoUnicornAbiJson, signer);

    const stakingPeriod = (await darkForestContract.stakePeriodSeconds()).toNumber();
    const interval = (stakingPeriod * 1000 ) + 60000; // +1 minute window to ensure the stakingPeriod has completed for all unicorns
    console.log(`interval: ${interval}`)
    console.log(`Staking Period defined in contract (seconds): ${stakingPeriod}`);
    console.log(`This script will unstake/restake every ${interval/1000} seconds`);

    // perform once immediately
    autoStake(darkForestContract, unicornNFTContract)
    // the perform every interval
    const i = setInterval(() => {
        autoStake(darkForestContract, unicornNFTContract);
    }, interval);
    setIntervalObject(i);
  }

  const autoStake = async (darkForestContract, unicornNFTContract) => {
    
    const gas_price = ethers.utils.parseUnits(String(40.0), 'gwei');

    let date = new Date();
        console.log("*******************************************")
        console.log(`Auto Stake Trigger ${date}`);

        // find out how many unicorns the user has staked
        const stakedUnicorns = (await darkForestContract.numStaked(currentAccount)).toNumber();
        
        // if user has unicorns staked, unstake them if possible
        if (stakedUnicorns > 0) {
            let unicorns = [];
            console.log(`User has ${stakedUnicorns} unicorns staked in the Dark Forest contract`)
            let count = 0;
            for(let i = 0; i < stakedUnicorns; i++){
                const tokenId = (await darkForestContract.tokenOfStakerByIndex(currentAccount, i)).toNumber();
                const unstakedAt = (await darkForestContract.unstakesAt(tokenId)).toNumber();
                const timeNow = Math.floor(Date.now() / 1000);
                const canUnstake = timeNow > unstakedAt;

                if (canUnstake) {
                    count++
                }

                unicorns.push({
                    i,
                    tokenId,
                    canUnstake
                });
            }
            console.log(`${count} unicorns can be unstaked`)

            for (let i = 0; i < stakedUnicorns; i++) {
                const unicorn = unicorns[i];
                if (unicorn.canUnstake) {
                    console.log(`Unstaking Unicorn #${unicorn.tokenId}...`)
                    // Unstake
                    try {
                        const tx = await darkForestContract.exitForest(unicorn.tokenId);
                        console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
                        await tx.wait();
                    } catch (err) {
                        console.error(err);
                        process.exit(1);
                    }
                }
            }
            console.log(`Unstaking complete`)
        } 
        
        // If the user has unicorns in their wallet, we assume they want to stake them.
        const balanceOf = (await unicornNFTContract.balanceOf(currentAccount)).toNumber();

        if (balanceOf > 0) {
            let unicorns = [];
            for (let i = 0; i < balanceOf; i++) {
                const tokenId = (await unicornNFTContract.tokenOfOwnerByIndex(currentAccount, i)).toNumber();
                unicorns.push({
                    i,
                    tokenId
                })
            }
            console.log(`The user has ${unicorns.length} unicorns to stake`);

            for (let i = 0; i < balanceOf; i++) {
                const unicorn = unicorns[i];
                console.log(`Staking Unicorn #${unicorn.tokenId}...`);
                try {
                    // Stake
                    const tx = await unicornNFTContract['safeTransferFrom(address,address,uint256,bytes)'](
                        currentAccount, // from
                        DARK_FOREST_CONTRACT, // to
                        unicorn.tokenId, // tokenId
                        gas_price
                    );
                    console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`)
                    await tx.wait();
                } catch (err) {
                    console.error(err);
                    process.exit(1);
                }
            }
            console.log(`Staking complete`)
        } else {
            console.log(`User has no unicorns to stake`)
        }
  }

  const killProcess = () => {
    setAutoStakeActive(false);
    setbuttonText("Begin auto staking")
    console.log("kill process");
    clearInterval(intervalObject);
  }

  useEffect(() => {
    console.log("useEffect called");
    // This runs our function when the page loads
    checkIfWalletIsConnected();
  }, [])

  const renderNotConnectedContainer = () => (
    <button onClick={connect} className="cta-button connect-wallet-button">
      Connect Wallet
    </button>
  );

  const renderAutoStakeUI = () => (
    <div>
      <button onClick={initiateAutoStake} 
              className={!autoStakeActive ? "cta-button connect-wallet-button" : "disabled-button"} 
              disabled={autoStakeActive}>
        {buttonText}
      </button>
      <br/><br/>
      <button onClick={killProcess} 
              className={!autoStakeActive ? "disabled-button" : "cta-button connect-wallet-button"}
              disabled={!autoStakeActive}>
        Cancel
      </button>
    </div>  
  )

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
