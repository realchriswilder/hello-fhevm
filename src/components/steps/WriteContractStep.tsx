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
  Globe,
  Info
} from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';
import { WriteContractQuiz } from '@/components/quiz/WriteContractQuiz';

const FHECounterContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

// FHECounter Example with Explanations
// This contract demonstrates a simple encrypted counter using Zama's FHEVM.
// Comments explain what each function does.

contract FHECounter is SepoliaConfig {
    // The encrypted counter value.
    euint32 private _count;

    // Get the current encrypted counter value.
    // Must be decrypted offchain by the user.
    function getCount() external view returns (euint32) {
        return _count;
    }

    // Increment the counter by an encrypted input value.
    // inputEuint32: encrypted increment amount.
    // inputProof: cryptographic proof from the SDK.
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        // Convert external encrypted input into internal encrypted value.
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        // Add encrypted value to the counter.
        _count = FHE.add(_count, encryptedEuint32);

        // Allow contract itself to keep using updated value.
        FHE.allowThis(_count);
        // Allow caller to decrypt the updated counter.
        FHE.allow(_count, msg.sender);
    }

    // Decrement the counter by an encrypted input value.
    // inputEuint32: encrypted decrement amount.
    // inputProof: cryptographic proof from the SDK.
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        // Convert external encrypted input into internal encrypted value.
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        // Subtract encrypted value from the counter.
        _count = FHE.sub(_count, encryptedEuint32);

        // Allow contract itself to keep using updated value.
        FHE.allowThis(_count);
        // Allow caller to decrypt the updated counter.
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

// FHEAdd Example with Explanations
// This contract demonstrates encrypted addition using Zama's FHEVM.
// Comments explain what each function does.

contract FHEAdd is SepoliaConfig {
    // Encrypted inputs A and B.
    euint8 private _a;
    euint8 private _b;
    // Encrypted result (A + B).
    euint8 private _result;

    // Flags to track whether A and B have been set.
    bool private _hasA;
    bool private _hasB;

    // Events for logging actions.
    event InputsSet(address indexed setter, bool hasA, bool hasB);
    event SumComputed(address indexed caller);

    // Set encrypted input A.
    function setA(externalEuint8 inputA, bytes calldata inputProof) external {
        // Convert external encrypted input into internal encrypted value.
        _a = FHE.fromExternal(inputA, inputProof);
        // Allow contract itself to use this encrypted value.
        FHE.allowThis(_a);
        _hasA = true;
        // Emit event showing current state of inputs.
        emit InputsSet(msg.sender, _hasA, _hasB);
    }

    // Set encrypted input B.
    function setB(externalEuint8 inputB, bytes calldata inputProof) external {
        _b = FHE.fromExternal(inputB, inputProof);
        FHE.allowThis(_b);
        _hasB = true;
        emit InputsSet(msg.sender, _hasA, _hasB);
    }

    // Compute the encrypted sum of A and B.
    function computeSum() external {
        // Ensure both inputs are provided.
        require(_hasA && _hasB, "Inputs not set");
        // Perform encrypted addition.
        _result = FHE.add(_a, _b);
        // Allow contract itself to access result.
        FHE.allowThis(_result);
        // Give the caller access to decrypt the result.
        FHE.allow(_result, msg.sender);
        // Emit event to signal computation done.
        emit SumComputed(msg.sender);
    }

    // Allow another user to access the encrypted result.
    function grantAccess(address user) external {
        require(user != address(0), "bad addr");
        FHE.allow(_result, user);
    }

    // Return the encrypted result (must be decrypted offchain).
    function getResult() external view returns (euint8) {
        return _result;
    }
}`;

const SecretNumberGameContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

// SecretNumberGame Example with Explanations
// This contract is a confidential number guessing game using FHEVM.
// Comments explain each function in detail.

contract SecretNumberGame is SepoliaConfig {
    // The secret number (encrypted).
    euint32 private secretNumber;
    // Tracks how many guesses each player has made (encrypted).
    mapping(address => euint32) public attempts;
    // Stores the last hint given to each player (encrypted).
    // Hint values: 0 = too low, 1 = too high, 2 = correct.
    mapping(address => euint32) public lastHint;
    // Tracks whether attempts for a user have been initialized.
    mapping(address => bool) private _attemptInit;

    constructor() {}

    // Set the secret number (only encrypted input accepted).
    function setSecret(
        externalEuint32 encSecret,
        bytes calldata proof
    ) external {
        // Convert external encrypted input + proof into internal encrypted value.
        secretNumber = FHE.fromExternal(encSecret, proof);
        // Allow the contract itself to access this encrypted value in computations.
        FHE.allowThis(secretNumber);
    }

    // Player makes a guess with an encrypted number.
    function makeGuess(
        externalEuint32 encryptedGuess,
        bytes calldata inputProof
    ) external {
        // Convert encrypted external input into usable encrypted guess.
        euint32 guess = FHE.fromExternal(encryptedGuess, inputProof);

        // Initialize attempts counter for the player if not already set.
        if (!_attemptInit[msg.sender]) {
            attempts[msg.sender] = FHE.asEuint32(0);
            _attemptInit[msg.sender] = true;
            FHE.allowThis(attempts[msg.sender]);
        }

        // Increment the player's attempts counter by 1.
        attempts[msg.sender] = FHE.add(attempts[msg.sender], FHE.asEuint32(1));
        FHE.allowThis(attempts[msg.sender]);

        // Compare the guess with the secret number (all in encrypted form).
        ebool isEqual = FHE.eq(guess, secretNumber);   // True if correct.
        ebool isLower = FHE.lt(guess, secretNumber);   // True if guess is lower.

        // Define hint values.
        euint32 zero = FHE.asEuint32(0); // 0 = too low
        euint32 one  = FHE.asEuint32(1); // 1 = too high
        euint32 two  = FHE.asEuint32(2); // 2 = correct

        // If guess < secret → 0, else → 1.
        euint32 lowOrHigh = FHE.select(isLower, zero, one);
        // If guess == secret → 2, else use lowOrHigh.
        euint32 hint = FHE.select(isEqual, two, lowOrHigh);

        // Save the encrypted hint for the player.
        lastHint[msg.sender] = hint;
        FHE.allowThis(lastHint[msg.sender]);
    }

    // Return encrypted attempts for a player.
    function getAttempts(address player) external view returns (euint32) {
        return attempts[player];
    }

    // Allow a user to decrypt their own attempts counter.
    function allowAttempts(address user) external {
        require(msg.sender == user, "Can only allow own attempts");
        FHE.allow(attempts[user], user);
    }

    // Allow a user to decrypt their last hint.
    function allowMyHint() external {
        FHE.allow(lastHint[msg.sender], msg.sender);
    }
}`;

const ConfidentialTransferContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, ebool, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

// ConfidentialERC20 Example with Line-by-Line Explanations
// This contract shows how to build a private ERC20-like token using Zama's FHEVM.
// Comments explain what each line does.

contract ConfidentialERC20 is SepoliaConfig {
    // Store encrypted balances for each user.
    mapping(address => euint64) private balances;
    // Track whether a balance for a user is initialized.
    mapping(address => bool) private _balanceInit;
    // Track encrypted transfer success/failure for users.
    mapping(address => ebool) private _transferSuccess;
    // Store the total supply in encrypted form.
    euint64 private totalSupply;
    // Flag to make sure supply is only initialized once.
    bool private _supplyInitialized;

    // Public metadata (not encrypted).
    string public name = "Confidential Token";
    string public symbol = "CTKN";
    uint8 public decimals = 18;

    // Events only log addresses (not amounts, since those are private).
    event Transfer(address indexed from, address indexed to);
    event Mint(address indexed to);

    // Constructor sets totalSupply = 0 (encrypted) and lets contract use it.
    constructor() {
        totalSupply = FHE.asEuint64(0);
        FHE.allowThis(totalSupply);
    }

    // Initialize total supply with an encrypted input.
    function initializeSupply(
        externalEuint64 encryptedSupply,
        bytes calldata inputProof
    ) external {
        // Can only initialize once.
        require(!_supplyInitialized, "Supply already initialized");
        // Convert encrypted external input into an internal encrypted value.
        euint64 supply = FHE.fromExternal(encryptedSupply, inputProof);
        // Assign supply to total and to sender's balance.
        totalSupply = supply;
        balances[msg.sender] = supply;
        _balanceInit[msg.sender] = true;
        _supplyInitialized = true;
        // Allow contract itself to keep using those encrypted values.
        FHE.allowThis(totalSupply);
        FHE.allowThis(balances[msg.sender]);
        // Emit Mint event (only logs address).
        emit Mint(msg.sender);
    }

    // Confidential transfer function.
    function transfer(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (bool) {
        // Convert encrypted external input into usable encrypted value.
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);

        // Initialize recipient's balance if not set.
        if (!_balanceInit[to]) {
            balances[to] = FHE.asEuint64(0);
            _balanceInit[to] = true;
        }

        // Check (privately) if sender has enough balance.
        ebool canPay = FHE.le(amount, balances[msg.sender]);

        // Compute what balances *would* be after transfer.
        euint64 senderMinus = FHE.sub(balances[msg.sender], amount);
        euint64 toPlus = FHE.add(balances[to], amount);

        // Apply new balances only if canPay is true.
        balances[msg.sender] = FHE.select(canPay, senderMinus, balances[msg.sender]);
        balances[to] = FHE.select(canPay, toPlus, balances[to]);

        // Record whether transfer succeeded.
        _transferSuccess[msg.sender] = canPay;

        // Allow contract to keep accessing updated encrypted values.
        FHE.allowThis(balances[msg.sender]);
        FHE.allowThis(balances[to]);
        FHE.allowThis(_transferSuccess[msg.sender]);

        // Emit Transfer (addresses only).
        emit Transfer(msg.sender, to);
        return true;
    }

    // Return encrypted balance (must be decrypted offchain).
    function balanceOf(address account) external view returns (euint64) {
        return balances[account];
    }

    // Let users decrypt their own balance.
    function allowMyBalance() external {
        FHE.allow(balances[msg.sender], msg.sender);
    }

    // Let users decrypt whether their last transfer succeeded.
    function allowMyTransferResult() external {
        FHE.allow(_transferSuccess[msg.sender], msg.sender);
    }

    // Mint new encrypted tokens.
    function mint(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external {
        // Convert encrypted input.
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);

        // Initialize recipient balance if not already set.
        if (!_balanceInit[to]) {
            balances[to] = FHE.asEuint64(0);
            _balanceInit[to] = true;
        }

        // Update balances and total supply.
        balances[to] = FHE.add(balances[to], amount);
        totalSupply = FHE.add(totalSupply, amount);

        // Allow contract to keep using updated encrypted values.
        FHE.allowThis(balances[to]);
        FHE.allowThis(totalSupply);

        // Emit Mint event.
        emit Mint(to);
    }

    // Return encrypted total supply.
    function getTotalSupply() external view returns (euint64) {
        return totalSupply;
    }
}`;


export const WriteContractStep: React.FC = () => {
  const { completeStep, setCurrentStep } = useTutorialStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'fhe' | 'regular' | 'addition' | 'secret' | 'transfer'>('fhe');
  const [copiedText, setCopiedText] = useState<string | null>(null);

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
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
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
                  <div className="flex items-center justify-between">
                      <Badge variant="secondary">FHEVM</Badge>
                    <CopyButton text={FHECounterContract} id="fhe-contract" />
                  </div>
                  
                  <ScrollArea className="h-[600px] border rounded-lg overflow-x-auto">
                    <div className="p-2 sm:p-4 font-mono text-xs sm:text-sm min-w-[320px] sm:min-w-[920px]">
                      {FHECounterContract.split('\n').map((line, index) => {
                        // Apply color styling to comments
                        const coloredLine = line.replace(
                          /\/\/ (.*)/g, 
                          '<span style="color: #ffd208;">// $1</span>'
                        );
                        return (
                          <div key={index} className="flex items-start gap-2 lg:gap-4 py-1">
                            <span className="text-muted-foreground w-8 text-right select-none flex-shrink-0">
                              {index + 1}
                            </span>
                            <code 
                              className="flex-1 whitespace-pre" 
                              dangerouslySetInnerHTML={{ __html: coloredLine }}
                            />
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
                  
                  <ScrollArea className="h-[600px] border rounded-lg overflow-x-auto">
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
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">FHE Addition Contract</Badge>
                    <CopyButton text={FHEAdditionContract} id="addition-contract" />
                    </div>
                  
                  <ScrollArea className="h-[600px] border rounded-lg overflow-x-auto">
                    <div className="p-2 sm:p-4 font-mono text-xs sm:text-sm min-w-[320px] sm:min-w-[920px]">
                      {FHEAdditionContract.split('\n').map((line, index) => {
                        // Apply color styling to comments
                        const coloredLine = line.replace(
                          /\/\/ (.*)/g, 
                          '<span style="color: #ffd208;">// $1</span>'
                        );
                        return (
                          <div key={index} className="flex items-start gap-2 lg:gap-4 py-1">
                            <span className="text-muted-foreground w-8 text-right select-none flex-shrink-0">
                              {index + 1}
                            </span>
                            <code 
                              className="flex-1 whitespace-pre" 
                              dangerouslySetInnerHTML={{ __html: coloredLine }}
                            />
                  </div>
                        );
                      })}
                  </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="secret" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Secret Number Game</Badge>
                    <CopyButton text={SecretNumberGameContract} id="secret-contract" />
            </div>
                  
                  <ScrollArea className="h-[600px] border rounded-lg overflow-x-auto">
                    <div className="p-2 sm:p-4 font-mono text-xs sm:text-sm min-w-[320px] sm:min-w-[920px]">
                      {SecretNumberGameContract.split('\n').map((line, index) => {
                        // Apply color styling to comments
                        const coloredLine = line.replace(
                          /\/\/ (.*)/g, 
                          '<span style="color: #ffd208;">// $1</span>'
                        );
                        return (
                          <div key={index} className="flex items-start gap-2 lg:gap-4 py-1">
                            <span className="text-muted-foreground w-8 text-right select-none flex-shrink-0">
                              {index + 1}
                            </span>
                            <code 
                              className="flex-1 whitespace-pre" 
                              dangerouslySetInnerHTML={{ __html: coloredLine }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="transfer" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Confidential Transfer</Badge>
                    <CopyButton text={ConfidentialTransferContract} id="transfer-contract" />
                  </div>
                  
                  <ScrollArea className="h-[600px] border rounded-lg overflow-x-auto">
                    <div className="p-2 sm:p-4 font-mono text-xs sm:text-sm min-w-[320px] sm:min-w-[920px]">
                      {ConfidentialTransferContract.split('\n').map((line, index) => {
                        // Apply color styling to comments
                        const coloredLine = line.replace(
                          /\/\/ (.*)/g, 
                          '<span style="color: #ffd208;">// $1</span>'
                        );
                        return (
                          <div key={index} className="flex items-start gap-2 lg:gap-4 py-1">
                            <span className="text-muted-foreground w-8 text-right select-none flex-shrink-0">
                              {index + 1}
                            </span>
                            <code 
                              className="flex-1 whitespace-pre" 
                              dangerouslySetInnerHTML={{ __html: coloredLine }}
                            />
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
                </div>
                  <pre className="text-[11px] sm:text-xs font-mono leading-relaxed whitespace-pre-wrap break-words overflow-x-auto -mx-1 sm:mx-0 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded border border-gray-300 dark:border-gray-600">
{`export async function encryptYesNo(choice: 'yes' | 'no', contractAddress: string, userAddress: string): Promise<string> {
  const fhe = await initializeFheInstance();
  // encode Yes as 1 and No as 0 (euint64)
  const value = choice === 'yes' ? 1 : 0;
  const encryptedInput = fhe.createEncryptedInput(contractAddress, userAddress);
  const result = await encryptedInput.add68(value).encrypt();
  const bytes = result.handles[0] as Uint8Array;
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  const handle = \`0x\${hex}\`;
  
}`}
                  </pre>
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
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Deploy `SimpleVoting.sol` to Sepolia using Hardhat, then paste the deployed address into the frontend `.env`.
              </p>

              {/* Prereqs */}
              <div className="bg-muted p-3 rounded-lg">
                <div className="font-semibold text-xs mb-2">1) Prerequisites (vote-app/.env)</div>
                <pre className="text-[11px] sm:text-xs whitespace-pre-wrap break-words"><code>{`# Required for Sepolia deploy
PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY
INFURA_API_KEY=YOUR_INFURA_KEY   # or set VITE_SEPOLIA_RPC_URL instead
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY   # optional for verify`}</code></pre>
              </div>

              {/* Compile & Deploy */}
              <div className="bg-muted p-3 rounded-lg">
                <div className="font-semibold text-xs mb-2">2) Compile and deploy</div>
                <pre className="text-[11px] sm:text-xs whitespace-pre-wrap break-words"><code>{`cd vote-app
npx hardhat compile
npx hardhat run scripts/deploy.cjs --network sepolia`}</code></pre>
                <p className="text-[11px] text-muted-foreground mt-2">The command prints the deployed address. Copy it.</p>
              </div>

              {/* Frontend env */}
              <div className="bg-muted p-3 rounded-lg">
                <div className="font-semibold text-xs mb-2">3) Point the frontend at your contract</div>
                <pre className="text-[11px] sm:text-xs whitespace-pre-wrap break-words"><code>{`# .env (frontend root)
VITE_VOTING_CONTRACT_ADDRESS=0xYourDeployedAddress`}</code></pre>
              </div>

              {/* Reference to deploy script */}
              <div className="bg-muted p-3 rounded-lg">
                <div className="font-semibold text-xs mb-2">Where the deployment lives</div>
                <div className="text-[11px] text-muted-foreground mb-2">`vote-app/scripts/deploy.cjs` uses Hardhat's runtime to deploy `SimpleVoting.sol`:</div>
                <pre className="text-[11px] sm:text-xs whitespace-pre-wrap break-words"><code>{`// vote-app/scripts/deploy.cjs (excerpt)
const hre = require("hardhat");

async function main() {
  const factory = await hre.ethers.getContractFactory("SimpleVoting");
  const contract = await factory.deploy();
  const address = await contract.getAddress();
  console.log("SimpleVoting deployed to:", address);
}

main().catch((e) => { console.error(e); process.exit(1); });`}</code></pre>
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
              <h4 className="font-semibold mb-3">📁 Project Structure</h4>
              <div className="code-block -mx-1 sm:-mx-2">
                <pre className="text-[11px] sm:text-xs whitespace-pre leading-relaxed p-3">
{`🗂 hello-fhevm/                                  # This repository (tutorial + contracts)
├─ 🗂 src/                                        # Tutorial frontend (React + Vite)
│  ├─ 🗂 components/                               # UI primitives and step UIs
│  │  ├─ 🗂 layout/                                # App shell, sidebar, navigation
│  │  │  ├─ 📄 AppBar.tsx                          # Top app bar
│  │  │  ├─ 📄 Navigation.tsx                      # Left navigation rail
│  │  │  └─ 📄 TutorialSidebar.tsx                 # Right tutorial panel
│  │  ├─ 🗂 steps/                                 # Each guided step's screen
│  │  │  ├─ 📄 EnvironmentSetupStep.tsx            # Environment setup
│  │  │  ├─ 📄 ConnectWalletStep.tsx               # Wallet + network setup
│  │  │  ├─ 📄 PrivateVotingStep.tsx               # Live voting demo
│  │  │  └─ 📄 ReviewStep.tsx                      # Wrap‑up & next steps
│  │  └─ 🗂 quiz/                                  # Knowledge checks for steps
│  ├─ 🗂 lib/                                      # FHE helpers, wallet setup, utils
│  │  ├─ 🗂 fhe/                                   # FHE client + types
│  │  ├─ 🗂 wallet/                                # Wagmi/RainbowKit setup
│  │  └─ 📄 utils.ts                               # Misc utilities
│  ├─ 🗂 state/                                    # Global stores (Zustand)
│  │  ├─ 📄 tutorialStore.ts                       # Step progress, UI state
│  │  └─ 📄 walletStore.ts                         # Wallet/session state
│  ├─ 🗂 pages/                                    # Route components
│  │  ├─ 📄 Index.tsx                              # Home route
│  │  └─ 📄 NotFound.tsx                           # 404 route
│  ├─ 📄 main.tsx                                  # App bootstrap & providers
│  └─ 📄 index.css                                 # Global styles
├─ 🗂 public/                                      # Static assets served by Vite
│  ├─ 📄 _redirects                                # SPA routing on hosts
│  └─ 🗂 fonts/                                    # Web fonts
├─ 🗂 vote-app/                                    # Hardhat workspace (contracts backend)
│  ├─ 🗂 contracts/                                # Solidity sources (e.g., SimpleVoting.sol)
│  │  └─ 📄 SimpleVoting.sol                        # Private voting contract
│  ├─ 🗂 scripts/                                  # Deploy and utility scripts
│  │  └─ 📄 deploy.cjs                             # Example deployment entry
│  ├─ 🗂 test/                                     # Hardhat tests
│  │  ├─ 📄 SimpleVoting.test.cjs                  # Core tests
│  │  └─ 📄 SimpleVoting.test1.cjs                 # Additional scenarios
│  ├─ 📄 hardhat.config.ts                         # Networks & RPC/accounts configuration
│  └─ 📄 package.json                              # Node package for Hardhat app
├─ 📄 package.json                                 # Frontend scripts & dependencies
├─ 📄 vite.config.ts                               # Vite configuration
├─ 📄 README.md                                    # Project overview and quickstart
└─ 🗂 dist/                                        # Production build output (generated)`}
                </pre>
              </div>
            </div>

            {/* Key Files Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">🔐 fhe.ts - FHEVM Integration</h4>
                <div className="bg-muted p-3 rounded-lg text-xs">
                  <div className="font-mono mb-2">// Loads @zama-fhe/relayer-sdk</div>
                  <div className="text-muted-foreground">• Uses CDN dynamic import in <code>vote-app/src/fhe.ts</code></div>
                  <div className="text-muted-foreground">• Calls <code>initSDK()</code> then <code>createInstance(SepoliaConfig)</code></div>
                  <div className="text-muted-foreground">• Handles WASM loading automatically</div>
                  <div className="text-muted-foreground">• Encrypts user votes (createEncryptedInput → add8 → encrypt → handles + inputProof)</div>
                  <div className="text-muted-foreground">• Provides helper to call contract with encrypted params</div>
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
                  <div className="text-muted-foreground">• Contract ABI (subset for UI calls)</div>
                  <div className="text-muted-foreground">• Address via <code>VITE_VOTING_CONTRACT_ADDRESS</code></div>
                  <div className="text-muted-foreground">• Optional helpers like <code>getDecryptionRequestId</code></div>
                </div>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🚀 How to Use This Frontend</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">This project loads the SDK from the CDN via a dynamic import inside <code>vote-app/src/fhe.ts</code>. You can also install via NPM if you prefer.</p>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-3">
                <div>
                  <p><strong>Option 1 - NPM Package:</strong></p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded font-mono text-xs space-y-1">
                    <div># Install the official Zama FHE Relayer SDK</div>
                    <div className="text-green-600">npm install @zama-fhe/relayer-sdk</div>
                    <div className="mt-2 text-yellow-600"># Add to package.json:</div>
                    <div className="text-yellow-600">"type": "module"</div>
                  </div>
                </div>
                
                <div>
                  <p><strong>Option 2 - CDN (Used in this project via dynamic import):</strong></p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded font-mono text-xs whitespace-pre-wrap break-words">
{`// Inside vote-app/src/fhe.ts
const sdk = await import('https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js');
const { initSDK, createInstance, SepoliaConfig } = sdk;`}
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

                {/* CDN Usage Example */}
                <div>
                  <p className="font-semibold">CDN quick start (what this app does under the hood)</p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded font-mono text-xs whitespace-pre-wrap break-words">
{`// 1) Dynamically import the SDK from the CDN
const sdk = await import('https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js');
const { initSDK, createInstance, SepoliaConfig, FhevmType } = sdk;
await initSDK();
const fhe = await createInstance({ ...SepoliaConfig, network: (window as any).ethereum });

// 3) Encrypt a YES/NO vote (YES = 1, NO = 0)
const ciphertext = await fhe.createEncryptedInput(CONTRACT_ADDRESS, USER_ADDRESS);
ciphertext.add8(BigInt(1)); // 1 for YES (use 0 for NO)
const { handles, inputProof } = await ciphertext.encrypt();
const bytes = handles[0];
const encryptedHandle = '0x' + Array.from(bytes).map((b: number) => b.toString(16).padStart(2, '0')).join('');

// 4) Call contract (viem/ethers) with encrypted params
// vote(sessionId, externalEuint8, proof)
await contract.write.vote([sessionId, encryptedHandle, inputProof]);

// 5) Later: request tally reveal, then read revealed totals
// contract emits results after oracle callback.
`}
                  </div>
                </div>

                {/* Note: Decryption is performed by the oracle via contract callback in this app. */}
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
