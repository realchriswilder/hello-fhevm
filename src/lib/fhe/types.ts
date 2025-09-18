// FHE Integration Types

export interface FheClientConfig {
  networkUrl: string;
  chainId: number;
  aclAddress?: string;
  kmsVerifierAddress?: string;
}

export interface EncryptedValue {
  data: Uint8Array;
  type: 'boolean' | 'uint8' | 'uint16' | 'uint32' | 'uint64';
  handles?: string[];
}

export interface FheKeys {
  publicKey: Uint8Array;
  privateKey?: Uint8Array;
  serverKey?: Uint8Array;
}

export interface DecryptionRequest {
  ciphertext: Uint8Array;
  aclAddress: string;
  signature?: string;
}

export interface TallyResult {
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  isDecrypted: boolean;
  requestId?: string;
}

export type FheInitStatus = 
  | 'idle' 
  | 'initializing' 
  | 'ready' 
  | 'error';

export class FheError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, options: { code: string; details?: any }) {
    super(message);
    this.name = 'FheError';
    this.code = options.code;
    this.details = options.details;
  }
}

// Vote choice for the demo
export type VoteChoice = 'yes' | 'no';

// Encryption result with metadata
export interface EncryptionResult {
  ciphertext: Uint8Array;
  proof?: Uint8Array;
  publicKey: Uint8Array;
  handle: string;
  inputType: string;
}

// Contract interaction types
export interface VoteTransaction {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  encryptedVote: Uint8Array;
  timestamp: number;
  choice: VoteChoice; // Client-side only, not sent to contract
}