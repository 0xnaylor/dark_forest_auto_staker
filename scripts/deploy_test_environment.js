// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const terminusAddress = "0x040Cf7Ee9752936d8d280062a447eB53808EBc08";
  const unicornMilkStakingReward = 500000000000000000000n;
  const stakePeriodSeconds = 86400;
  const VRFCoordinatorAddress = "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255";
  const linkTokenAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
  const chainlinkVRFKeyhash = "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4";
  const chainlinkVRFFee = 0.0001 * 10 ** 18;

  // Deploy the Crypto Unicorns ERC721 contract
  const CryptoUnicorns = await hre.ethers.getContractFactory("CryptoUnicorns");
  const cryptoUnicorns = await CryptoUnicorns.deploy();
  await cryptoUnicorns.deployed();
  const cryptoUnicornsAddress = cryptoUnicorns.address;
  console.log(`Crypto Unicorns address: ${cryptoUnicornsAddress}`)

  // Deploy the Unicorn Milk ERC20 contract
  const UnicornMilk = await hre.ethers.getContractFactory("UnicornMilk");
  const unicornMilk = await UnicornMilk.deploy();
  await unicornMilk.deployed();
  const unicornMilkAddress = unicornMilk.address;
  console.log(`Unicorn Milk address: ${unicornMilkAddress}`);

  // We get the contract to deploy
  const DarkForest = await hre.ethers.getContractFactory("DarkForest");
  const darkForest = await DarkForest.deploy(
        cryptoUnicornsAddress,
        unicornMilkAddress,
        terminusAddress,
        unicornMilkStakingReward,
        stakePeriodSeconds,
        VRFCoordinatorAddress,
        linkTokenAddress,
        chainlinkVRFFee,
        chainlinkVRFKeyhash
  );

  await darkForest.deployed();

  console.log("DarkForest deployed to:", darkForest.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
