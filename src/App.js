import './styles/App.css';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [autoStakeActive, setAutoStakeActive] = useState(false);
  const [buttonText, setbuttonText] = useState("Begin auto staking");
  const { ethereum } = window;
  
  const checkIfWalletIsConnected = async () => {

    if(!ethereum) {
      console.log("Make sure you have metamask");
      return;
    } else {
      console.log("we have the ethereum object", ethereum);
    }

    // retrieve a list of accounts associated with the address.
    const accounts = await ethereum.request({method: 'eth_accounts'});
    handleAccountsChanged(accounts);
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

  function connect() {
    // mumbai chain 80001
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

  const initiateAutoStake = async () => {
    setAutoStakeActive(true);
    setbuttonText("Auto staking active")
    console.log("placeholder")
  }

  const killProcess = () => {
    setAutoStakeActive(false);
    setbuttonText("Begin auto staking")
    console.log("kill process");
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
