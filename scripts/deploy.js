const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const [account] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", account.address);
  const weiBalance = (await account.getBalance()).toString();
  console.log("Account balance:", (await ethers.utils.formatEther(weiBalance)));

  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();
  console.log("nftMarketplace deployed to:", nftMarketplace.address);

  fs.writeFileSync('./config.js', `export const marketplaceAddress = "${nftMarketplace.address}"`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
