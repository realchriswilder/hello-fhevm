// Placeholder ABI and address for castVote/requestDecryption/getTally
// Replace with your deployed contract ABI

export const VOTING_CONTRACT_ADDRESS = (import.meta.env.VITE_VOTING_CONTRACT_ADDRESS as string) || '0x37397E391d90FB63BaB0a5B5512b7fcFbB48bC60';

export const VOTING_CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "sessionId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" }
    ],
    "name": "SessionCreated",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "sessionId", "type": "uint256" },
      { "internalType": "bytes", "name": "encryptedVote", "type": "bytes" },
      { "internalType": "uint8", "name": "voteType", "type": "uint8" },
      { "internalType": "bytes", "name": "inputProof", "type": "bytes" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "durationSeconds", "type": "uint256" } ],
    "name": "createSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "sessionId", "type": "uint256" } ],
    "name": "requestTallyReveal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "sessionId", "type": "uint256" } ],
    "name": "getDecryptionRequestId",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;


