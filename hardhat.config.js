require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
const privatekeys=process.env.PRIVATE_KEYS || ""
module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {},
    sepolia:{
    url:`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: privatekeys.split(",")
    },
    amoy:{
      url:`https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts:privatekeys.split(",")
    },
  },
};
