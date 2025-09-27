import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Terminal,
  Zap,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowRight,
  Rocket,
  Wallet,
  ExternalLink,
  Trash2,
  ChevronDown,
  FileText,
  Code,
  Globe
} from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';
import { DeployTestCounterQuiz } from '@/components/quiz/DeployTestCounterQuiz';
import { cn } from '@/lib/utils';
import { useAccount, useChainId } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  output: string;
  duration?: number;
  error?: string;
  timestamp: string;
}

interface ContractState {
  deployed: boolean;
  address?: string;
  count?: number;
  encryptedCount?: string;
}

type ContractType = 'counter' | 'addition' | 'secret' | 'transfer';

interface ContractConfig {
  id: ContractType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  scenarios: {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: string;
    testFunction: () => Promise<void>;
  }[];
}

const contractConfigs: ContractConfig[] = [
  {
    id: 'counter',
    name: 'FHE Counter',
    icon: FileText,
    description: 'Basic encrypted counter with increment/decrement operations',
    scenarios: [
      {
        id: 'deploy-counter',
        name: 'Deploy Contract',
        description: 'Deploy FHECounter contract to Sepolia testnet',
        difficulty: 'beginner',
        duration: '~2s',
        testFunction: async () => {
          // Deploy logic will be handled in runAllTests
        }
      },
      {
        id: 'check-initial',
        name: 'Check Initial Count',
        description: 'Verify initial encrypted count is uninitialized',
        difficulty: 'beginner',
        duration: '~1s',
        testFunction: async () => {
          // Deploy logic will be handled in runAllTests
        }
      },
      {
        id: 'increment',
        name: 'Increment Counter',
        description: 'Encrypt value 1 and call increment function',
        difficulty: 'intermediate',
        duration: '~2s',
        testFunction: async () => {
          // Deploy logic will be handled in runAllTests
        }
      },
      {
        id: 'decrement',
        name: 'Decrement Counter',
        description: 'Encrypt value 1 and call decrement function',
        difficulty: 'intermediate',
        duration: '~2s',
        testFunction: async () => {
          // Deploy logic will be handled in runAllTests
        }
      }
    ]
  },
  {
    id: 'addition',
    name: 'FHE Addition',
    icon: Code,
    description: 'Two-input encrypted addition with homomorphic operations',
    scenarios: [
      {
        id: 'deploy-addition',
        name: 'Deploy Contract',
        description: 'Deploy FHEAddition contract to Sepolia testnet',
        difficulty: 'beginner',
        duration: '~2s',
        testFunction: async () => {}
      },
      {
        id: 'set-input-a',
        name: 'Set Input A',
        description: 'Encrypt and set first input value',
        difficulty: 'beginner',
        duration: '~1s',
        testFunction: async () => {}
      },
      {
        id: 'set-input-b',
        name: 'Set Input B',
        description: 'Encrypt and set second input value',
        difficulty: 'beginner',
        duration: '~1s',
        testFunction: async () => {}
      },
      {
        id: 'compute-sum',
        name: 'Compute Sum',
        description: 'Perform homomorphic addition on encrypted inputs',
        difficulty: 'intermediate',
        duration: '~2s',
        testFunction: async () => {}
      },
      {
        id: 'get-result',
        name: 'Get Result',
        description: 'Retrieve and decrypt the computed sum',
        difficulty: 'intermediate',
        duration: '~1s',
        testFunction: async () => {}
      }
    ]
  },
  {
    id: 'secret',
    name: 'Secret Game',
    icon: Eye,
    description: 'Encrypted number guessing game with hints',
    scenarios: [
      {
        id: 'deploy-secret',
        name: 'Deploy Contract',
        description: 'Deploy SecretNumberGame contract to Sepolia testnet',
        difficulty: 'beginner',
        duration: '~2s',
        testFunction: async () => {}
      },
      {
        id: 'set-secret',
        name: 'Set Secret Number',
        description: 'Encrypt and set the secret number to be guessed',
        difficulty: 'intermediate',
        duration: '~1s',
        testFunction: async () => {}
      },
      {
        id: 'make-guess',
        name: 'Make Guess',
        description: 'Encrypt guess and get encrypted hint',
        difficulty: 'intermediate',
        duration: '~2s',
        testFunction: async () => {}
      },
      {
        id: 'check-hint',
        name: 'Check Hint',
        description: 'Decrypt and reveal the hint (too low/high/correct)',
        difficulty: 'advanced',
        duration: '~1s',
        testFunction: async () => {}
      }
    ]
  },
  {
    id: 'transfer',
    name: 'Confidential Transfer',
    icon: Globe,
    description: 'Encrypted token transfers with balance management',
    scenarios: [
      {
        id: 'deploy-transfer',
        name: 'Deploy Contract',
        description: 'Deploy ConfidentialTransfer contract to Sepolia testnet',
        difficulty: 'beginner',
        duration: '~2s',
        testFunction: async () => {}
      },
      {
        id: 'initialize-supply',
        name: 'Initialize Supply',
        description: 'Set up initial encrypted token supply',
        difficulty: 'intermediate',
        duration: '~1s',
        testFunction: async () => {}
      },
      {
        id: 'check-balance',
        name: 'Check Balance',
        description: 'View encrypted token balance',
        difficulty: 'beginner',
        duration: '~1s',
        testFunction: async () => {}
      },
      {
        id: 'transfer-tokens',
        name: 'Transfer Tokens',
        description: 'Send encrypted tokens to another address',
        difficulty: 'advanced',
        duration: '~3s',
        testFunction: async () => {}
      },
      {
        id: 'verify-transfer',
        name: 'Verify Transfer',
        description: 'Check transfer success and updated balances',
        difficulty: 'intermediate',
        duration: '~1s',
        testFunction: async () => {}
      }
    ]
  }
];

export const DeployTestCounterStep: React.FC = () => {
  const { setCurrentStep, completeStep } = useTutorialStore();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const chainId = useChainId();
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showOutput, setShowOutput] = useState(true);
  const [copiedOutput, setCopiedOutput] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [contractState, setContractState] = useState<ContractState>({
    deployed: false,
    address: undefined,
    count: 0,
    encryptedCount: undefined
  });
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [runningSteps, setRunningSteps] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [selectedContractType, setSelectedContractType] = useState<ContractType>('counter');

  // Get current contract configuration
  const currentContract = contractConfigs.find(config => config.id === selectedContractType) || contractConfigs[0];

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Get button icon based on test status
  const getButtonIcon = (testName: string) => {
    if (runningSteps.has(testName)) {
      return <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
    }
    if (completedSteps.has(testName)) {
      return <CheckCircle className="h-3 w-3 mr-1 text-green-600" />;
    }
    return <Play className="h-3 w-3 mr-1" />;
  };

  // Get expected terminal output based on contract type
  const getExpectedOutput = () => {
    switch (selectedContractType) {
      case 'counter':
        return [
          'Simulated contract deployment (no real wallet signature needed)',
          'fhevm.createEncryptedInput() and .add32() operations',
          'fheCounterContract.connect().increment() calls',
          'fheCounterContract.getCount() and encrypted count values',
          'fhevm.userDecryptEuint() for decryption',
          'Counter state changes: 0 → 1 → 0 (increment then decrement)',
          'Simulated transaction confirmation and gas usage details',
          'Realistic Hardhat test simulation with actual FHEVM logs',
          'Note: This is a simulation - copy FHECounter.sol from Step 5 to deploy real contract on Sepolia'
        ];
      case 'addition':
        return [
          'Simulated contract deployment (no real wallet signature needed)',
          'fhevm.createEncryptedInput() and .add32() operations for inputs A & B',
          'fheAdditionContract.setInputA() and setInputB() calls',
          'fheAdditionContract.computeSum() homomorphic addition',
          'fheAdditionContract.getResult() and encrypted result values',
          'fhevm.userDecryptEuint() for result decryption',
          'Addition computation: 15 + 25 = 40 (on encrypted data)',
          'Simulated transaction confirmation and gas usage details',
          'Note: This is a simulation - copy FHEAddition.sol from Step 5 to deploy real contract on Sepolia'
        ];
      case 'secret':
        return [
          'Simulated contract deployment (no real wallet signature needed)',
          'fhevm.createEncryptedInput() and .add32() operations for secret & guess',
          'secretGameContract.setSecretNumber() with encrypted value',
          'secretGameContract.makeGuess() with encrypted guess',
          'secretGameContract.getHint() and encrypted hint values',
          'fhevm.userDecryptEuint() for hint decryption',
          'Game logic: encrypted comparison (35 < 42) → "Too low!"',
          'Simulated transaction confirmation and gas usage details',
          'Note: This is a simulation - copy SecretNumberGame.sol from Step 5 to deploy real contract on Sepolia'
        ];
      case 'transfer':
        return [
          'Simulated contract deployment (no real wallet signature needed)',
          'fhevm.createEncryptedInput() and .add32() operations for amounts',
          'confidentialTransferContract.initializeSupply() with encrypted supply',
          'confidentialTransferContract.getBalance() and encrypted balances',
          'confidentialTransferContract.transfer() with encrypted amounts',
          'confidentialTransferContract.getTransferSuccess() verification',
          'fhevm.userDecryptEuint() for balance and status decryption',
          'Transfer simulation: 1000 → 900 (sender) + 100 (recipient)',
          'Note: This is a simulation - copy ConfidentialTransfer.sol from Step 5 to deploy real contract on Sepolia'
        ];
      default:
        return [];
    }
  };

  const handleContinue = () => {
    completeStep('deploy-test-counter');
    setCurrentStep('testing-playground');
    navigate('/step/testing-playground');
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedOutput(id);
      setTimeout(() => setCopiedOutput(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const updateResult = (id: string, updates: Partial<TestResult>) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const clearResults = () => {
    setResults([]);
  };

  const runTest = async (testName: string, testFunction: () => Promise<void>) => {
    const testId = `${testName}-${Date.now()}`;
    const startTime = Date.now();
    
    addResult({
      id: testId,
      name: testName,
      status: 'success',
      output: `Starting ${testName}...`,
      timestamp: new Date().toLocaleTimeString()
    });

    setCurrentTest(testId);
    setRunningSteps(prev => new Set(prev).add(testName));

    try {
      await testFunction();
      const duration = Date.now() - startTime;
      updateResult(testId, {
        status: 'success',
        output: `✅ ${testName} completed successfully!`,
        duration
      });
      // Mark step as completed
      setCompletedSteps(prev => new Set(prev).add(testName));
    } catch (error) {
      const duration = Date.now() - startTime;
      updateResult(testId, {
        status: 'error',
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setCurrentTest(null);
      setRunningSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(testName);
        return newSet;
      });
    }
  };

  // Test functions based on the Zama test code
  const deployContract = async () => {
    // Check if wallet is connected
    if (!isConnected) {
      addResult({
        id: `deploy-${Date.now()}`,
        name: 'Deploy Contract',
        status: 'error',
        output: '❌ Wallet not connected!\n🔗 Please connect your wallet first to deploy contracts on Sepolia.',
        timestamp: new Date().toLocaleTimeString()
      });
      // Open wallet connection modal
      if (openConnectModal) {
        openConnectModal();
      }
      return;
    }

    // Check if on correct network (Sepolia)
    if (chainId !== 11155111) {
      addResult({
        id: `deploy-${Date.now()}`,
        name: 'Deploy Contract',
        status: 'error',
        output: '❌ Wrong network!\n🌐 Please switch to Sepolia testnet in your wallet to deploy contracts.',
        timestamp: new Date().toLocaleTimeString()
      });
      return;
    }

    await runTest('Deploy FHECounter Contract', async () => {
      addResult({
        id: `deploy-${Date.now()}`,
        name: 'Deploy Contract',
        status: 'success',
        output: '🚀 Deploying FHECounter contract to Sepolia testnet...\n⏳ Compiling contract...\n📦 Uploading to network...\n🔐 Requesting wallet signature...',
        timestamp: new Date().toLocaleTimeString()
      });

      // Simulate Hardhat deployment process
      addResult({
        id: `deploy-factory-${Date.now()}`,
        name: 'Deploy Factory',
        status: 'success',
        output: '📦 const factory = await ethers.getContractFactory("FHECounter")\n📦 const fheCounterContract = await factory.deploy()\n📍 const fheCounterContractAddress = await fheCounterContract.getAddress()',
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addResult({
        id: `deploy-success-${Date.now()}`,
        name: 'Deploy Success',
        status: 'success',
        output: '✅ FHECounter contract deployed successfully!\n📍 Contract address: 0x1234...5678\n🔗 View on Sepolia Explorer: https://sepolia.etherscan.io/address/0x1234...5678\n⛽ Gas used: 1,234,567\n💰 Transaction fee: 0.0012 ETH',
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      setContractState({
        deployed: true,
        address: mockAddress,
        count: 0,
        encryptedCount: '0x0000000000000000000000000000000000000000000000000000000000000000'
      });

      // Final deployment result - this will be overridden by runTest's completion message
      addResult({
        id: `deploy-final-${Date.now()}`,
        name: 'Deploy Final',
        status: 'success',
        output: `📍 Address: ${mockAddress}\n⛽ Gas used: 1,234,567\n🔗 View on Sepolia Explorer: https://sepolia.etherscan.io/address/${mockAddress}\n💰 Transaction confirmed on Sepolia!\n\n📝 Note: This is a simulation. To deploy the real contract:\n1. Copy the FHECounter.sol code from Step 4\n2. Deploy using Remix IDE or Hardhat environment\n3. Use the same ABI and contract address for testing`,
        timestamp: new Date().toLocaleTimeString()
      });

    });
  };

  const testInitialCount = async () => {
    await runTest('Check Initial Count', async () => {
      addResult({
        id: `initial-${Date.now()}`,
        name: 'Check Initial Count',
        status: 'success',
        output: '🔍 Calling FHECounter.getCount()...',
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 800));

      addResult({
        id: `initial-result-${Date.now()}`,
        name: 'Check Initial Count',
        status: 'success',
        output: '✅ Encrypted count should be uninitialized after deployment\n🔢 Encrypted count: 0x0000000000000000000000000000000000000000000000000000000000000000\n📊 Expect initial count to be bytes32(0) after deployment\n🔐 (meaning the encrypted count value is uninitialized)',
        timestamp: new Date().toLocaleTimeString()
      });
    });
  };

  const testIncrement = async () => {
    await runTest('Increment Counter by 1', async () => {
      const currentCount = contractState.count || 0;
      const contractAddress = contractState.address || '0x1234...5678';
      const userAddress = address || '0x3d06...F110';
      
      addResult({
        id: `increment-${Date.now()}`,
        name: 'Increment Counter',
        status: 'success',
        output: `🔍 Encrypted count before increment: ${contractState.encryptedCount || '0x0000...0000'}\n📊 Expect initial count to be bytes32(0) after deployment\n🔢 Clear count before increment: ${currentCount}`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 800));

      addResult({
        id: `encrypt-${Date.now()}`,
        name: 'Encrypt Value',
        status: 'success',
        output: `🔐 Encrypting constant 1 as a euint32...\n📞 fhevm.createEncryptedInput(${contractAddress}, ${userAddress})\n🔑 .add32(1)\n🔐 .encrypt()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const callIncrementId = `call-increment-${Date.now()}`;
      addResult({
        id: callIncrementId,
        name: 'Call Increment',
        status: 'running',
        output: `📞 fheCounterContract.connect(signers.alice).increment(encryptedOne.handles[0], encryptedOne.inputProof)\n⏳ await tx.wait()...`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      updateResult(callIncrementId, {
        status: 'success',
        output: `📞 fheCounterContract.connect(signers.alice).increment(encryptedOne.handles[0], encryptedOne.inputProof)\n✅ await tx.wait() - Transaction confirmed!`,
        duration: 1500
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      const newCount = currentCount + 1;
      const newEncryptedCount = `0x${Math.random().toString(16).substr(2, 64)}`;
      setContractState(prev => ({
        ...prev,
        count: newCount,
        encryptedCount: newEncryptedCount
      }));

      const getCountId = `get-count-${Date.now()}`;
      addResult({
        id: getCountId,
        name: 'Get Count',
        status: 'running',
        output: `📞 fheCounterContract.getCount()...`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 800));

      updateResult(getCountId, {
        status: 'success',
        output: `📞 fheCounterContract.getCount()\n🔢 Encrypted count after increment: ${newEncryptedCount}`,
        duration: 800
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      const decryptId = `decrypt-${Date.now()}`;
      addResult({
        id: decryptId,
        name: 'Decrypt Count',
        status: 'running',
        output: `🔓 fhevm.userDecryptEuint(FhevmType.euint32, encryptedCountAfterInc, ${contractAddress}, signers.alice)...`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      updateResult(decryptId, {
        status: 'success',
        output: `🔓 fhevm.userDecryptEuint(FhevmType.euint32, encryptedCountAfterInc, ${contractAddress}, signers.alice)\n🔢 Clear count after increment: ${newCount}`,
        duration: 1000
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Final increment result - completion handled by runTest
      addResult({
        id: `increment-final-${Date.now()}`,
        name: 'Increment Final',
        status: 'success',
        output: `🔢 Clear count: ${currentCount} + 1 = ${newCount}\n🔐 Encrypted count updated on-chain\n⛽ Gas used: 45,678`,
        timestamp: new Date().toLocaleTimeString()
      });
    });
  };

  const testDecrement = async () => {
    await runTest('Decrement Counter by 1', async () => {
      const currentCount = contractState.count || 0;
      const contractAddress = contractState.address || '0x1234...5678';
      const userAddress = address || '0x3d06...F110';
      
      addResult({
        id: `decrement-${Date.now()}`,
        name: 'Decrement Counter',
        status: 'success',
        output: `🔐 Encrypting constant 1 as a euint32...\n📞 fhevm.createEncryptedInput(${contractAddress}, ${userAddress})\n🔑 .add32(1)\n🔐 .encrypt()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const incrementFirstId = `increment-first-${Date.now()}`;
      addResult({
        id: incrementFirstId,
        name: 'First Increment',
        status: 'running',
        output: `📞 First increment by 1, count becomes ${currentCount + 1}\n📞 fheCounterContract.connect(signers.alice).increment(encryptedOne.handles[0], encryptedOne.inputProof)\n⏳ await tx.wait()...`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1200));

      updateResult(incrementFirstId, {
        status: 'success',
        output: `📞 First increment by 1, count becomes ${currentCount + 1}\n📞 fheCounterContract.connect(signers.alice).increment(encryptedOne.handles[0], encryptedOne.inputProof)\n✅ await tx.wait() - Transaction confirmed!`,
        duration: 1200
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // First increment
      const afterIncrement = currentCount + 1;
      setContractState(prev => ({
        ...prev,
        count: afterIncrement,
        encryptedCount: `0x${Math.random().toString(16).substr(2, 64)}`
      }));

      const decrementCallId = `decrement-call-${Date.now()}`;
      addResult({
        id: decrementCallId,
        name: 'Decrement Call',
        status: 'running',
        output: `📞 Then decrement by 1, count goes back to ${currentCount}\n📞 fheCounterContract.connect(signers.alice).decrement(encryptedOne.handles[0], encryptedOne.inputProof)\n⏳ await tx.wait()...`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1300));

      updateResult(decrementCallId, {
        status: 'success',
        output: `📞 Then decrement by 1, count goes back to ${currentCount}\n📞 fheCounterContract.connect(signers.alice).decrement(encryptedOne.handles[0], encryptedOne.inputProof)\n✅ await tx.wait() - Transaction confirmed!`,
        duration: 1300
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      const newCount = Math.max(afterIncrement - 1, 0);
      const newEncryptedCount = `0x${Math.random().toString(16).substr(2, 64)}`;
      setContractState(prev => ({
        ...prev,
        count: newCount,
        encryptedCount: newEncryptedCount
      }));

      const getCountAfterId = `get-count-after-${Date.now()}`;
      addResult({
        id: getCountAfterId,
        name: 'Get Count After',
        status: 'running',
        output: `📞 fheCounterContract.getCount()...`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 700));

      updateResult(getCountAfterId, {
        status: 'success',
        output: `📞 fheCounterContract.getCount()\n🔢 Encrypted count after decrement: ${newEncryptedCount}`,
        duration: 700
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      const decryptFinalId = `decrypt-final-${Date.now()}`;
      addResult({
        id: decryptFinalId,
        name: 'Decrypt Final',
        status: 'running',
        output: `🔓 fhevm.userDecryptEuint(FhevmType.euint32, encryptedCountAfterDec, ${contractAddress}, signers.alice)...`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 900));

      updateResult(decryptFinalId, {
        status: 'success',
        output: `🔓 fhevm.userDecryptEuint(FhevmType.euint32, encryptedCountAfterDec, ${contractAddress}, signers.alice)\n🔢 Clear count after decrement: ${newCount}`,
        duration: 900
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Final decrement result - completion handled by runTest
      addResult({
        id: `decrement-final-${Date.now()}`,
        name: 'Decrement Final',
        status: 'success',
        output: `🔢 Clear count: ${afterIncrement} - 1 = ${newCount}\n🔐 Encrypted count updated on-chain\n⛽ Gas used: 42,345`,
        timestamp: new Date().toLocaleTimeString()
      });
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    setRunningSteps(new Set());
    setCompletedSteps(new Set());

    try {
      // Run each test sequentially based on current contract type
      for (const scenario of currentContract.scenarios) {
        await runTest(scenario.name, async () => {
          // Check wallet connection
          if (!isConnected) {
            addResult({
              id: `error-${Date.now()}`,
              name: scenario.name,
              status: 'error',
              output: '❌ Wallet not connected. Please connect your wallet first.',
              timestamp: new Date().toLocaleTimeString()
            });
            if (openConnectModal) {
              openConnectModal();
            }
            return;
          }

          if (chainId !== 11155111) {
            addResult({
              id: `error-${Date.now()}`,
              name: scenario.name,
              status: 'error',
              output: '❌ Please switch to Sepolia testnet to deploy the contract.',
              timestamp: new Date().toLocaleTimeString()
            });
            return;
          }

          // Generate dynamic output based on contract type and scenario
          const contractName = currentContract.name;
          const contractAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
          const userAddress = address || '0x3d06...F110';

          // Deploy scenarios
          if (scenario.id.includes('deploy')) {
            addResult({
              id: `deploy-${Date.now()}`,
              name: scenario.name,
              status: 'success',
              output: `🚀 Deploying ${contractName} contract to Sepolia testnet...\n⏳ Compiling contract...\n📦 Uploading to network...\n🔐 Requesting wallet signature...`,
              timestamp: new Date().toLocaleTimeString()
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            addResult({
              id: `deploy-factory-${Date.now()}`,
              name: 'Deploy Factory',
              status: 'success',
              output: `📦 const factory = await ethers.getContractFactory("${contractName.replace(' ', '')}")\n📦 const contract = await factory.deploy()\n📍 const contractAddress = await contract.getAddress()`,
              timestamp: new Date().toLocaleTimeString()
            });

            await new Promise(resolve => setTimeout(resolve, 1500));
            
            addResult({
              id: `deploy-success-${Date.now()}`,
              name: 'Deploy Success',
              status: 'success',
              output: `✅ ${contractName} contract deployed successfully!\n📍 Contract address: ${contractAddress}\n🔗 View on Sepolia Explorer: https://sepolia.etherscan.io/address/${contractAddress}\n⛽ Gas used: 1,234,567\n💰 Transaction fee: 0.0012 ETH`,
              timestamp: new Date().toLocaleTimeString()
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

            setContractState({
              deployed: true,
              address: contractAddress,
              count: 0,
              encryptedCount: '0x0000000000000000000000000000000000000000000000000000000000000000'
            });
          }
          // Other scenarios based on contract type
          else if (selectedContractType === 'counter') {
            await runCounterScenario(scenario);
          } else if (selectedContractType === 'addition') {
            await runAdditionScenario(scenario);
          } else if (selectedContractType === 'secret') {
            await runSecretScenario(scenario);
          } else if (selectedContractType === 'transfer') {
            await runTransferScenario(scenario);
          }
        });
      }
    } finally {
      setIsRunning(false);
      setRunningSteps(new Set());
    }
  };

  // Counter-specific scenarios
  const runCounterScenario = async (scenario: any) => {
    const contractAddress = contractState.address || '0x1234...5678';
    const userAddress = address || '0x3d06...F110';
    
    if (scenario.id === 'check-initial') {
      addResult({
        id: `initial-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: '🔍 Calling FHECounter.getCount()...',
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 800));

      addResult({
        id: `initial-result-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: '✅ Encrypted count should be uninitialized after deployment\n🔢 Encrypted count: 0x0000000000000000000000000000000000000000000000000000000000000000\n📊 Expect initial count to be bytes32(0) after deployment\n🔐 (meaning the encrypted count value is uninitialized)',
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (scenario.id === 'increment') {
      const currentCount = contractState.count || 0;
      
      addResult({
        id: `increment-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔐 Encrypting constant 1 as a euint32...\n📞 fhevm.createEncryptedInput(${contractAddress}, ${userAddress})\n🔑 .add32(1)\n🔐 .encrypt()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      addResult({
        id: `increment-call-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `📞 fheCounterContract.connect(signers.alice).increment(encryptedOne.handles[0], encryptedOne.inputProof)\n⏳ await tx.wait()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const newCount = currentCount + 1;
      const newEncryptedCount = `0x${Math.random().toString(16).substr(2, 64)}`;
      setContractState(prev => ({
        ...prev,
        count: newCount,
        encryptedCount: newEncryptedCount
      }));

      addResult({
        id: `increment-result-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `✅ Counter incremented successfully!\n🔢 New encrypted count: ${newEncryptedCount}\n📊 Count value: ${newCount}\n🔐 The encrypted count is now updated with the new value`,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (scenario.id === 'decrement') {
      const currentCount = contractState.count || 0;
      
      addResult({
        id: `decrement-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔐 Encrypting constant 1 as a euint32...\n📞 fhevm.createEncryptedInput(${contractAddress}, ${userAddress})\n🔑 .add32(1)\n🔐 .encrypt()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      addResult({
        id: `decrement-call-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `📞 fheCounterContract.connect(signers.alice).decrement(encryptedOne.handles[0], encryptedOne.inputProof)\n⏳ await tx.wait()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const newCount = Math.max(currentCount - 1, 0);
      const newEncryptedCount = `0x${Math.random().toString(16).substr(2, 64)}`;
      setContractState(prev => ({
        ...prev,
        count: newCount,
        encryptedCount: newEncryptedCount
      }));

      addResult({
        id: `decrement-result-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `✅ Counter decremented successfully!\n🔢 New encrypted count: ${newEncryptedCount}\n📊 Count value: ${newCount}\n🔐 The encrypted count is now updated with the new value`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  // Addition-specific scenarios
  const runAdditionScenario = async (scenario: any) => {
    const contractAddress = contractState.address || '0x1234...5678';
    const userAddress = address || '0x3d06...F110';
    
    if (scenario.id === 'set-input-a') {
      addResult({
        id: `input-a-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔐 Encrypting input A (value: 15) as euint32...\n📞 fhevm.createEncryptedInput(${contractAddress}, ${userAddress})\n🔑 .add32(15)\n🔐 .encrypt()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      addResult({
        id: `input-a-set-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `📞 fheAdditionContract.setInputA(encryptedInputA.handles[0], encryptedInputA.inputProof)\n⏳ await tx.wait()\n✅ Input A set to encrypted value 15`,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (scenario.id === 'set-input-b') {
      addResult({
        id: `input-b-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔐 Encrypting input B (value: 25) as euint32...\n📞 fhevm.createEncryptedInput(${contractAddress}, ${userAddress})\n🔑 .add32(25)\n🔐 .encrypt()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      addResult({
        id: `input-b-set-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `📞 fheAdditionContract.setInputB(encryptedInputB.handles[0], encryptedInputB.inputProof)\n⏳ await tx.wait()\n✅ Input B set to encrypted value 25`,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (scenario.id === 'compute-sum') {
      addResult({
        id: `compute-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🧮 Computing sum of encrypted inputs...\n📞 fheAdditionContract.computeSum()\n⏳ await tx.wait()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      addResult({
        id: `compute-result-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `✅ Homomorphic addition completed!\n🔢 Encrypted result: 0x${Math.random().toString(16).substr(2, 64)}\n🧮 15 + 25 = 40 (computed on encrypted data)\n🔐 Result remains encrypted until decryption`,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (scenario.id === 'get-result') {
      addResult({
        id: `get-result-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔍 Retrieving encrypted result...\n📞 fheAdditionContract.getResult()\n🔐 Result: 0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 800));

      addResult({
        id: `decrypt-result-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔓 Decrypting result...\n📞 fhevm.decrypt(contractAddress, encryptedResult)\n✅ Decrypted result: 40\n🎉 Successfully computed 15 + 25 = 40 on encrypted data!`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  // Secret Game-specific scenarios
  const runSecretScenario = async (scenario: any) => {
    const contractAddress = contractState.address || '0x1234...5678';
    const userAddress = address || '0x3d06...F110';
    
    if (scenario.id === 'set-secret') {
      addResult({
        id: `secret-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔐 Encrypting secret number (42) as euint32...\n📞 fhevm.createEncryptedInput(${contractAddress}, ${userAddress})\n🔑 .add32(42)\n🔐 .encrypt()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      addResult({
        id: `secret-set-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `📞 secretGameContract.setSecretNumber(encryptedSecret.handles[0], encryptedSecret.inputProof)\n⏳ await tx.wait()\n✅ Secret number 42 encrypted and stored`,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (scenario.id === 'make-guess') {
      addResult({
        id: `guess-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔐 Encrypting guess (35) as euint32...\n📞 fhevm.createEncryptedInput(${contractAddress}, ${userAddress})\n🔑 .add32(35)\n🔐 .encrypt()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      addResult({
        id: `guess-call-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `📞 secretGameContract.makeGuess(encryptedGuess.handles[0], encryptedGuess.inputProof)\n⏳ await tx.wait()\n🔐 Encrypted hint generated`,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (scenario.id === 'check-hint') {
      addResult({
        id: `hint-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔍 Retrieving encrypted hint...\n📞 secretGameContract.getHint()\n🔐 Encrypted hint: 0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      addResult({
        id: `hint-decrypt-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔓 Decrypting hint...\n📞 fhevm.decrypt(contractAddress, encryptedHint)\n✅ Hint: "Too low!" (35 < 42)\n🎯 Guess was too low, try a higher number!`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  // Transfer-specific scenarios
  const runTransferScenario = async (scenario: any) => {
    const contractAddress = contractState.address || '0x1234...5678';
    const userAddress = address || '0x3d06...F110';
    const recipientAddress = '0x742d...A1B2';
    
    if (scenario.id === 'initialize-supply') {
      addResult({
        id: `supply-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔐 Encrypting initial supply (1000 tokens) as euint32...\n📞 fhevm.createEncryptedInput(${contractAddress}, ${userAddress})\n🔑 .add32(1000)\n🔐 .encrypt()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      addResult({
        id: `supply-set-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `📞 confidentialTransferContract.initializeSupply(encryptedSupply.handles[0], encryptedSupply.inputProof)\n⏳ await tx.wait()\n✅ Initial supply of 1000 tokens encrypted and set`,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (scenario.id === 'check-balance') {
      addResult({
        id: `balance-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔍 Checking encrypted balance...\n📞 confidentialTransferContract.getBalance(${userAddress})\n🔐 Encrypted balance: 0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 800));

      addResult({
        id: `balance-decrypt-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔓 Decrypting balance...\n📞 fhevm.decrypt(contractAddress, encryptedBalance)\n✅ Current balance: 1000 tokens\n💰 Balance remains encrypted on-chain`,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (scenario.id === 'transfer-tokens') {
      addResult({
        id: `transfer-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔐 Encrypting transfer amount (100 tokens) as euint32...\n📞 fhevm.createEncryptedInput(${contractAddress}, ${userAddress})\n🔑 .add32(100)\n🔐 .encrypt()`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      addResult({
        id: `transfer-call-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `📞 confidentialTransferContract.transfer(${recipientAddress}, encryptedAmount.handles[0], encryptedAmount.inputProof)\n⏳ await tx.wait()\n✅ Transfer of 100 tokens initiated`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      addResult({
        id: `transfer-success-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `✅ Transfer completed successfully!\n🔐 Encrypted balances updated\n💰 Sender balance: 900 tokens (encrypted)\n💰 Recipient balance: 100 tokens (encrypted)\n🔒 All amounts remain private`,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (scenario.id === 'verify-transfer') {
      addResult({
        id: `verify-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔍 Verifying transfer success...\n📞 confidentialTransferContract.getTransferSuccess(${userAddress})\n🔐 Encrypted status: 0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date().toLocaleTimeString()
      });

      await new Promise(resolve => setTimeout(resolve, 800));

      addResult({
        id: `verify-result-${Date.now()}`,
        name: scenario.name,
        status: 'success',
        output: `🔓 Decrypting transfer status...\n📞 fhevm.decrypt(contractAddress, encryptedStatus)\n✅ Transfer status: true\n🎉 Transfer was successful and verified!`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };


  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  const getLogColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'running':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl font-bold">Simulate & Test FHE Contracts</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simulate deploying different FHE contracts and interact with them in real-time. 
              Experience how FHE operations work through a realistic simulation (like Hardhat testnet).
            </p>
            
            {/* Simulation Status */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <span className="text-sm font-medium">Simulation Mode:</span>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Network:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  Simulated Sepolia
                </code>
              </div>
            </div>
          </div>

          {/* Main Content - Playground Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Side - Test Scenarios */}
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Test Scenarios</h2>
                
                {/* Contract Type Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Select Contract Type</label>
                  <Select value={selectedContractType} onValueChange={(value) => setSelectedContractType(value as ContractType)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractConfigs.map((config) => {
                        const IconComponent = config.icon;
                        return (
                          <SelectItem key={config.id} value={config.id}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{config.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  {/* Contract Description */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {React.createElement(currentContract.icon, { className: "h-4 w-4 text-primary" })}
                      <span className="text-sm font-medium">{currentContract.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{currentContract.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Dynamic Test Scenarios */}
              <div className="space-y-3">
                {currentContract.scenarios.map((scenario) => (
                  <Card key={scenario.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-sm">{scenario.name}</h3>
                          <Badge className={`text-xs ${getDifficultyColor(scenario.difficulty)}`}>
                            {scenario.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {scenario.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{scenario.duration}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runTest(scenario.name, scenario.testFunction)}
                            disabled={isRunning || !isConnected}
                            className="h-6 px-2 text-xs"
                          >
                            {getButtonIcon(scenario.name)}
                            Test
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Run All Tests Button */}
              <Button 
                onClick={runAllTests} 
                disabled={isRunning || !isConnected}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white ring-2 ring-yellow-400 ring-opacity-50 shadow-lg"
                size="lg"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run All Scenarios
              </Button>
            </div>

            {/* Right Side - Live Terminal (Playground Style) */}
            <div className="lg:col-span-3">
              <Card className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-primary" />
                      <CardTitle>Live Terminal</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        Ready
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowOutput(!showOutput)}
                      >
                        {showOutput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearResults}
                        disabled={results.length === 0}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Terminal Window */}
                    <div className="rounded-md border text-sm font-mono bg-white text-neutral-800 dark:bg-black/90 dark:text-neutral-200">
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-black/70 dark:text-white/70 font-medium">FHE TESTING TERMINAL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(results.map(r => r.output).join('\n\n'), 'output')}
                          className="text-gray-400 hover:text-white"
                        >
                          {copiedOutput === 'output' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearResults}
                          className="text-gray-400 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <span className="text-gray-400 text-xs">{results.length} logs</span>
                      </div>
                    </div>

                    {/* Terminal Content */}
                     <div className="h-[32rem] overflow-auto px-3 py-2 space-y-1">
                      {results.length === 0 ? (
                        <div className="text-black/50 dark:text-white/50">➜ Ready to run FHE tests...</div>
                      ) : (
                        <div className="space-y-1">
                          {results.map((result) => (
                            <div key={result.id} className="flex items-start gap-2">
                              <span className="text-green-500 text-xs mt-0.5">➜</span>
                              <span className="text-black/50 dark:text-white/50 text-xs">
                                [{result.timestamp}]
                              </span>
                              <span className={`text-xs ${getLogColor(result.status)}`}>
                                {result.name}
                              </span>
                              <div className="flex-1">
                                <pre className="text-xs text-black/70 dark:text-white/70 whitespace-pre-wrap mt-1">
                                  {result.output}
                                </pre>
                                {result.duration && (
                                  <div className="text-xs text-black/50 dark:text-white/50 mt-1">
                                    Duration: {result.duration}ms
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Show What You Should See Button */}
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChecklist(!showChecklist)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showChecklist ? 'Hide' : 'Show'} What you should see
                    </Button>
                    <AnimatePresence>
                      {showChecklist && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          exit={{ opacity: 0, height: 0 }} 
                          className="mt-4 text-xs text-muted-foreground"
                        >
                          <div className="bg-muted/30 rounded-lg p-4 text-left">
                            <h4 className="font-medium text-sm mb-2 text-foreground">Expected Terminal Output for {currentContract.name}:</h4>
                            <ul className="list-disc pl-4 space-y-1">
                              {getExpectedOutput().map((item, index) => (
                                <li key={index}>
                                  {item.includes('Note:') ? (
                                    <><strong>Note:</strong> {item.replace('Note: ', '')}</>
                                  ) : (
                                    item
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mt-8">
            <DeployTestCounterQuiz />
          </div>

          {/* Continue Button */}
          <div className="text-center mt-8">
            <Button onClick={handleContinue} size="lg" className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white">
              Continue to Testing Playground <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeployTestCounterStep;
