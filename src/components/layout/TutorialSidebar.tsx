import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  BookOpen, 
  Code, 
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useTutorialStore, TutorialStep } from '@/state/tutorialStore';
import { cn } from '@/lib/utils';

interface TutorialContent {
  layman: {
    title: string;
    content: string[];
    tips?: string[];
    keyPoints?: string[];
  };
  technical: {
    title: string;
    content: string[];
    code?: { language: string; snippet: string; description: string }[];
    commands?: { description: string; command: string }[];
    links?: { title: string; url: string; description: string }[];
  };
}

// Tutorial content for each step
const tutorialContent: Record<TutorialStep, TutorialContent> = {
  welcome: {
    layman: {
      title: "Welcome to Confidential Computing! 🎉",
      content: [
        "We'll build a tiny voting app where your choice stays secret, but the final count is visible to everyone.",
        "Think of it like a ballot box that can count votes without anyone peeking inside. The blockchain can add up the votes while they remain encrypted!",
        "What is FHE? Fully Homomorphic Encryption lets computers do math on locked data without unlocking it.",
        "What is FHEVM? It's an Ethereum-like virtual machine from Zama where smart contracts can perform those encrypted computations on-chain.",
        "By the end of this tutorial, you'll understand how to build applications that protect user privacy while still being transparent and verifiable."
      ],
      keyPoints: [
        "🗳️ Votes stay private until the final reveal",
        "⛓️ Everything runs on blockchain for transparency", 
        "🔐 Learn real-world confidential computing",
        "🚀 Build your first privacy-preserving dApp"
      ]
    },
    technical: {
      title: "FHEVM Technical Overview",
      content: [
        "Definitions: FHE = crypto that supports arithmetic/comparisons directly on ciphertexts; results remain encrypted until decrypted.",
        "FHEVM = EVM-compatible runtime by Zama exposing FHE types/ops in smart contracts via the Relayer library.",
        "Flow: client encrypts → contract computes on ciphertexts → authorized party/network performs controlled decryption of aggregates.",
        "This dApp demonstrates encrypted inputs, homomorphic tallying, and controlled decryption end‑to‑end."
      ],
      links: [
        {
          title: "Zama FHEVM Documentation",
          url: "https://docs.zama.ai",
          description: "Complete technical documentation"
        },
        {
          title: "FHE Fundamentals",
          url: "https://docs.zama.ai/protocol/protocol/overview/library",
          description: "Deep dive into FHE concepts"
        },
        {
          title: "Relayer SDK Development Guide",
          url: "https://docs.zama.ai/protocol/relayer-sdk-guides/development-guide/webapp",
          description: "Complete guide for building web applications with the Relayer SDK"
        }
      ]
    }
  },
  "environment-setup": {
    layman: {
      title: "Setting Up Your Development Environment 🛠️",
      content: [
        "Before we start building, we need to install some tools. Think of this like setting up your workshop before starting a project.",
        "We'll install Node.js (the engine that runs our code), pnpm (a package manager), and set up environment variables (configuration settings).",
        "Don't worry if this seems technical - we'll guide you through each step!"
      ],
      tips: [
        "💡 Copy commands exactly as shown",
        "🔍 Check each step before moving to the next",
        "❓ Ask for help if you get stuck on installation"
      ]
    },
    technical: {
      title: "Development Environment Setup",
      content: [
        "Set up a complete FHEVM development environment with all required dependencies and configuration.",
        "Configure network settings for Sepolia Testnet, environment variables for contract addresses, and development tools."
      ],
      commands: [
        {
          description: "Install Node.js (v18+ required)",
          command: "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        },
        {
          description: "Install pnpm package manager",
          command: "npm install -g pnpm"
        },
        {
          description: "Install project dependencies", 
          command: "pnpm install"
        },
        {
          description: "Copy environment file",
          command: "cp .env.example .env"
        }
      ]
    }
  },
  "connect-wallet": {
    layman: {
      title: "Connecting Your Digital Wallet 👛",
      content: [
        "A wallet is like your digital ID card. It proves who you are and lets you interact with the blockchain.",
        "We'll connect MetaMask (or another wallet) and switch to the Zama test network where our voting app lives.",
        "Think of networks like different cities - we need to be in the right city (network) to use our app!"
      ],
      keyPoints: [
        "🦊 MetaMask is the most popular wallet",
        "🌐 Networks are like different blockchains",
        "🔗 Sepolia Testnet is where we'll test our app",
        "💰 Test tokens are free and just for learning"
      ]
    },
    technical: {
      title: "Wallet Integration & Network Configuration",
      content: [
        "Implement wallet connection using Wagmi and RainbowKit for a smooth user experience.",
        "Configure automatic network switching to Sepolia Testnet with proper error handling and user feedback.",
        "Set up account monitoring and balance tracking for the tutorial interface."
      ],
      code: [
        {
          language: "typescript",
          snippet: `const { address, isConnected } = useAccount();
const { chain } = useNetwork();
const { switchNetwork } = useSwitchNetwork();

// Check if on correct network
const isCorrectNetwork = chain?.id === 8009;`,
          description: "Wagmi hooks for wallet state management"
        }
      ]
    }
  },
  "fhe-basics": {
    layman: {
      title: "Understanding Encryption Magic 🪄",
      content: [
        "Layman: FHE is like doing math on locked boxes – the chain can add them without opening.",
        "Normal encryption protects data at rest/in transit. FHE adds privacy during computation as well.",
        "We will count Yes/No votes privately and only reveal totals."
      ],
      keyPoints: [
        "🔒 Homomorphic = 'same shape' - operations work on encrypted data",
        "➕ Can add, subtract, multiply encrypted numbers",
        "🔐 Results stay encrypted until we decide to decrypt",
        "⛓️ All computation happens on the public blockchain"
      ]
    },
    technical: {
      title: "Fully Homomorphic Encryption (FHE) Deep Dive",
      content: [
        "Technical: evaluate arithmetic/logic circuits on ciphertexts; decrypting the result equals the plaintext computation.",
        "FHEVM: ebool, euint8/16/32/64, ops: +, -, *, comparisons, logical, bitwise; permission with allowThis; decryption via requestDecryption + callback.",
        "Noise/circuit depth matter for complex circuits; tallies remain straightforward."
      ],
      code: [
        {
          language: "typescript", 
          snippet: `// 1. Initialize FHE instance (client-side)
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

let fheInstance: any = null;

export async function initializeFheInstance() {
  await initSDK(); // Load WASM
  const config = { ...SepoliaConfig, network: (window as any).ethereum };
  fheInstance = await createInstance(config);
  return fheInstance;
}`,
          description: "Step 1: Initialize FHE instance with Relayer SDK"
        },
        {
          language: "typescript",
          snippet: `// 2. Encrypt vote choice (client-side)
const liveVote = async (choice: 'yes' | 'no') => {
  await initializeFheInstance();
  
  // Pure YES/NO voting - encrypt the choice directly
  const voteChoice = choice === 'yes' ? 1 : 0; // 0 = No, 1 = Yes
  
  const { ethers } = await import('ethers');
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();
  const contractChecksum = ethers.getAddress(CONTRACT_ADDRESS);
  
  // Encrypt the vote choice directly (0 or 1)
  const ciphertext = await fheInstance.createEncryptedInput(contractChecksum, userAddress);
  ciphertext.add8(BigInt(voteChoice)); // Encrypt the choice (0 or 1)
  const { handles, inputProof } = await ciphertext.encrypt();
  const encryptedHex = ethers.hexlify(handles[0]);
  const proofHex = ethers.hexlify(inputProof);
  
  // Call contract's vote function
  const contract = new ethers.Contract(contractChecksum, CONTRACT_ABI, signer);
  const tx = await contract.vote(
    liveSessionId,
    encryptedHex,  // externalEuint8 as bytes32
    proofHex,      // proof as bytes
    { gasLimit: 1000000 }
  );
};`,
          description: "Step 2: Encrypt vote and submit to contract"
        },
        {
          language: "solidity",
          snippet: `// 3. Smart contract processes encrypted vote
function vote(
    uint256 sessionId,
    externalEuint8 encryptedVote,
    bytes calldata proof
) external {
    require(sessionId < sessions.length, "Invalid session");
    Session storage s = sessions[sessionId];
    require(block.timestamp < s.endTime, "Voting ended");
    require(!hasVoted[sessionId][msg.sender], "Already voted");

    euint8 v = FHE.fromExternal(encryptedVote, proof);
    euint8 yes = FHE.asEuint8(1);  // Yes = 1
    euint8 no = FHE.asEuint8(0);   // No = 0
    euint8 one = FHE.asEuint8(1);

    // Add 1 to the correct counter based on vote
    s.yesVotes = FHE.add(s.yesVotes, FHE.select(FHE.eq(v, yes), one, FHE.asEuint8(0)));
    s.noVotes = FHE.add(s.noVotes, FHE.select(FHE.eq(v, no), one, FHE.asEuint8(0)));

    FHE.allowThis(s.yesVotes);  // Allow decryption of encrypted value stored in yesVotes
    FHE.allowThis(s.noVotes);   // Allow decryption of encrypted value stored in noVotes

    hasVoted[sessionId][msg.sender] = true;
    emit VoteCast(sessionId, msg.sender);
}`,
          description: "Step 3: Contract processes encrypted vote homomorphically"
        },
        {
          language: "solidity",
          snippet: `// 4. Request decryption of final tallies
function requestTallyReveal(uint256 sessionId) external {
    require(sessionId < sessions.length, "Invalid session");
    Session storage s = sessions[sessionId];
    require(block.timestamp >= s.endTime, "Voting not ended");
    require(!s.resolved, "Already resolved");
    require(msg.sender == s.creator, "Only creator can request reveal");

    bytes32[] memory cts = new bytes32[](2);
    cts[0] = FHE.toBytes32(s.yesVotes);  // Convert encrypted Yes to bytes32
    cts[1] = FHE.toBytes32(s.noVotes);   // Convert encrypted No to bytes32

    uint256 requestId = FHE.requestDecryption(cts, this.resolveTallyCallback.selector);
    s.decryptionRequestId = requestId;
    sessionIdByRequestId[requestId] = sessionId;
    emit TallyRevealRequested(sessionId, requestId);
}

// 5. Oracle callback with decrypted results
function resolveTallyCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);

    (uint8 revealedYes, uint8 revealedNo) = abi.decode(cleartexts, (uint8, uint8));

    uint256 sessionId = sessionIdByRequestId[requestId];
    Session storage s = sessions[sessionId];
    s.revealedYes = revealedYes;
    s.revealedNo = revealedNo;
    s.resolved = true;
    emit SessionResolved(sessionId, revealedYes, revealedNo);
}`,
          description: "Step 4-5: Request decryption and receive results via callback"
        }
      ],
      links: [
        {
          title: "Relayer Library Reference",
          url: "https://docs.zama.ai/protocol/relayer-sdk-guides/development-guide/webapp",
          description: "Supported FHE operations and types"
        },
        {
          title: "FHEVM Solidity Overview",
          url: "https://docs.zama.ai/protocol/solidity-guides/getting-started/overview",
          description: "Official getting-started guide for FHEVM Solidity"
        }
      ]
    }
  },
  "write-contract": {
    layman: {
      title: "Writing Your First FHEVM Contract 📝",
      content: [
        "Now let's write your very first FHEVM contract! We'll build a simple counter that can add and subtract encrypted numbers.",
        "Think of it like a calculator that works with locked boxes - you can add numbers together without ever seeing what's inside the boxes!",
        "We'll compare this to a regular Solidity counter so you can see exactly what makes FHEVM special.",
        "Don't worry if you're new to Solidity - we'll explain every line step by step!"
      ],
      keyPoints: [
        "🔢 Simple counter with encrypted numbers",
        "➕ Add and subtract without decrypting",
        "🔍 Compare FHEVM vs regular Solidity",
        "📚 Learn FHEVM syntax step by step"
      ],
      tips: [
        "💡 Follow along with the code examples",
        "🔍 Notice the differences from regular Solidity",
        "📝 Try to understand each function as we go",
        "❓ Ask questions if anything seems unclear"
      ]
    },
    technical: {
      title: "FHEVM Counter Contract Deep Dive",
      content: [
        "This step walks through building a complete FHEVM contract from scratch. We'll examine each component and compare it to standard Solidity patterns.",
        "Key concepts covered:",
        "• FHE imports and configuration",
        "• Encrypted data types (euint32, externalEuint32)",
        "• Homomorphic operations (add, sub)",
        "• Permission management (allowThis, allow)",
        "• Input validation and proof verification",
        "",
        "The contract demonstrates core FHEVM patterns that you'll use in more complex applications."
      ],
      code: [
        {
          language: "solidity",
          snippet: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title A simple FHE counter contract
/// @author fhevm-hardhat-template
/// @notice A very basic example contract showing how to work with encrypted data using FHEVM.
contract FHECounter is SepoliaConfig {
    euint32 private _count;

    /// @notice Returns the current count
    /// @return The current encrypted count
    function getCount() external view returns (euint32) {
        return _count;
    }

    /// @notice Increments the counter by a specified encrypted value.
    /// @param inputEuint32 the encrypted input value
    /// @param inputProof the input proof
    /// @dev This example omits overflow/underflow checks for simplicity and readability.
    /// In a production contract, proper range checks should be implemented.
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        _count = FHE.add(_count, encryptedEuint32);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Decrements the counter by a specified encrypted value.
    /// @param inputEuint32 the encrypted input value
    /// @param inputProof the input proof
    /// @dev This example omits overflow/underflow checks for simplicity and readability.
    /// In a production contract, proper range checks should be implemented.
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        _count = FHE.sub(_count, encryptedEuint32);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}`,
          description: "Complete FHEVM Counter Contract - Your first confidential smart contract!"
        },
        {
          language: "solidity",
          snippet: `// Regular Solidity Counter (for comparison)
contract RegularCounter {
    uint32 private _count;
    
    function getCount() external view returns (uint32) {
        return _count;  // Returns plaintext value
    }
    
    function increment(uint32 value) external {
        _count += value;  // Direct arithmetic on plaintext
    }
    
    function decrement(uint32 value) external {
        _count -= value;  // Direct arithmetic on plaintext
    }
}`,
          description: "Regular Solidity Counter - Notice how values are always visible"
        }
      ],
      links: [
        {
          title: "FHEVM Solidity Reference",
          url: "https://docs.zama.ai/protocol/solidity-guides/getting-started/overview",
          description: "Complete FHEVM Solidity documentation"
        },
        {
          title: "FHE Data Types",
          url: "https://docs.zama.ai/protocol/solidity-guides/getting-started/data-types",
          description: "Understanding euint8, euint16, euint32, ebool"
        },
        {
          title: "FHE Operations",
          url: "https://docs.zama.ai/protocol/solidity-guides/getting-started/operations",
          description: "Available homomorphic operations"
        }
      ]
    }
  },
  "private-voting": {
    layman: {
      title: "Live Contract Interaction: Real FHEVM on Sepolia 🗳️",
      content: [
        "Now it's time for the real deal! You'll interact with an actual FHEVM contract deployed on Sepolia testnet.",
        "Create voting sessions, cast encrypted votes, and watch as your transactions are processed on the blockchain.",
        "This is live confidential computing - your votes are encrypted, tallied homomorphically, and only final results are revealed."
      ],
      keyPoints: [
        "🌐 Real contract on Sepolia testnet",
        "🔐 Live encryption and blockchain interaction",
        "📊 Homomorphic tallying on encrypted data",
        "⏰ Time-limited voting sessions"
      ]
    },
    technical: {
      title: "Live SimpleVoting Contract on Sepolia",
      content: [
        "This is the actual deployed contract you're interacting with on Sepolia testnet. It handles encrypted YES/NO voting using FHEVM.",
        "Contract Address: 0xF6edC2121983A17E040d3f8381357104A05761DF",
        "Key features:",
        "• createSession(duration): Creates a new voting session with encrypted vote counters",
        "• vote(sessionId, encryptedVote, proof): Casts an encrypted vote (0=No, 1=Yes)",
        "• requestTallyReveal(sessionId): Requests decryption of final vote counts",
        "• getSession(sessionId): Returns session details and revealed results",
        "",
        "All transactions are real and will appear on Sepolia Etherscan. You can view them at:",
        "https://sepolia.etherscan.io/address/0xF6edC2121983A17E040d3f8381357104A05761DF"
      ],
      code: [
        {
          language: "solidity",
          snippet: `// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, externalEuint8, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SimpleVoting is SepoliaConfig {
    struct Session {
        address creator;
        uint256 endTime;
        euint8 yesVotes;      // Encrypted Yes count
        euint8 noVotes;       // Encrypted No count
        bool resolved;
        uint8 revealedYes;    // Decrypted Yes count
        uint8 revealedNo;     // Decrypted No count
        uint256 decryptionRequestId;
    }

    Session[] public sessions;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => uint256) internal sessionIdByRequestId;

    event SessionCreated(uint256 indexed sessionId, address indexed creator, uint256 endTime);
    event VoteCast(uint256 indexed sessionId, address indexed voter);
    event TallyRevealRequested(uint256 indexed sessionId, uint256 requestId);
    event SessionResolved(uint256 indexed sessionId, uint8 yesVotes, uint8 noVotes);

    function createSession(uint256 durationSeconds) external {
        require(durationSeconds > 0, "Duration must be positive");
        Session memory s = Session({
            creator: msg.sender,
            endTime: block.timestamp + durationSeconds,
            yesVotes: FHE.asEuint8(0),    // Start with encrypted zero
            noVotes: FHE.asEuint8(0),     // Start with encrypted zero
            resolved: false,
            revealedYes: 0,
            revealedNo: 0,
            decryptionRequestId: 0
        });
        sessions.push(s);
        emit SessionCreated(sessions.length - 1, msg.sender, s.endTime);
    }

    // Pure YES/NO voting - encrypt the choice (0 or 1) directly
    function vote(
        uint256 sessionId,
        externalEuint8 encryptedVote,
        bytes calldata proof
    ) external {
        require(sessionId < sessions.length, "Invalid session");
        Session storage s = sessions[sessionId];
        require(block.timestamp < s.endTime, "Voting ended");
        require(!hasVoted[sessionId][msg.sender], "Already voted");

        euint8 v = FHE.fromExternal(encryptedVote, proof);
        euint8 yes = FHE.asEuint8(1);  // Yes = 1
        euint8 no = FHE.asEuint8(0);   // No = 0
        euint8 one = FHE.asEuint8(1);

        // Add 1 to the correct counter based on vote
        s.yesVotes = FHE.add(s.yesVotes, FHE.select(FHE.eq(v, yes), one, FHE.asEuint8(0)));
        s.noVotes = FHE.add(s.noVotes, FHE.select(FHE.eq(v, no), one, FHE.asEuint8(0)));

        FHE.allowThis(s.yesVotes);  // Allow decryption of encrypted value stored in yesVotes
        FHE.allowThis(s.noVotes);   // Allow decryption of encrypted value stored in noVotes

        hasVoted[sessionId][msg.sender] = true;
        emit VoteCast(sessionId, msg.sender);
    }

    function requestTallyReveal(uint256 sessionId) external {
        require(sessionId < sessions.length, "Invalid session");
        Session storage s = sessions[sessionId];
        require(block.timestamp >= s.endTime, "Voting not ended");
        require(!s.resolved, "Already resolved");
        require(msg.sender == s.creator, "Only creator can request reveal");

        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(s.yesVotes);  // Convert encrypted Yes to bytes32
        cts[1] = FHE.toBytes32(s.noVotes);   // Convert encrypted No to bytes32

        uint256 requestId = FHE.requestDecryption(cts, this.resolveTallyCallback.selector);
        s.decryptionRequestId = requestId;
        sessionIdByRequestId[requestId] = sessionId;
        emit TallyRevealRequested(sessionId, requestId);
    }

    function resolveTallyCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        (uint8 revealedYes, uint8 revealedNo) = abi.decode(cleartexts, (uint8, uint8));

        uint256 sessionId = sessionIdByRequestId[requestId];
        Session storage s = sessions[sessionId];
        s.revealedYes = revealedYes;
        s.revealedNo = revealedNo;
        s.resolved = true;
        emit SessionResolved(sessionId, revealedYes, revealedNo);
    }

    function getSession(uint256 sessionId) external view returns (
        address creator,
        uint256 endTime,
        bool resolved,
        uint8 yesVotes,
        uint8 noVotes
    ) {
        require(sessionId < sessions.length, "Invalid session");
        Session storage s = sessions[sessionId];
        return (
            s.creator,
            s.endTime,
            s.resolved,
            s.resolved ? s.revealedYes : 0,
            s.resolved ? s.revealedNo : 0
        );
    }
}`,
          description: "Complete SimpleVoting contract with FHE vote tallying"
        }
      ],
      links: [
        {
          title: "FHEVM Voting Example",
          url: "https://docs.zama.ai/protocol/solidity-guides/getting-started/voting",
          description: "Official FHEVM voting tutorial"
        }
      ]
    }
  },
  "contract-overview": {
    layman: {
      title: "Voting Contract: Where FHE Happens",
      content: [
        "We'll tour the SimpleVoting contract and explain every moving part.",
        "We use normal terms: Yes and No. Votes are stored as encrypted numbers (euint8) and only the final totals are revealed.",
        "Think of it like updating two sealed counters — Yes and No — without ever opening them until the end."
      ],
      keyPoints: [
        "🔢 Encrypted counters: euint8 (Yes/No)",
        "➕ Encrypted add/select to update the right counter",
        "🧭 Reveal totals via requestDecryption + resolveTallyCallback"
      ]
    },
    technical: {
      title: "Contract Walkthrough",
      content: [
        "State: sessions[] holds Session{ creator, endTime, euint8 yesVotes, euint8 noVotes, bool resolved, uint8 revealedYes, uint8 revealedNo, uint256 decryptionRequestId }.",
        "Mappings: hasVoted[sessionId][voter] prevents double voting; sessionIdByRequestId maps decrypt-request back to session.",
        "Events: SessionCreated, VoteCast, TallyRevealRequested, SessionResolved help the UI react in real time.",
        "createSession(durationSeconds): pushes a new Session with yes/no encrypted zeros (FHE.asEuint8(0)) and emits SessionCreated(sessionId, creator, endTime).",
        "vote(sessionId, externalEuint8 encryptedVote, bytes proof): FHE.fromExternal → euint8 v; compute encrypted predicate FHE.eq(v, 1) and update yes/no using FHE.select + FHE.add; call FHE.allowThis on both tallies; set hasVoted; emit VoteCast.",
        "requestTallyReveal(sessionId): only creator after endTime and not resolved; convert both tallies with FHE.toBytes32; FHE.requestDecryption([yes,no], resolveTallyCallback) returns requestId; store mapping; emit TallyRevealRequested.",
        "resolveTallyCallback(requestId, cleartexts, decryptionProof): FHE.checkSignatures verifies; abi.decode(cleartexts,(uint8,uint8)) → revealedYes/revealedNo; write into session and mark resolved; emit SessionResolved.",
        "getSession(sessionId): returns creator, endTime, resolved, and clear totals only if resolved (otherwise 0). getSessionCount() returns sessions.length."
      ],
      code: [
        {
          language: "solidity",
          snippet: `SimpleVoting — monospace walkthrough
Read top-to-bottom. Sections mirror the UI steps.

STATE
  creator              : session owner
  endTime              : voting deadline
  yesVotes (euint8)    : encrypted YES count
  noVotes  (euint8)    : encrypted NO count
  resolved             : have results been revealed?
  revealedYes (uint8)  : clear YES (after reveal)
  revealedNo  (uint8)  : clear NO  (after reveal)
  decryptionRequestId  : track reveal request
  sessions[]           : all sessions
  hasVoted[sessionId][addr] : prevent double voting
  sessionIdByRequestId : map requestId → sessionId

EVENTS (UI hooks)
  SessionCreated(id, creator, endTime)
  VoteCast(id, voter)
  TallyRevealRequested(id, requestId)
  SessionResolved(id, yes, no)

FLOW
  1) createSession(durationSeconds)
     • push a new Session with encrypted zeros
     • emit SessionCreated

  2) vote(sessionId, externalEuint8 c, bytes proof)
     • v     = FHE.fromExternal(c, proof)        ← verify + import ciphertext
     • isYes = FHE.eq(v, 1)                      ← encrypted predicate (0/1)
     • yesVotes = FHE.add(yesVotes, FHE.select(isYes, 1, 0))
     • noVotes  = FHE.add(noVotes,  FHE.select(isYes, 0, 1))
     • FHE.allowThis(yesVotes) and FHE.allowThis(noVotes)  ← authorize reveal
     • mark hasVoted and emit VoteCast

  3) requestTallyReveal(sessionId)
     • require creator, time over, not resolved
     • cts = [FHE.toBytes32(yesVotes), FHE.toBytes32(noVotes)]
     • requestId = FHE.requestDecryption(cts, resolveTallyCallback)
     • sessionIdByRequestId[requestId] = sessionId; emit TallyRevealRequested

  4) resolveTallyCallback(requestId, cleartexts, proof)
     • FHE.checkSignatures(requestId, cleartexts, proof)   ← authenticate
     • (y, n) = abi.decode(cleartexts, (uint8, uint8))
     • write y/n, set resolved = true, emit SessionResolved

VIEW HELPER
  getSession(id) → creator, endTime, resolved, and clear totals
  (totals are 0 until resolved).`,
          description: "Commented walkthrough of SimpleVoting showing state, events, and each function with Solidity-style comments"
        }
      ],
      links: [
        {
          title: "FHEVM Solidity Overview",
          url: "https://docs.zama.ai/protocol/solidity-guides/getting-started/overview",
          description: "Official getting-started guide for FHEVM Solidity"
        }
      ]
    }
  },
  "deploy-test-counter": {
    layman: {
      title: "Deploy & Test FHE Counter: Real Blockchain Experience 🚀",
      content: [
        "Now it's time to deploy the FHE counter contract to Sepolia testnet and interact with it in real-time!",
        "You'll experience the full FHEVM workflow: deploy a contract, encrypt values, perform homomorphic operations, and decrypt results.",
        "This gives you hands-on experience with how FHE contracts work on a live blockchain - no more simulations!"
      ],
      keyPoints: [
        "🚀 Deploy FHE counter to Sepolia testnet",
        "🔐 Encrypt values using your wallet",
        "➕ Perform homomorphic increment/decrement operations",
        "🔍 Decrypt and view results in real-time"
      ]
    },
    technical: {
      title: "Live FHE Counter Deployment & Testing",
      content: [
        "Deploy FHECounter contract to Sepolia using your connected wallet. The contract uses euint32 for encrypted counter storage.",
        "Test initial state: getCount() returns bytes32(0) indicating uninitialized encrypted value.",
        "Increment test: encrypt value 1 using fhevm.createEncryptedInput(), call increment() with encrypted input and proof, verify count increased by 1.",
        "Decrement test: encrypt value 1, call decrement(), verify count decreased by 1 back to 0.",
        "All operations use FHEVM's encryption/decryption workflow with proper proof generation and verification.",
        "Monitor transaction status, gas usage, and encrypted state changes through the terminal interface."
      ],
      code: [
        {
          language: "typescript",
          snippet: `// Deploy FHECounter contract
const factory = await ethers.getContractFactory("FHECounter");
const fheCounter = await factory.deploy();
const address = await fheCounter.getAddress();

// Encrypt value for homomorphic operation
const encryptedOne = await fhevm
  .createEncryptedInput(address, signer.address)
  .add32(1)
  .encrypt();

// Call increment with encrypted input
const tx = await fheCounter
  .connect(signer)
  .increment(encryptedOne.handles[0], encryptedOne.inputProof);
await tx.wait();

// Decrypt and verify result
const encryptedCount = await fheCounter.getCount();
const clearCount = await fhevm.userDecryptEuint(
  FhevmType.euint32,
  encryptedCount,
  address,
  signer
);`,
          description: "Complete FHE counter deployment and testing workflow"
        }
      ],
      links: [
        {
          title: "FHEVM Deployment Guide",
          url: "https://docs.zama.ai/",
          description: "Official FHEVM deployment and testing documentation"
        },
        {
          title: "Sepolia Testnet Faucet",
          url: "https://sepoliafaucet.com/",
          description: "Get test ETH for Sepolia transactions"
        }
      ]
    }
  },
  "testing-playground": {
    layman: {
      title: "FHE Testing Playground: Learn by Doing 🧪",
      content: [
        "This is your sandbox to experiment with FHE operations before diving into real contract interactions!",
        "Run different scenarios to see how encryption, homomorphic operations, and decryption work step by step.",
        "Watch the terminal output to understand exactly what's happening behind the scenes - it's like having X-ray vision into the FHE process!"
      ],
      keyPoints: [
        "🧪 Safe environment to experiment with FHE",
        "📊 See real-time encryption and computation",
        "🔍 Understand the complete FHE workflow",
        "⚡ Test different scenarios and edge cases"
      ],
      tips: [
        "💡 Try running all scenarios to see the full picture",
        "🔍 Watch the terminal logs carefully - they show every step",
        "🧪 Experiment with different vote combinations",
        "❓ Use this to debug before real contract interaction"
      ]
    },
    technical: {
      title: "FHE Testing Scenarios Deep Dive",
      content: [
        "The Testing Playground provides four comprehensive scenarios that demonstrate different aspects of FHEVM development:",
        "",
        "1. Basic Vote Encryption: Demonstrates client-side encryption using the Relayer SDK. Shows how to create encrypted inputs, add vote choices, and generate proofs.",
        "2. Homomorphic Vote Tallying: Simulates encrypted vote counting without decryption. Shows how FHE operations work on encrypted data to maintain privacy.",
        "3. Contract Logic Simulation: Complete end-to-end simulation of the SimpleVoting contract workflow. Demonstrates session creation, voting, and tally reveal process.",
        "4. Error Handling & Edge Cases: Tests invalid inputs, double voting prevention, and boundary conditions to ensure robust contract behavior.",
        "",
        "Each scenario includes detailed logging that shows the exact FHE operations being performed, making it easy to understand the underlying cryptographic processes."
      ],
      code: [
        {
          language: "typescript",
          snippet: `// Basic Vote Encryption Scenario
const fheInstance = getFheInstance();
const contractAddress = '0x1234...';
const userAddress = '0xabcd...';
const voteChoice = 1; // YES vote

// Create encrypted input
const ciphertext = await fheInstance.createEncryptedInput(contractAddress, userAddress);
ciphertext.add8(BigInt(voteChoice));

// Encrypt and generate proof
const { handles, inputProof } = await ciphertext.encrypt();
const encryptedHex = ethers.hexlify(handles[0]);
const proofHex = ethers.hexlify(inputProof);`,
          description: "Client-side vote encryption process"
        },
        {
          language: "typescript",
          snippet: `// Homomorphic Tallying Simulation
const votes = [1, 0, 1, 1, 0, 1, 0]; // Encrypted votes
let yesCount = 0;
let noCount = 0;

for (const vote of votes) {
  // Simulate FHE operations on encrypted data
  if (vote === 1) {
    yesCount++; // FHE.add(yesVotes, FHE.select(FHE.eq(vote, 1), 1, 0))
  } else {
    noCount++; // FHE.add(noVotes, FHE.select(FHE.eq(vote, 0), 1, 0))
  }
}`,
          description: "Homomorphic vote counting simulation"
        },
        {
          language: "solidity",
          snippet: `// Contract Logic Simulation
function simulateVoteProcessing() {
  // 1. Session Creation
  Session memory s = Session({
    creator: msg.sender,
    endTime: block.timestamp + duration,
    yesVotes: FHE.asEuint8(0),  // Encrypted zero
    noVotes: FHE.asEuint8(0)    // Encrypted zero
  });
  
  // 2. Vote Processing
  euint8 v = FHE.fromExternal(encryptedVote, proof);
  euint8 yes = FHE.asEuint8(1);
  euint8 no = FHE.asEuint8(0);
  euint8 one = FHE.asEuint8(1);
  
  // 3. Homomorphic Tallying
  s.yesVotes = FHE.add(s.yesVotes, FHE.select(FHE.eq(v, yes), one, FHE.asEuint8(0)));
  s.noVotes = FHE.add(s.noVotes, FHE.select(FHE.eq(v, no), one, FHE.asEuint8(0)));
}`,
          description: "Contract-side FHE vote processing"
        }
      ],
      links: [
        {
          title: "FHEVM Testing Guide",
          url: "https://docs.zama.ai/protocol",
          description: "Official testing and debugging guide"
        },
        {
          title: "Relayer SDK Testing",
          url: "https://docs.zama.ai/protocol/relayer-sdk-guides/development-guide/webapp#testing",
          description: "Testing patterns for web applications"
        }
      ]
    }
  },
  review: {
    layman: {
      title: "Congratulations! You Built a Confidential dApp! 🎉",
      content: [
        "You've just built your first privacy-preserving application! You learned how to encrypt data, perform computations on encrypted data, and decrypt results when needed.",
        "This same technology can be used for private auctions, confidential trading, secure voting systems, and many other applications where privacy matters.",
        "The future of blockchain is not just transparent - it's selectively transparent, revealing only what needs to be public."
      ],
      keyPoints: [
        "🏆 You built a working confidential application",
        "🔐 Learned client-side encryption with fhevmjs", 
        "⛓️ Performed homomorphic operations onchain",
        "🔓 Controlled decryption of aggregate results"
      ]
    },
    technical: {
      title: "Master FHEVM Development: Your Next Journey",
      content: [
        "🎯 What you've accomplished: You mastered the full FHEVM cycle — client-side encryption, on-chain homomorphic computation, and controlled decryption. You can now build privacy-preserving apps with verifiable results.",
        "",
        "🚀 Immediate next steps (start building):",
        "• Deploy to production: Use the Hardhat template to deploy on Zama Mainnet",
        "• Build real applications: Private auctions, confidential trading, secure governance",
        "• Join the community: Connect with FHEVM developers on Discord and the forum",
        "• Explore templates: React, Next.js, and Vue starters for fast frontends",
        "",
        "🔧 Advanced areas to explore:",
        "• Access control lists: Fine‑grained permissions for decryption",
        "• Threshold decryption: Require multiple parties to authorize reveals",
        "• Circuit optimization: Reduce gas and improve performance",
        "• Integration patterns: Connect FHEVM with DeFi protocols",
        "",
        "📚 Essential resources for continued learning:",
        "• Zama whitepaper: Cryptographic foundations and principles",
        "• FHEVM contracts library: Pre‑built confidential contracts",
        "• AI coding assistant: Help for Solidity and FHEVM development",
        "• Bounty program: Earn rewards while building",
        "",
        "🎓 Knowledge check — test your understanding:",
        "Complete the quiz below to validate your grasp of key concepts."
      ],
      links: [
        {
          title: "FHEVM Production Guide",
          url: "https://docs.zama.ai/",
          description: "Deploy to mainnet"
        },
        {
          title: "Advanced FHE Patterns", 
          url: "https://docs.zama.ai/protocol/examples/basic/encryption/fhe-encrypt-multiple-values/",
          description: "Complex use cases and optimizations"
        },
        {
          title: "Zama Community Discord",
          url: "https://discord.gg/zama",
          description: "Join the developer community"
        },
        {
          title: "FHEVM Contracts Library",
          url: "https://docs.zama.ai",
          description: "Pre-built confidential contracts"
        },
        {
          title: "Zama Bounty Program",
          url: "https://www.zama.ai/programs/developer-program",
          description: "Earn rewards building FHEVM solutions"
        }
      ]
    }
  }
};

interface TutorialSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialSidebar: React.FC<TutorialSidebarProps> = ({
  isOpen,
  onClose
}) => {
  const { currentStep, activeTab, setActiveTab } = useTutorialStore();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const content = tutorialContent[currentStep];

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => copyToClipboard(text, id)}
      className="h-8 w-8 p-0 hover:bg-muted"
    >
      {copiedText === id ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  const CodeBlock = ({ code, index }: { 
    code: { language: string; snippet: string; description: string }; 
    index: number;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">
          {code.language}
        </Badge>
        <CopyButton text={code.snippet} id={`code-${index}`} />
      </div>
      <div className="code-block">
        <pre className="text-xs leading-snug whitespace-pre-wrap break-words overflow-x-auto">
          <code>{code.snippet}</code>
        </pre>
      </div>
      <p className="text-sm text-muted-foreground">{code.description}</p>
    </div>
  );

  const CommandBlock = ({ command, index }: {
    command: { description: string; command: string };
    index: number;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{command.description}</span>
        <CopyButton text={command.command} id={`cmd-${index}`} />
      </div>
      <div className="code-block">
        <code className="text-xs break-words whitespace-pre-wrap">{command.command}</code>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm xl:hidden"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-[28rem] md:w-[30rem] bg-card border-l shadow-lg xl:static xl:z-0 xl:shadow-none px-3 box-border"
          >
            <div className="flex h-full flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold">
                    Tutorial Guide
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <Tabs 
                  value={activeTab} 
                  onValueChange={(value) => setActiveTab(value as 'layman' | 'technical')}
                  className="h-full flex flex-col"
                >
                  <TabsList className="grid w-full grid-cols-2 m-2 mb-0">
                    <TabsTrigger value="layman" className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Beginner
                    </TabsTrigger>
                    <TabsTrigger value="technical" className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Technical
                    </TabsTrigger>
                  </TabsList>

                  <ScrollArea className="flex-1 px-4 pb-4 pr-6">
                    <TabsContent value="layman" className="mt-2 space-y-3">
                      <div>
                        <h3 className="font-display text-base font-semibold mb-2">
                          {content.layman.title}
                        </h3>
                        <div className="space-y-3">
                          {content.layman.content.map((paragraph, index) => (
                            <p key={index} className="text-xs leading-snug">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>

                      {content.layman.keyPoints && (
                        <div className="highlight-box">
                          <h4 className="font-semibold text-xs mb-1">Key Points:</h4>
                          <ul className="space-y-1">
                            {content.layman.keyPoints.map((point, index) => (
                              <li key={index} className="text-xs flex items-start gap-2">
                                <ChevronRight className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {content.layman.tips && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs">💡 Tips:</h4>
                          {content.layman.tips.map((tip, index) => (
                            <p key={index} className="text-xs bg-muted/50 p-2 rounded">
                              {tip}
                            </p>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="technical" className="mt-2 space-y-3">
                      <div>
                        <h3 className="font-display text-base font-semibold mb-2">
                          {content.technical.title}
                        </h3>
                        <div className="space-y-3">
                          {content.technical.content.map((paragraph, index) => (
                            <p key={index} className="text-xs leading-snug">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>

                      {content.technical.code && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs">Code Examples:</h4>
                          {content.technical.code.map((code, index) => (
                            <CodeBlock key={index} code={code} index={index} />
                          ))}
                        </div>
                      )}

                      {content.technical.commands && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs">Commands:</h4>
                          {content.technical.commands.map((command, index) => (
                            <CommandBlock key={index} command={command} index={index} />
                          ))}
                        </div>
                      )}

                      {content.technical.links && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-xs">Further Reading:</h4>
                          {content.technical.links.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h5 className="font-medium text-xs group-hover:text-primary">
                                    {link.title}
                                  </h5>
                                  <p className="text-[11px] text-muted-foreground">
                                    {link.description}
                                  </p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Updated in real-time as you progress</span>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};