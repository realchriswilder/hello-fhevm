import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Code, 
  FileText, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Lightbulb,
  Eye,
  EyeOff,
  Globe,
  Info
} from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';
import { WriteContractQuiz } from '@/components/quiz/WriteContractQuiz';
import { cn } from '@/lib/utils';

const FHECounterContract = `// SPDX-License-Identifier: MIT
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
}`;

const RegularCounterContract = `// Regular Solidity Counter (for comparison)
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
}`;

const FHEAdditionContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHEAdd is SepoliaConfig {
    euint8 private _a;
    euint8 private _b;
    euint8 private _result;

    bool private _hasA;
    bool private _hasB;

    event InputsSet(address indexed setter, bool hasA, bool hasB);
    event SumComputed(address indexed caller);

    function setA(externalEuint8 inputA, bytes calldata inputProof) external {
        _a = FHE.fromExternal(inputA, inputProof);
        FHE.allowThis(_a);
        _hasA = true;
        emit InputsSet(msg.sender, _hasA, _hasB);
    }

    function setB(externalEuint8 inputB, bytes calldata inputProof) external {
        _b = FHE.fromExternal(inputB, inputProof);
        FHE.allowThis(_b);
        _hasB = true;
        emit InputsSet(msg.sender, _hasA, _hasB);
    }

    function computeSum() external {
        require(_hasA && _hasB, "Inputs not set");
        _result = FHE.add(_a, _b);
        FHE.allowThis(_result);
        FHE.allow(_result, msg.sender);
        emit SumComputed(msg.sender);
    }

    function grantAccess(address user) external {
        require(user != address(0), "bad addr");
        FHE.allow(_result, user);
    }

    function getResult() external view returns (euint8) {
        return _result;
    }
}`;

const SecretNumberGameContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SecretNumberGame is SepoliaConfig {
    euint32 private secretNumber;
    mapping(address => euint32) public attempts;
    mapping(address => euint32) public lastHint;
    mapping(address => bool) private _attemptInit;
    
    constructor() {}

    function setSecret(
        externalEuint32 encSecret,
        bytes calldata proof
    ) external {
        secretNumber = FHE.fromExternal(encSecret, proof);
        FHE.allowThis(secretNumber);
    }

    function makeGuess(
        externalEuint32 encryptedGuess,
        bytes calldata inputProof
    ) external {
        euint32 guess = FHE.fromExternal(encryptedGuess, inputProof);
        
        if (!_attemptInit[msg.sender]) {
            attempts[msg.sender] = FHE.asEuint32(0);
            _attemptInit[msg.sender] = true;
            FHE.allowThis(attempts[msg.sender]);
        }
        attempts[msg.sender] = FHE.add(attempts[msg.sender], FHE.asEuint32(1));
        FHE.allowThis(attempts[msg.sender]);
        
        ebool isEqual = FHE.eq(guess, secretNumber);
        ebool isLower = FHE.lt(guess, secretNumber);
        
        euint32 zero = FHE.asEuint32(0);
        euint32 one  = FHE.asEuint32(1);
        euint32 two  = FHE.asEuint32(2);
        euint32 lowOrHigh = FHE.select(isLower, zero, one);
        euint32 hint = FHE.select(isEqual, two, lowOrHigh);
        
        lastHint[msg.sender] = hint;
        FHE.allowThis(lastHint[msg.sender]);
    }

    function getAttempts(address player) external view returns (euint32) {
        return attempts[player];
    }
    
    function allowAttempts(address user) external {
        require(msg.sender == user, "Can only allow own attempts");
        FHE.allow(attempts[user], user);
    }
    
    function allowMyHint() external {
        FHE.allow(lastHint[msg.sender], msg.sender);
    }
}`;

const ConfidentialTransferContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, ebool, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialERC20 is SepoliaConfig {
    mapping(address => euint64) private balances;
    mapping(address => bool) private _balanceInit;
    mapping(address => ebool) private _transferSuccess;
    euint64 private totalSupply;
    bool private _supplyInitialized;
    
    string public name = "Confidential Token";
    string public symbol = "CTKN";
    uint8 public decimals = 18;
    
    event Transfer(address indexed from, address indexed to);
    event Mint(address indexed to);

    constructor() {
        totalSupply = FHE.asEuint64(0);
        FHE.allowThis(totalSupply);
    }
    
    function initializeSupply(
        externalEuint64 encryptedSupply,
        bytes calldata inputProof
    ) external {
        require(!_supplyInitialized, "Supply already initialized");
        euint64 supply = FHE.fromExternal(encryptedSupply, inputProof);
        totalSupply = supply;
        balances[msg.sender] = supply;
        _balanceInit[msg.sender] = true;
        _supplyInitialized = true;
        FHE.allowThis(totalSupply);
        FHE.allowThis(balances[msg.sender]);
        emit Mint(msg.sender);
    }

    function transfer(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool) {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        
        if (!_balanceInit[to]) {
            balances[to] = FHE.asEuint64(0);
            _balanceInit[to] = true;
        }
        
        ebool canPay = FHE.le(amount, balances[msg.sender]);
        euint64 senderMinus = FHE.sub(balances[msg.sender], amount);
        euint64 toPlus = FHE.add(balances[to], amount);
        
        balances[msg.sender] = FHE.select(canPay, senderMinus, balances[msg.sender]);
        balances[to] = FHE.select(canPay, toPlus, balances[to]);
        
        _transferSuccess[msg.sender] = canPay;
        
        FHE.allowThis(balances[msg.sender]);
        FHE.allowThis(balances[to]);
        FHE.allowThis(_transferSuccess[msg.sender]);
        
        emit Transfer(msg.sender, to);
        return true;
    }

    function balanceOf(address account) external view returns (euint64) {
        return balances[account];
    }
    
    function allowMyBalance() external {
        FHE.allow(balances[msg.sender], msg.sender);
    }
    
    function allowMyTransferResult() external {
        FHE.allow(_transferSuccess[msg.sender], msg.sender);
    }
    
    function mint(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        
        if (!_balanceInit[to]) {
            balances[to] = FHE.asEuint64(0);
            _balanceInit[to] = true;
        }
        
        balances[to] = FHE.add(balances[to], amount);
        totalSupply = FHE.add(totalSupply, amount);
        
        FHE.allowThis(balances[to]);
        FHE.allowThis(totalSupply);
        
        emit Mint(to);
    }
    
    function getTotalSupply() external view returns (euint64) {
        return totalSupply;
    }
}`;

const contractExplanations = [
  {
    line: 1,
    text: "Standard Solidity license and version declaration",
    highlight: "bg-blue-100 dark:bg-blue-900/30"
  },
  {
    line: 3,
    text: "Import FHE types and operations from Zama's library",
    highlight: "bg-green-100 dark:bg-green-900/30"
  },
  {
    line: 4,
    text: "Import Sepolia network configuration for FHEVM",
    highlight: "bg-green-100 dark:bg-green-900/30"
  },
  {
    line: 10,
    text: "Contract inherits from SepoliaConfig (required for FHEVM)",
    highlight: "bg-yellow-100 dark:bg-yellow-900/30"
  },
  {
    line: 11,
    text: "Store encrypted counter value (euint32 = encrypted uint32)",
    highlight: "bg-red-100 dark:bg-red-900/30"
  },
  {
    line: 15,
    text: "Return encrypted value (can't decrypt without permission)",
    highlight: "bg-red-100 dark:bg-red-900/30"
  },
  {
    line: 22,
    text: "Function parameters: encrypted input + proof",
    highlight: "bg-orange-100 dark:bg-orange-900/30"
  },
  {
    line: 23,
    text: "Function takes encrypted input + proof (not plaintext!)",
    highlight: "bg-orange-100 dark:bg-orange-900/30"
  },
  {
    line: 25,
    text: "FHE.fromExternal() - converts external encrypted input to internal euint32",
    highlight: "bg-orange-100 dark:bg-orange-900/30"
  },
  {
    line: 27,
    text: "Homomorphic addition on encrypted values",
    highlight: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    line: 29,
    text: "FHE.allowThis() - grants the contract permission to decrypt the encrypted value stored in _count",
    highlight: "bg-pink-100 dark:bg-pink-900/30"
  },
  {
    line: 30,
    text: "FHE.allow() - grants the caller permission to decrypt the encrypted value stored in _count",
    highlight: "bg-pink-100 dark:bg-pink-900/30"
  },
  {
    line: 33,
    text: "Decrement function - similar to increment but uses FHE.sub",
    highlight: "bg-cyan-100 dark:bg-cyan-900/30"
  },
  {
    line: 34,
    text: "Same parameter pattern: encrypted input + proof",
    highlight: "bg-cyan-100 dark:bg-cyan-900/30"
  },
  {
    line: 35,
    text: "Convert external encrypted input to internal euint32",
    highlight: "bg-cyan-100 dark:bg-cyan-900/30"
  },
  {
    line: 37,
    text: "Homomorphic subtraction on encrypted values",
    highlight: "bg-indigo-100 dark:bg-indigo-900/30"
  },
  {
    line: 39,
    text: "Convert external encrypted input to internal euint32",
    highlight: "bg-cyan-100 dark:bg-cyan-900/30"
  },
  {
    line: 41,
    text: "Homomorphic subtraction on encrypted values",
    highlight: "bg-indigo-100 dark:bg-indigo-900/30"
  },
  {
    line: 43,
    text: "FHE.allowThis() - grants the contract permission to decrypt the encrypted value stored in _count",
    highlight: "bg-rose-100 dark:bg-rose-900/30"
  },
  {
    line: 44,
    text: "FHE.allow() - grants the caller permission to decrypt the encrypted value stored in _count",
    highlight: "bg-rose-100 dark:bg-rose-900/30"
  }
];

const fheAdditionExplanations = [
  {
    line: 1,
    text: "Standard Solidity license and version declaration",
    highlight: "bg-blue-100 dark:bg-blue-900/30"
  },
  {
    line: 3,
    text: "Import FHE types for 8-bit encrypted integers",
    highlight: "bg-green-100 dark:bg-green-900/30"
  },
  {
    line: 4,
    text: "Import Sepolia configuration for FHEVM deployment",
    highlight: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    line: 6,
    text: "Contract for encrypted addition operations",
    highlight: "bg-yellow-100 dark:bg-yellow-900/30"
  },
  {
    line: 7,
    text: "Encrypted input values for addition",
    highlight: "bg-red-100 dark:bg-red-900/30"
  },
  {
    line: 8,
    text: "Encrypted result of the addition operation",
    highlight: "bg-orange-100 dark:bg-orange-900/30"
  },
  {
    line: 10,
    text: "Track which inputs have been set",
    highlight: "bg-cyan-100 dark:bg-cyan-900/30"
  },
  {
    line: 12,
    text: "Event emitted when inputs are set",
    highlight: "bg-pink-100 dark:bg-pink-900/30"
  },
  {
    line: 13,
    text: "Event emitted when sum is computed",
    highlight: "bg-indigo-100 dark:bg-indigo-900/30"
  },
  {
    line: 15,
    text: "Set first encrypted input with proof validation",
    highlight: "bg-teal-100 dark:bg-teal-900/30"
  },
  {
    line: 16,
    text: "Convert external encrypted input to internal FHE type",
    highlight: "bg-amber-100 dark:bg-amber-900/30"
  },
  {
    line: 17,
    text: "Allow contract to manage this encrypted value",
    highlight: "bg-lime-100 dark:bg-lime-900/30"
  },
  {
    line: 23,
    text: "Set second encrypted input with proof validation",
    highlight: "bg-emerald-100 dark:bg-emerald-900/30"
  },
  {
    line: 28,
    text: "Compute homomorphic addition on encrypted inputs",
    highlight: "bg-rose-100 dark:bg-rose-900/30"
  },
  {
    line: 29,
    text: "Ensure both inputs are set before computation",
    highlight: "bg-sky-100 dark:bg-sky-900/30"
  },
  {
    line: 30,
    text: "Perform encrypted addition without decryption",
    highlight: "bg-violet-100 dark:bg-violet-900/30"
  }
];

const secretGameExplanations = [
  {
    line: 1,
    text: "Standard Solidity license and version declaration",
    highlight: "bg-blue-100 dark:bg-blue-900/30"
  },
  {
    line: 3,
    text: "Import FHE types for encrypted numbers and booleans",
    highlight: "bg-green-100 dark:bg-green-900/30"
  },
  {
    line: 4,
    text: "Import Sepolia configuration for FHEVM deployment",
    highlight: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    line: 6,
    text: "Contract for encrypted number guessing game",
    highlight: "bg-yellow-100 dark:bg-yellow-900/30"
  },
  {
    line: 7,
    text: "Encrypted secret number to be guessed",
    highlight: "bg-red-100 dark:bg-red-900/30"
  },
  {
    line: 8,
    text: "Track encrypted attempt count per player",
    highlight: "bg-orange-100 dark:bg-orange-900/30"
  },
  {
    line: 9,
    text: "Store encrypted hints (0=too low, 1=too high, 2=correct)",
    highlight: "bg-cyan-100 dark:bg-cyan-900/30"
  },
  {
    line: 10,
    text: "Track if player's attempt count is initialized",
    highlight: "bg-pink-100 dark:bg-pink-900/30"
  },
  {
    line: 14,
    text: "Set the encrypted secret number with proof",
    highlight: "bg-indigo-100 dark:bg-indigo-900/30"
  },
  {
    line: 15,
    text: "Convert external encrypted input to internal FHE type",
    highlight: "bg-teal-100 dark:bg-teal-900/30"
  },
  {
    line: 16,
    text: "Allow contract to manage the secret number",
    highlight: "bg-amber-100 dark:bg-amber-900/30"
  },
  {
    line: 20,
    text: "Make an encrypted guess with proof validation",
    highlight: "bg-lime-100 dark:bg-lime-900/30"
  },
  {
    line: 21,
    text: "Convert encrypted guess to internal FHE type",
    highlight: "bg-emerald-100 dark:bg-emerald-900/30"
  },
  {
    line: 24,
    text: "Initialize attempt count if first guess",
    highlight: "bg-rose-100 dark:bg-rose-900/30"
  },
  {
    line: 25,
    text: "Create encrypted zero for initialization",
    highlight: "bg-sky-100 dark:bg-sky-900/30"
  },
  {
    line: 30,
    text: "Increment encrypted attempt count",
    highlight: "bg-violet-100 dark:bg-violet-900/30"
  },
  {
    line: 33,
    text: "Compare guess with secret using encrypted equality",
    highlight: "bg-fuchsia-100 dark:bg-fuchsia-900/30"
  },
  {
    line: 34,
    text: "Check if guess is lower than secret",
    highlight: "bg-slate-100 dark:bg-slate-900/30"
  },
  {
    line: 37,
    text: "Create encrypted constants for hint logic",
    highlight: "bg-stone-100 dark:bg-stone-900/30"
  },
  {
    line: 40,
    text: "Select hint based on comparison results",
    highlight: "bg-zinc-100 dark:bg-zinc-900/30"
  },
  {
    line: 41,
    text: "Final hint: 0=too low, 1=too high, 2=correct",
    highlight: "bg-neutral-100 dark:bg-neutral-900/30"
  }
];

const confidentialTransferExplanations = [
  {
    line: 1,
    text: "Standard Solidity license and version declaration",
    highlight: "bg-blue-100 dark:bg-blue-900/30"
  },
  {
    line: 3,
    text: "Import FHE types for encrypted 64-bit integers and booleans",
    highlight: "bg-green-100 dark:bg-green-900/30"
  },
  {
    line: 4,
    text: "Import Sepolia configuration for FHEVM deployment",
    highlight: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    line: 6,
    text: "Contract for confidential token transfers",
    highlight: "bg-yellow-100 dark:bg-yellow-900/30"
  },
  {
    line: 8,
    text: "Encrypted token balances per address",
    highlight: "bg-red-100 dark:bg-red-900/30"
  },
  {
    line: 9,
    text: "Track if address balance is initialized",
    highlight: "bg-orange-100 dark:bg-orange-900/30"
  },
  {
    line: 10,
    text: "Store encrypted transfer success status for each address",
    highlight: "bg-cyan-100 dark:bg-cyan-900/30"
  },
  {
    line: 11,
    text: "Encrypted total token supply",
    highlight: "bg-pink-100 dark:bg-pink-900/30"
  },
  {
    line: 12,
    text: "Track if supply has been initialized",
    highlight: "bg-indigo-100 dark:bg-indigo-900/30"
  },
  {
    line: 14,
    text: "Token metadata (name, symbol, decimals)",
    highlight: "bg-teal-100 dark:bg-teal-900/30"
  },
  {
    line: 18,
    text: "Events for transfer and mint operations",
    highlight: "bg-amber-100 dark:bg-amber-900/30"
  },
  {
    line: 21,
    text: "Initialize with zero encrypted supply",
    highlight: "bg-lime-100 dark:bg-lime-900/30"
  },
  {
    line: 22,
    text: "Create encrypted zero for initialization",
    highlight: "bg-emerald-100 dark:bg-emerald-900/30"
  },
  {
    line: 23,
    text: "Allow contract to manage total supply",
    highlight: "bg-rose-100 dark:bg-rose-900/30"
  },
  {
    line: 26,
    text: "Initialize encrypted token supply",
    highlight: "bg-sky-100 dark:bg-sky-900/30"
  },
  {
    line: 27,
    text: "Prevent multiple supply initializations",
    highlight: "bg-violet-100 dark:bg-violet-900/30"
  },
  {
    line: 28,
    text: "Convert external encrypted input to internal FHE type",
    highlight: "bg-fuchsia-100 dark:bg-fuchsia-900/30"
  },
  {
    line: 29,
    text: "Set total supply and initial balance",
    highlight: "bg-slate-100 dark:bg-slate-900/30"
  },
  {
    line: 30,
    text: "Mark sender as having initialized balance",
    highlight: "bg-stone-100 dark:bg-stone-900/30"
  },
  {
    line: 31,
    text: "Prevent further supply initialization",
    highlight: "bg-zinc-100 dark:bg-zinc-900/30"
  },
  {
    line: 32,
    text: "Allow contract to manage supply and balance",
    highlight: "bg-neutral-100 dark:bg-neutral-900/30"
  },
  {
    line: 33,
    text: "Emit mint event for initial supply",
    highlight: "bg-red-100 dark:bg-red-900/30"
  },
  {
    line: 37,
    text: "Transfer encrypted tokens between addresses",
    highlight: "bg-orange-100 dark:bg-orange-900/30"
  },
  {
    line: 38,
    text: "Convert encrypted amount to internal FHE type",
    highlight: "bg-yellow-100 dark:bg-yellow-900/30"
  },
  {
    line: 41,
    text: "Initialize recipient balance if needed",
    highlight: "bg-green-100 dark:bg-green-900/30"
  },
  {
    line: 42,
    text: "Create encrypted zero for new balances",
    highlight: "bg-blue-100 dark:bg-blue-900/30"
  },
  {
    line: 46,
    text: "Check if sender has sufficient balance",
    highlight: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    line: 47,
    text: "Calculate new sender balance after transfer",
    highlight: "bg-pink-100 dark:bg-pink-900/30"
  },
  {
    line: 48,
    text: "Calculate new recipient balance after transfer",
    highlight: "bg-indigo-100 dark:bg-indigo-900/30"
  },
  {
    line: 51,
    text: "Conditionally update balances based on sufficiency",
    highlight: "bg-teal-100 dark:bg-teal-900/30"
  },
  {
    line: 52,
    text: "Use select to prevent underflow on insufficient balance",
    highlight: "bg-amber-100 dark:bg-amber-900/30"
  },
  {
    line: 55,
    text: "Store encrypted transfer success status for sender",
    highlight: "bg-lime-100 dark:bg-lime-900/30"
  },
  {
    line: 58,
    text: "Allow contract to manage updated balances",
    highlight: "bg-emerald-100 dark:bg-emerald-900/30"
  },
  {
    line: 59,
    text: "Allow contract to manage transfer success status",
    highlight: "bg-rose-100 dark:bg-rose-900/30"
  },
  {
    line: 61,
    text: "Emit transfer event (amount not revealed)",
    highlight: "bg-sky-100 dark:bg-sky-900/30"
  }
];

export const WriteContractStep: React.FC = () => {
  const { completeStep, setCurrentStep } = useTutorialStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'fhe' | 'regular' | 'addition' | 'secret' | 'transfer'>('fhe');
  const [showExplanations, setShowExplanations] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

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
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  const markStepComplete = (stepNumber: number) => {
    setCompletedSteps(prev => new Set([...prev, stepNumber]));
  };

  const isStepComplete = (stepNumber: number) => completedSteps.has(stepNumber);

  const handleContinue = () => {
    completeStep('write-contract');
    setCurrentStep('contract-overview');
    navigate('/step/contract-overview');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Code className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Writing Your First FHEVM Contract</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Let's build a simple counter that works with encrypted numbers. We'll compare it to regular Solidity so you can see the magic of FHEVM!
        </p>
      </motion.div>

      {/* Key Differences Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Key Differences: FHEVM vs Regular Solidity
            </CardTitle>
            <CardDescription>
              Understanding what makes FHEVM special
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  FHEVM (Confidential)
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Data is encrypted (euint32, ebool)</li>
                  <li>• Operations work on encrypted data</li>
                  <li>• Requires proofs for input validation</li>
                  <li>• Explicit permission management</li>
                  <li>• Values stay private until decrypted</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Regular Solidity (Transparent)
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Data is plaintext (uint32, bool)</li>
                  <li>• Direct arithmetic operations</li>
                  <li>• No proof requirements</li>
                  <li>• Automatic state management</li>
                  <li>• All values are publicly visible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contract Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Contract Comparison</CardTitle>
            <CardDescription>
              Side-by-side comparison of FHEVM vs Regular Solidity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'fhe' | 'regular' | 'addition' | 'secret' | 'transfer')}>
              <div className="overflow-x-auto">
                <TabsList className="inline-flex w-max min-w-full sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-1 p-1">
                  <TabsTrigger value="fhe" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-2 whitespace-nowrap min-w-fit">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">FHE Counter</span>
                    <span className="sm:hidden">Counter</span>
                  </TabsTrigger>
                  <TabsTrigger value="regular" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-2 whitespace-nowrap min-w-fit">
                    <Code className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Regular Solidity</span>
                    <span className="sm:hidden">Regular</span>
                  </TabsTrigger>
                  <TabsTrigger value="addition" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-2 whitespace-nowrap min-w-fit">
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">FHE Addition</span>
                    <span className="sm:hidden">Addition</span>
                  </TabsTrigger>
                  <TabsTrigger value="secret" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-2 whitespace-nowrap min-w-fit">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Secret Game</span>
                    <span className="sm:hidden">Game</span>
                  </TabsTrigger>
                  <TabsTrigger value="transfer" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 py-2 whitespace-nowrap min-w-fit">
                    <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Confidential Transfer</span>
                    <span className="sm:hidden">Transfer</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="fhe" className="mt-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Badge variant="secondary">FHEVM</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowExplanations(!showExplanations)}
                        className="w-full sm:w-auto"
                      >
                        {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="ml-2">{showExplanations ? 'Hide' : 'Show'} Explanations</span>
                      </Button>
                    </div>
                    <CopyButton text={FHECounterContract} id="fhe-contract" />
                  </div>
                  
                  <ScrollArea className="h-96 border rounded-lg overflow-x-auto">
                    <div className="p-2 sm:p-4 font-mono text-xs sm:text-sm min-w-[320px] sm:min-w-[920px]">
                      {FHECounterContract.split('\n').map((line, index) => {
                        const explanation = contractExplanations.find(exp => exp.line === index + 1);
                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex flex-col lg:flex-row items-start gap-2 lg:gap-4 py-1",
                              explanation && showExplanations ? explanation.highlight : ""
                            )}
                          >
                            <div className="flex items-start gap-2 lg:gap-4 w-full lg:w-auto">
                              <span className="text-muted-foreground w-8 text-right select-none flex-shrink-0">
                                {index + 1}
                              </span>
                              <code className="flex-1 whitespace-pre">{line}</code>
                            </div>
                            {explanation && showExplanations && (
                              <div className="ml-6 lg:ml-4 p-2 bg-muted dark:bg-muted/50 rounded text-xs max-w-full lg:max-w-xs">
                                {explanation.text}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
              
              <TabsContent value="regular" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Regular Solidity</Badge>
                    <CopyButton text={RegularCounterContract} id="regular-contract" />
                  </div>
                  
                  <ScrollArea className="h-96 border rounded-lg overflow-x-auto">
                    <div className="p-2 sm:p-4 font-mono text-xs sm:text-sm min-w-[320px] sm:min-w-[920px]">
                      {RegularCounterContract.split('\n').map((line, index) => (
                        <div key={index} className="flex items-start gap-2 lg:gap-4 py-1">
                          <span className="text-muted-foreground w-8 text-right select-none flex-shrink-0">
                            {index + 1}
                          </span>
                          <code className="flex-1 whitespace-pre">{line}</code>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="addition" className="mt-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Badge variant="outline">FHE Addition Contract</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowExplanations(!showExplanations)}
                        className="flex items-center gap-2"
                      >
                        {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showExplanations ? 'Hide' : 'Show'} Explanations
                      </Button>
                    </div>
                    <CopyButton text={FHEAdditionContract} id="addition-contract" />
                  </div>
                  
                  <ScrollArea className="h-96 border rounded-lg overflow-x-auto">
                    <div className="p-2 sm:p-4 font-mono text-xs sm:text-sm min-w-[320px] sm:min-w-[920px]">
                      {FHEAdditionContract.split('\n').map((line, index) => {
                        const explanation = fheAdditionExplanations.find(exp => exp.line === index + 1);
                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex flex-col lg:flex-row items-start gap-2 lg:gap-4 py-1",
                              explanation && showExplanations ? explanation.highlight : ""
                            )}
                          >
                            <div className="flex items-start gap-2 lg:gap-4 w-full lg:w-auto">
                              <span className="text-muted-foreground w-8 text-right select-none flex-shrink-0">
                                {index + 1}
                              </span>
                              <code className="flex-1 whitespace-pre">{line}</code>
                            </div>
                            {explanation && showExplanations && (
                              <div className="ml-6 lg:ml-4 p-2 bg-muted dark:bg-muted/50 rounded text-xs max-w-full lg:max-w-xs">
                                {explanation.text}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="secret" className="mt-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Badge variant="outline">Secret Number Game</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowExplanations(!showExplanations)}
                        className="flex items-center gap-2"
                      >
                        {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showExplanations ? 'Hide' : 'Show'} Explanations
                      </Button>
                    </div>
                    <CopyButton text={SecretNumberGameContract} id="secret-contract" />
                  </div>
                  
                  <ScrollArea className="h-96 border rounded-lg overflow-x-auto">
                    <div className="p-2 sm:p-4 font-mono text-xs sm:text-sm min-w-[320px] sm:min-w-[920px]">
                      {SecretNumberGameContract.split('\n').map((line, index) => {
                        const explanation = secretGameExplanations.find(exp => exp.line === index + 1);
                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex flex-col lg:flex-row items-start gap-2 lg:gap-4 py-1",
                              explanation && showExplanations ? explanation.highlight : ""
                            )}
                          >
                            <div className="flex items-start gap-2 lg:gap-4 w-full lg:w-auto">
                              <span className="text-muted-foreground w-8 text-right select-none flex-shrink-0">
                                {index + 1}
                              </span>
                              <code className="flex-1 whitespace-pre">{line}</code>
                            </div>
                            {explanation && showExplanations && (
                              <div className="ml-6 lg:ml-4 p-2 bg-muted dark:bg-muted/50 rounded text-xs max-w-full lg:max-w-xs">
                                {explanation.text}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="transfer" className="mt-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Badge variant="outline">Confidential Transfer</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowExplanations(!showExplanations)}
                        className="flex items-center gap-2"
                      >
                        {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showExplanations ? 'Hide' : 'Show'} Explanations
                      </Button>
                    </div>
                    <CopyButton text={ConfidentialTransferContract} id="transfer-contract" />
                  </div>
                  
                  <ScrollArea className="h-96 border rounded-lg overflow-x-auto">
                    <div className="p-2 sm:p-4 font-mono text-xs sm:text-sm min-w-[320px] sm:min-w-[920px]">
                      {ConfidentialTransferContract.split('\n').map((line, index) => {
                        const explanation = confidentialTransferExplanations.find(exp => exp.line === index + 1);
                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex flex-col lg:flex-row items-start gap-2 lg:gap-4 py-1",
                              explanation && showExplanations ? explanation.highlight : ""
                            )}
                          >
                            <div className="flex items-start gap-2 lg:gap-4 w-full lg:w-auto">
                              <span className="text-muted-foreground w-8 text-right select-none flex-shrink-0">
                                {index + 1}
                              </span>
                              <code className="flex-1 whitespace-pre">{line}</code>
                            </div>
                            {explanation && showExplanations && (
                              <div className="ml-6 lg:ml-4 p-2 bg-muted dark:bg-muted/50 rounded text-xs max-w-full lg:max-w-xs">
                                {explanation.text}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Learning Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Step-by-Step Learning</CardTitle>
            <CardDescription>
              Follow these steps to understand each part of the FHEVM contract
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  step: 1,
                  title: "Imports and Configuration",
                  description: "Learn about FHE imports and SepoliaConfig inheritance",
                  action: "Switch to FHEVM tab and examine lines 1-4"
                },
                {
                  step: 2,
                  title: "Encrypted Data Types",
                  description: "Understand euint32 vs uint32 and why encryption matters",
                  action: "Look at line 11 and compare with regular Solidity"
                },
                {
                  step: 3,
                  title: "Function Parameters",
                  description: "See how FHEVM functions take encrypted inputs + proofs",
                  action: "Compare increment function signatures (lines 22 vs regular)"
                },
                {
                  step: 4,
                  title: "Homomorphic Operations",
                  description: "Learn how FHE.add works on encrypted data",
                  action: "Examine line 25 and understand encrypted arithmetic"
                },
                {
                  step: 5,
                  title: "Permission Management",
                  description: "Understand allowThis() and allow() for decryption control",
                  action: "Study lines 27-28 and their security implications"
                }
              ].map((item) => (
                <div
                  key={item.step}
                  className={cn(
                    "flex flex-col gap-4 p-4 rounded-lg border transition-all h-full",
                    isStepComplete(item.step) 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                      : "bg-muted/50 dark:bg-muted/30 hover:bg-muted dark:hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold flex-shrink-0",
                      isStepComplete(item.step)
                        ? "bg-green-500 text-white"
                        : "bg-primary text-primary-foreground"
                    )}>
                      {isStepComplete(item.step) ? <CheckCircle className="h-4 w-4" /> : item.step}
                    </div>
                    <h4 className="font-semibold text-lg">{item.title}</h4>
                  </div>
                  <div className="space-y-3 flex-1">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="text-xs bg-muted dark:bg-muted/50 p-2 rounded font-mono break-words">{item.action}</p>
                    {!isStepComplete(item.step) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markStepComplete(item.step)}
                        className="w-full"
                      >
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Learning Guide - 2x2 Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Step 1: Contract Writing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Step 1: Write Contract
            </CardTitle>
            <CardDescription>
              Use the SimpleVoting contract from the repo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The <code>vote-app/contracts/SimpleVoting.sol</code> contract is already in this repo with all the FHE voting logic you need.
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <div className="font-mono text-xs">
                  <div>📄 vote-app/contracts/SimpleVoting.sol</div>
                  <div className="text-muted-foreground">• FHE voting operations</div>
                  <div className="text-muted-foreground">• Session management</div>
                  <div className="text-muted-foreground">• Encrypted vote storage</div>
                  <div className="text-muted-foreground">• Tally decryption</div>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded p-2">
                <p className="text-xs text-green-700 dark:text-green-300">
                  ✅ <strong>Ready to use!</strong> This contract is already deployed and working in the tutorial.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Frontend Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              Step 2: Build Frontend
            </CardTitle>
            <CardDescription>
              Create the user interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Build a React frontend that can encrypt user input and interact with your contract.
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <div className="font-mono text-xs">
                  <div>🌐 src/ui/App.tsx</div>
                  <div className="text-muted-foreground">• User interface</div>
                  <div className="text-muted-foreground">• Vote buttons</div>
                  <div className="text-muted-foreground">• Wallet connection</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: FHE Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Code className="h-5 w-5 text-purple-500" />
              Step 3: FHE Setup
            </CardTitle>
            <CardDescription>
              Initialize FHEVM and encryption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set up the FHEVM Relayer SDK to handle encryption and WASM loading.
              </p>
              <div className="bg-muted dark:bg-muted/50 p-3 rounded-lg border border-border">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <div className="font-mono text-xs text-foreground">
                    <div>🔐 src/fhe.ts - Encrypt user votes</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExplanations(!showExplanations)}
                    className="h-6 px-2 text-xs hover:bg-muted-foreground/10 dark:hover:bg-muted-foreground/20 w-full sm:w-auto"
                  >
                    {showExplanations ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span className="ml-1">{showExplanations ? 'Hide' : 'Show'} Code</span>
                  </Button>
                </div>
                {showExplanations && (
                  <pre className="text-[11px] sm:text-xs font-mono leading-relaxed whitespace-pre-wrap break-words overflow-x-auto -mx-1 sm:mx-0 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded border border-gray-300 dark:border-gray-600">
{`export async function encryptYesNo(choice: 'yes' | 'no', contractAddress: string, userAddress: string): Promise<string> {
  const fhe = await initializeFheInstance();
  // encode Yes as 1 and No as 0 (euint64)
  const value = choice === 'yes' ? 1 : 0;
  const encryptedInput = fhe.createEncryptedInput(contractAddress, userAddress);
  const result = await encryptedInput.add64(value).encrypt();
  const bytes = result.handles[0] as Uint8Array;
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  const handle = \`0x\${hex}\`;
  return handle; // externalEuint64-compatible handle (0x...)
}`}
                  </pre>
                )}
                <div className="text-muted-foreground dark:text-muted-foreground/80 text-xs mt-2">
                  • SDK initialization • Encrypt user input • Generate proofs
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Contract Interaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-orange-500" />
              Step 4: Connect & Deploy
            </CardTitle>
            <CardDescription>
              Deploy and test your contract
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Deploy your contract to Sepolia and test the complete voting flow.
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <div className="font-mono text-xs">
                  <div>🚀 Deploy & Test</div>
                  <div className="text-muted-foreground">• Contract deployment</div>
                  <div className="text-muted-foreground">• Live testing</div>
                  <div className="text-muted-foreground">• Real transactions</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Frontend Codebase Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Frontend Codebase Structure
            </CardTitle>
            <CardDescription>
              This tutorial includes a complete frontend in the <code>vote-app/</code> directory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Structure */}
            <div>
              <h4 className="font-semibold mb-3">📁 Complete Frontend Structure</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <div className="text-green-600 dark:text-green-400">vote-app/</div>
                <div className="ml-4">├── src/</div>
                <div className="ml-8">├── fhe.ts          <span className="text-muted-foreground">// Fhevmjs/relayer-sdk setup & encryption</span></div>
                <div className="ml-8">├── service.ts       <span className="text-muted-foreground">// Contract interaction</span></div>
                <div className="ml-8">├── contracts.ts     <span className="text-muted-foreground">// Contract ABI & address</span></div>
                <div className="ml-8">├── main.tsx         <span className="text-muted-foreground">// App entry point</span></div>
                <div className="ml-8">└── ui/</div>
                <div className="ml-12">    └── App.tsx      <span className="text-muted-foreground">// Main UI component</span></div>
                <div className="ml-4">├── contracts/</div>
                <div className="ml-8">    └── SimpleVoting.sol <span className="text-muted-foreground">// Voting contract</span></div>
                <div className="ml-4">└── package.json</div>
              </div>
            </div>

            {/* Key Files Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">🔐 fhe.ts - FHEVM Integration</h4>
                <div className="bg-muted p-3 rounded-lg text-xs">
                  <div className="font-mono mb-2">// Loads @zama-fhe/relayer-sdk</div>
                  <div className="text-muted-foreground">• Uses official Zama NPM package</div>
                  <div className="text-muted-foreground">• ESM format with initSDK()</div>
                  <div className="text-muted-foreground">• Handles WASM loading</div>
                  <div className="text-muted-foreground">• Encrypts user votes</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">🌐 App.tsx - User Interface</h4>
                <div className="bg-muted p-3 rounded-lg text-xs">
                  <div className="font-mono mb-2">// Main voting interface</div>
                  <div className="text-muted-foreground">• Yes/No vote buttons</div>
                  <div className="text-muted-foreground">• Wallet connection</div>
                  <div className="text-muted-foreground">• Session management</div>
                  <div className="text-muted-foreground">• Real-time vote counting</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">⚡ service.ts - Contract Calls</h4>
                <div className="bg-muted p-3 rounded-lg text-xs">
                  <div className="font-mono mb-2">// Blockchain interaction</div>
                  <div className="text-muted-foreground">• Viem wallet client</div>
                  <div className="text-muted-foreground">• Contract function calls</div>
                  <div className="text-muted-foreground">• Transaction handling</div>
                  <div className="text-muted-foreground">• Event parsing</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">📋 contracts.ts - ABI & Address</h4>
                <div className="bg-muted p-3 rounded-lg text-xs">
                  <div className="font-mono mb-2">// Contract configuration</div>
                  <div className="text-muted-foreground">• Contract ABI</div>
                  <div className="text-muted-foreground">• Contract address</div>
                  <div className="text-muted-foreground">• Type definitions</div>
                  <div className="text-muted-foreground">• Environment variables</div>
                </div>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🚀 How to Use This Frontend</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-3">
                <div>
                  <p><strong>Option 1 - NPM Package (Recommended):</strong></p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded font-mono text-xs space-y-1">
                    <div># Install the official Zama FHE Relayer SDK</div>
                    <div className="text-green-600">npm install @zama-fhe/relayer-sdk</div>
                    <div className="text-green-600">npm install viem @rainbow-me/rainbowkit</div>
                    <div className="mt-2 text-yellow-600"># Add to package.json:</div>
                    <div className="text-yellow-600">"type": "module"</div>
                  </div>
                </div>
                
                <div>
                  <p><strong>Option 2 - CDN (Alternative):</strong></p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded font-mono text-xs">
                    <div>&lt;script src="https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs"&gt;&lt;/script&gt;</div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded p-2">
                  <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-1">📝 Important Notes:</p>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• The SDK uses ESM format - set <code>"type": "module"</code> in package.json</li>
                    <li>• For CommonJS projects, use: <code>import from '@zama-fhe/relayer-sdk/bundle'</code></li>
                    <li>• Clone the repo and you'll have a working FHE voting app!</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Steps */}
      {/* Quiz Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="space-y-4"
      >
        <WriteContractQuiz />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-center space-y-4"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Ready to Deploy?</h3>
              <p className="text-muted-foreground">
                You've learned the basics of FHEVM contracts! Next, we'll explore a more complex voting contract.
              </p>
              <Button
                onClick={handleContinue}
                size="lg"
                className="gap-2 w-full sm:w-auto"
              >
                Continue to Contract Overview
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
