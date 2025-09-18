require('dotenv/config');
require('@nomicfoundation/hardhat-ethers');
require('@nomicfoundation/hardhat-verify');
require('@nomicfoundation/hardhat-chai-matchers');

const INFURA_API_KEY = (process.env.INFURA_API_KEY || '34c3a5f3ecf943498710543fe38b50f4').trim();
const SEPOLIA_RPC_URL = (
  process.env.SEPOLIA_RPC_URL || (INFURA_API_KEY ? `https://sepolia.infura.io/v3/${INFURA_API_KEY}` : 'https://rpc.sepolia.org')
).trim();
const RAW_PK = (process.env.PRIVATE_KEY || '').trim();
const PRIVATE_KEY = RAW_PK ? (RAW_PK.startsWith('0x') ? RAW_PK : `0x${RAW_PK}`) : '';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: {
    version: '0.8.24',
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      timeout: 120000,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

module.exports = config;


