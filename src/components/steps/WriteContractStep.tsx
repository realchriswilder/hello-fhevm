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
  EyeOff
} from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
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
    text: "Function takes encrypted input + proof (not plaintext!)",
    highlight: "bg-orange-100 dark:bg-orange-900/30"
  },
  {
    line: 23,
    text: "Convert external encrypted input to internal euint32",
    highlight: "bg-orange-100 dark:bg-orange-900/30"
  },
  {
    line: 25,
    text: "Homomorphic addition on encrypted values",
    highlight: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    line: 27,
    text: "Homomorphic addition on encrypted values",
    highlight: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    line: 29,
    text: "FHE.allowThis() - allows the contract to decrypt this value",
    highlight: "bg-pink-100 dark:bg-pink-900/30"
  },
  {
    line: 30,
    text: "FHE.allow() - allows the caller to decrypt this value",
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
    text: "FHE.allowThis() - allows the contract to decrypt the result",
    highlight: "bg-rose-100 dark:bg-rose-900/30"
  },
  {
    line: 44,
    text: "FHE.allow() - allows the caller to decrypt the result",
    highlight: "bg-rose-100 dark:bg-rose-900/30"
  }
];

export const WriteContractStep: React.FC = () => {
  const { completeStep } = useTutorialStore();
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
            <div className="space-y-4">
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
                    "flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border transition-all",
                    isStepComplete(item.step) 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                      : "bg-muted/50 dark:bg-muted/30 hover:bg-muted dark:hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold flex-shrink-0",
                    isStepComplete(item.step)
                      ? "bg-green-500 text-white"
                      : "bg-primary text-primary-foreground"
                  )}>
                    {isStepComplete(item.step) ? <CheckCircle className="h-4 w-4" /> : item.step}
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="text-xs bg-muted dark:bg-muted/50 p-2 rounded font-mono break-words">{item.action}</p>
                    {!isStepComplete(item.step) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markStepComplete(item.step)}
                        className="mt-2 w-full sm:w-auto"
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

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
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
                onClick={() => completeStep('write-contract')}
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
