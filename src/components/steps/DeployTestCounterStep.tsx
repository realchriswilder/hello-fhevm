import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Trash2
} from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';
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
      // Run each test sequentially
      await runTest('Deploy FHECounter Contract', async () => {
        // Deploy logic here
        if (!isConnected) {
          addResult({
            id: `deploy-error-${Date.now()}`,
            name: 'Deploy Contract',
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
            id: `deploy-error-${Date.now()}`,
            name: 'Deploy Contract',
            status: 'error',
            output: '❌ Please switch to Sepolia testnet to deploy the contract.',
            timestamp: new Date().toLocaleTimeString()
          });
          return;
        }

        addResult({
          id: `deploy-${Date.now()}`,
          name: 'Deploy Contract',
          status: 'success',
          output: '🚀 Deploying FHECounter contract to Sepolia testnet...\n⏳ Compiling contract...\n📦 Uploading to network...\n🔐 Requesting wallet signature...',
          timestamp: new Date().toLocaleTimeString()
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

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

        const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
        setContractState({
          deployed: true,
          address: mockAddress,
          count: 0,
          encryptedCount: '0x0000000000000000000000000000000000000000000000000000000000000000'
        });
      });
      
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

        addResult({
          id: `call-increment-${Date.now()}`,
          name: 'Call Increment',
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
          id: `get-count-${Date.now()}`,
          name: 'Get Count',
          status: 'success',
          output: `📞 fheCounterContract.getCount()\n🔢 Encrypted count after increment: ${newEncryptedCount}`,
          timestamp: new Date().toLocaleTimeString()
        });

        await new Promise(resolve => setTimeout(resolve, 800));

        addResult({
          id: `decrypt-${Date.now()}`,
          name: 'Decrypt Count',
          status: 'success',
          output: `🔓 fhevm.userDecryptEuint(FhevmType.euint32, encryptedCountAfterInc, ${contractAddress}, signers.alice)\n🔢 Clear count after increment: ${newCount}`,
          timestamp: new Date().toLocaleTimeString()
        });

        await new Promise(resolve => setTimeout(resolve, 800));
      });
      
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

        addResult({
          id: `increment-first-${Date.now()}`,
          name: 'First Increment',
          status: 'success',
          output: `📞 First increment by 1, count becomes ${currentCount + 1}\n📞 fheCounterContract.connect(signers.alice).increment(encryptedOne.handles[0], encryptedOne.inputProof)\n⏳ await tx.wait()`,
          timestamp: new Date().toLocaleTimeString()
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        const afterIncrement = currentCount + 1;
        setContractState(prev => ({
          ...prev,
          count: afterIncrement,
          encryptedCount: `0x${Math.random().toString(16).substr(2, 64)}`
        }));

        addResult({
          id: `decrement-call-${Date.now()}`,
          name: 'Decrement Call',
          status: 'success',
          output: `📞 Then decrement by 1, count goes back to ${currentCount}\n📞 fheCounterContract.connect(signers.alice).decrement(encryptedOne.handles[0], encryptedOne.inputProof)\n⏳ await tx.wait()`,
          timestamp: new Date().toLocaleTimeString()
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        const newCount = Math.max(afterIncrement - 1, 0);
        const newEncryptedCount = `0x${Math.random().toString(16).substr(2, 64)}`;
        setContractState(prev => ({
          ...prev,
          count: newCount,
          encryptedCount: newEncryptedCount
        }));

        addResult({
          id: `get-count-after-${Date.now()}`,
          name: 'Get Count After',
          status: 'success',
          output: `📞 fheCounterContract.getCount()\n🔢 Encrypted count after decrement: ${newEncryptedCount}`,
          timestamp: new Date().toLocaleTimeString()
        });

        await new Promise(resolve => setTimeout(resolve, 800));

        addResult({
          id: `decrypt-final-${Date.now()}`,
          name: 'Decrypt Final',
          status: 'success',
          output: `🔓 fhevm.userDecryptEuint(FhevmType.euint32, encryptedCountAfterDec, ${contractAddress}, signers.alice)\n🔢 Clear count after decrement: ${newCount}`,
          timestamp: new Date().toLocaleTimeString()
        });

        await new Promise(resolve => setTimeout(resolve, 800));
      });
    } finally {
      setIsRunning(false);
      setRunningSteps(new Set());
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

  const getButtonIcon = (stepName: string) => {
    if (runningSteps.has(stepName)) {
      return <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
    }
    
    // Check if this step has completed successfully
    if (completedSteps.has(stepName)) {
      return <CheckCircle className="h-3 w-3 mr-1 text-green-500" />;
    }
    
    return <Play className="h-3 w-3 mr-1" />;
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
            <h1 className="text-4xl font-bold">Deploy & Test FHE Counter</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simulate deploying the FHE counter contract and interact with it in real-time. 
              Experience how FHE operations work through a realistic simulation.
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
              <h2 className="text-lg font-semibold mb-4">Test Scenarios</h2>
              
              {/* Deploy Contract Scenario */}
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-sm">Deploy Contract</h3>
                      <Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                        beginner
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Deploy FHECounter contract to Sepolia testnet
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">~2s</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={!isConnected ? () => openConnectModal?.() : deployContract}
                        disabled={isRunning || contractState.deployed}
                        className="h-6 px-2 text-xs"
                      >
                        {getButtonIcon('Deploy FHECounter Contract')}
                        {!isConnected ? 'Connect Wallet' : 'Deploy'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Check Initial Count Scenario */}
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-sm">Check Initial Count</h3>
                      <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        beginner
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Verify initial encrypted count is uninitialized
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">~1s</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={testInitialCount}
                        disabled={isRunning || !contractState.deployed || !isConnected}
                        className="h-6 px-2 text-xs"
                      >
                        {getButtonIcon('Check Initial Count')}
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Increment Counter Scenario */}
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-sm">Increment Counter</h3>
                      <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        intermediate
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Encrypt value 1 and call increment function
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">~2s</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={testIncrement}
                        disabled={isRunning || !contractState.deployed || !isConnected}
                        className="h-6 px-2 text-xs"
                      >
                        {getButtonIcon('Increment Counter by 1')}
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Decrement Counter Scenario */}
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-sm">Decrement Counter</h3>
                      <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                        intermediate
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Encrypt value 1 and call decrement function
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">~2s</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={testDecrement}
                        disabled={isRunning || !contractState.deployed || !isConnected}
                        className="h-6 px-2 text-xs"
                      >
                        {getButtonIcon('Decrement Counter by 1')}
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                            <h4 className="font-medium text-sm mb-2 text-foreground">Expected Terminal Output:</h4>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Simulated contract deployment (no real wallet signature needed)</li>
                              <li>fhevm.createEncryptedInput() and .add32() operations</li>
                              <li>fheCounterContract.connect().increment() calls</li>
                              <li>fheCounterContract.getCount() and encrypted count values</li>
                              <li>fhevm.userDecryptEuint() for decryption</li>
                              <li>Counter state changes: 0 → 1 → 0 (increment then decrement)</li>
                              <li>Simulated transaction confirmation and gas usage details</li>
                              <li>Realistic Hardhat test simulation with actual FHEVM logs</li>
                              <li><strong>Note:</strong> This is a simulation - copy FHECounter.sol from Step 5 to deploy real contract on Sepolia</li>
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
