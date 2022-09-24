require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

module.exports = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: process.env.NETWORK_ENDPOINT_URL,
      chainId: 31337
    },
    hardhat: {
      chainId: 31337
    },
    /*goreli: {
      url: process.env.NETWORK_ENDPOINT_URL,
      accounts: [process.env.PRIVATE_KEY]
    },*/
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
