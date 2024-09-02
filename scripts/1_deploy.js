const hre = require("hardhat");
const { ethers } = require('hardhat');
async function main() {
  console.log(`Preparing deployment...\n`)
  // Fetch contract to deploy
  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')
  // Fetch accounts
  const accounts = await ethers.getSigners()
  console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)
  // Deploy contracts
  const mUSD = await Token.deploy('Mock USD', 'mUSD', '1000000')
  await mUSD.deployed()
  console.log(`mUSD Deployed to: ${mUSD.address}`)
  const mTHETA = await Token.deploy('Mock Theta', 'mTHETA', '1000000')
  await mTHETA.deployed()
  console.log(`mTHETA Deployed to: ${mTHETA.address}`)
  const mBNB = await Token.deploy('mBNB', 'mBNB', '1000000')
  await mBNB.deployed()
  console.log(`mBNB Deployed to: ${mBNB.address}`)
  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange Deployed to: ${exchange.address}`)
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
