const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const Contract = await hre.ethers.getContractFactory('SimpleVoting');
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log('SimpleVoting deployed at:', addr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


