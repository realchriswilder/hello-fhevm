// Contract interaction types

export interface VotingContract {
  address: string;
  abi: any[];
}

export interface VoteTransactionData {
  encryptedVote: Uint8Array;
  proof?: Uint8Array;
}

export interface ContractVoteResult {
  hash: string;
  blockNumber?: number;
  gasUsed?: bigint;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface TallyData {
  encryptedTally: Uint8Array;
  totalVotes: bigint;
  votingActive: boolean;
  decryptionRequested: boolean;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer?: string;
  currency: {
    symbol: string;
    decimals: number;
  };
}

export const SEPOLIA_TESTNET: NetworkConfig = {
  chainId: 11155111,
  name: 'Sepolia Testnet',
  rpcUrl: (import.meta as any).env?.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
  blockExplorer: 'https://sepolia.etherscan.io',
  currency: {
    symbol: 'ETH',
    decimals: 18,
  },
};

// Mock contract ABI (for tutorial)
export const VOTING_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "encryptedVote", 
        "type": "bytes"
      }
    ],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTally",
    "outputs": [
      {
        "internalType": "bytes", 
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requestDecryption",
    "outputs": [],
    "stateMutability": "nonpayable", 
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDecryptedTally",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "yesVotes",
        "type": "uint256" 
      },
      {
        "internalType": "uint256",
        "name": "noVotes", 
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;