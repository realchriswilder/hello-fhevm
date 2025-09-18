import { ethers } from 'ethers';
import { 
  VoteTransactionData, 
  ContractVoteResult, 
  TallyData, 
  VOTING_CONTRACT_ABI 
} from './types';
import { TallyResult } from '../fhe/types';

// This service powers the tutorial UI. There are two implementations:
// - MockVotingService: local simulation so beginners can complete the flow without a deployed contract
// - RealVotingService: scaffold for your real on-chain calls (to be implemented)
//
// Educational overview (frontend ↔ contract ↔ relayer):
// 1) Frontend encryption
//    - Use the Relayer SDK instance (initializeFheInstance) to encrypt locally.
//    - The result is an encrypted handle/bytes suitable for ABI input: externalEuint64/externalEbool etc.
//    - Example (Yes vote):
//      const fhe = await initializeFheInstance();
//      const weight = await fhe.encryptU64(1); // returns a 0x.. handle/bytes
//      await contract.vote(sessionId, weight, 1 /* voteType yes */, proof);
//
// 2) Contract computation (see ContractOverview step)
//    - FHE.fromExternal(encrypted, proof) → euintX
//    - TFHE.select / TFHE.add → homomorphic update of yes/no counters
//    - FHE.allowThis(ciphertext) → later request decryption of the tallies
//
// 3) Reveal aggregates only
//    - Contract calls FHE.requestDecryption([toBytes32(yes), toBytes32(no)], resolveTallyCallback)
//    - Relayer/Oracle calls resolveTallyCallback(requestId, revealedYes, revealedNo, signatures)
//    - Contract must call FHE.checkSignatures(requestId, signatures) before persisting plaintext totals
//
// 4) Frontend fetches decrypted totals and renders the results
//
// With this in mind, swap MockVotingService → RealVotingService once your contract is deployed on Sepolia.

class MockVotingService {
  private contractAddress: string;
  private mockTally = { yes: 0, no: 0 };
  private mockDecryptionRequested = false;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
  }

  async castVote(voteData: VoteTransactionData): Promise<ContractVoteResult> {
    console.log('📝 Submitting encrypted vote to contract...');
    console.log('📍 Contract:', this.contractAddress);
    console.log('📦 Encrypted data size:', voteData.encryptedVote.length, 'bytes');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock transaction hash
    const hash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Simulate vote counting (for demo purposes)
    // In real implementation, this would happen on-chain with FHE
    const isYesVote = voteData.encryptedVote[0] % 2 === 1; // Mock decryption logic
    if (isYesVote) {
      this.mockTally.yes++;
    } else {
      this.mockTally.no++;
    }

    return {
      hash,
      status: 'confirmed',
      blockNumber: Math.floor(Math.random() * 1000000) + 100000,
      gasUsed: BigInt(85000)
    };
  }

  async getTally(): Promise<TallyData> {
    console.log('📊 Fetching encrypted tally from contract...');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock encrypted tally (would be actual encrypted data in production)
    const mockEncryptedTally = new Uint8Array(64);
    crypto.getRandomValues(mockEncryptedTally);

    return {
      encryptedTally: mockEncryptedTally,
      totalVotes: BigInt(this.mockTally.yes + this.mockTally.no),
      votingActive: true,
      decryptionRequested: this.mockDecryptionRequested
    };
  }

  async requestDecryption(): Promise<ContractVoteResult> {
    console.log('🔓 Requesting tally decryption...');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    this.mockDecryptionRequested = true;

    return {
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      status: 'confirmed'
    };
  }

  async getDecryptedTally(): Promise<TallyResult | null> {
    if (!this.mockDecryptionRequested) {
      return null;
    }

    console.log('📈 Fetching decrypted tally...');
    
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      yesVotes: this.mockTally.yes,
      noVotes: this.mockTally.no,
      totalVotes: this.mockTally.yes + this.mockTally.no,
      isDecrypted: true,
      requestId: `req_${Date.now()}`
    };
  }

  // Reset for demo purposes
  resetVotes(): void {
    this.mockTally = { yes: 0, no: 0 };
    this.mockDecryptionRequested = false;
    console.log('🔄 Vote tally reset');
  }

  // Get current status for UI
  getStatus() {
    return {
      totalVotes: this.mockTally.yes + this.mockTally.no,
      decryptionRequested: this.mockDecryptionRequested,
      contractAddress: this.contractAddress
    };
  }
}

// Real voting service (placeholder for production)
class RealVotingService extends MockVotingService {
  private provider: ethers.Provider | null = null;
  private contract: ethers.Contract | null = null;

  constructor(contractAddress: string, provider?: ethers.Provider) {
    super(contractAddress);
    this.provider = provider || null;
    
    if (this.provider && contractAddress !== '0x0000000000000000000000000000000000000000') {
      this.contract = new ethers.Contract(contractAddress, VOTING_CONTRACT_ABI, this.provider);
    }
  }

  async castVote(voteData: VoteTransactionData): Promise<ContractVoteResult> {
    if (!this.contract) {
      throw new Error('Contract not initialized - check VITE_CONTRACT_ADDRESS');
    }

    // TODO: Implement real contract interaction
    // Example sketch:
    // const tx = await this.contract.castVote(voteData.encryptedVote);
    // const receipt = await tx.wait();
    // return { hash: tx.hash, status: receipt.status === 1 ? 'confirmed' : 'failed', gasUsed: receipt.gasUsed };
    throw new Error('Real contract service not implemented yet. Set VITE_USE_MOCKS=true');
  }

  // TODO: Implement other real contract methods (getTally, requestDecryption, getDecryptedTally)
}

// Factory function
export function createVotingService(
  contractAddress: string, 
  provider?: ethers.Provider
): MockVotingService {
  const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';
  
  if (useMocks) {
    console.log('🔧 Using Mock Voting Service for tutorial');
    return new MockVotingService(contractAddress);
  } else {
    console.log('🔧 Using Real Voting Service');
    return new RealVotingService(contractAddress, provider);
  }
}

// Default service instance
export const getDefaultVotingService = (): MockVotingService => {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
  return createVotingService(contractAddress);
};