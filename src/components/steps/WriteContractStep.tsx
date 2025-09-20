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

export const WriteContractStep: React.FC = () => {
  const { completeStep, setCurrentStep } = useTutorialStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'fhe' | 'regular'>('fhe');
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
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'fhe' | 'regular')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fhe" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  FHEVM Counter
                </TabsTrigger>
                <TabsTrigger value="regular" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Regular Solidity
                </TabsTrigger>
              </TabsList>
              
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
                  
                  <ScrollArea className="h-96 border rounded-lg">
                    <div className="p-4 font-mono text-sm">
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
                              <code className="flex-1 break-words">{line}</code>
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
                  
                  <ScrollArea className="h-96 border rounded-lg">
                    <div className="p-4 font-mono text-sm">
                      {RegularCounterContract.split('\n').map((line, index) => (
                        <div key={index} className="flex items-start gap-2 lg:gap-4 py-1">
                          <span className="text-muted-foreground w-8 text-right select-none flex-shrink-0">
                            {index + 1}
                          </span>
                          <code className="flex-1 break-words">{line}</code>
                        </div>
                      ))}
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
            <CardTitle className="flex items-center gap-2">
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
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono text-xs text-foreground">
                    <div>🔐 src/fhe.ts - Encrypt user votes</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExplanations(!showExplanations)}
                    className="h-6 px-2 text-xs hover:bg-muted-foreground/10 dark:hover:bg-muted-foreground/20"
                  >
                    {showExplanations ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span className="ml-1">{showExplanations ? 'Hide' : 'Show'} Code</span>
                  </Button>
                </div>
                {showExplanations && (
                  <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded border border-gray-300 dark:border-gray-600">
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
                <div className="ml-8">├── fhe.ts          <span className="text-muted-foreground">// FHEVM setup & encryption</span></div>
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
                className="gap-2"
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
