import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Check,
  Zap,
  Shield,
  ArrowRight,
  Plus,
  Info,
  Lock,
  Key,
  Globe,
  Coins,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Settings
} from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useWalletStore } from '@/state/walletStore';
import { SEPOLIA_TESTNET } from '@/lib/contracts/types';
import { useNavigate } from 'react-router-dom';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  chainName: string;
}

export const ConnectWalletStep: React.FC = () => {
  const { setCurrentStep, completeStep } = useTutorialStore();
  const navigate = useNavigate();
  
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showSecurityTips, setShowSecurityTips] = useState(false);
  const [showTestnetInfo, setShowTestnetInfo] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Wagmi state
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [showGuardrail, setShowGuardrail] = useState(true);

  // Sync Wagmi state to local UI model
  useEffect(() => {
    if (isConnected && address) {
      setWalletInfo({
        address,
        balance: 'Connected',
        chainId: chainId || 0,
        chainName: SEPOLIA_TESTNET.name,
      });
    } else {
      setWalletInfo(null);
    }
  }, [isConnected, address, chainId]);

  const switchToSepolia = async () => {
    try {
      switchChain?.({ chainId: SEPOLIA_TESTNET.chainId });
    } catch (error: any) {
      console.error('Network switch failed:', error);
      setConnectionError('Failed to switch network. Please try manually.');
    }
  };

  const addSepoliaNetwork = async () => {
    try {
      console.log('➕ Adding Sepolia Testnet to wallet...');
      
      // In real implementation, this would add the network
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${SEPOLIA_TESTNET.chainId.toString(16)}`,
            chainName: SEPOLIA_TESTNET.name,
            rpcUrls: [SEPOLIA_TESTNET.rpcUrl],
            nativeCurrency: SEPOLIA_TESTNET.currency,
            blockExplorerUrls: SEPOLIA_TESTNET.blockExplorer ? [SEPOLIA_TESTNET.blockExplorer] : undefined,
          }]
        });
      }
      
    } catch (error: any) {
      console.error('Failed to add network:', error);
    }
  };

  const copyAddress = async () => {
    if (walletInfo?.address) {
      try {
        await navigator.clipboard.writeText(walletInfo.address);
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const handleContinue = () => {
    completeStep('connect-wallet');
    setCurrentStep('fhe-basics');
    navigate('/step/fhe-basics');
  };

  const isCorrectNetwork = walletInfo?.chainId === SEPOLIA_TESTNET.chainId;
  const canContinue = walletInfo && isCorrectNetwork;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const securityTips = [
    {
      icon: Lock,
      title: "Never share your private key",
      description: "Your private key is like a password - never share it with anyone or enter it on suspicious websites."
    },
    {
      icon: Shield,
      title: "Verify website URLs",
      description: "Always check the URL bar to ensure you're on the correct website before connecting your wallet."
    },
    {
      icon: Key,
      title: "Use hardware wallets for large amounts",
      description: "For significant funds, consider using a hardware wallet like Ledger or Trezor for extra security."
    },
    {
      icon: AlertTriangle,
      title: "Be cautious with permissions",
      description: "Only grant necessary permissions to dApps. Revoke access when no longer needed."
    }
  ];

  const testnetInfo = [
    {
      icon: Globe,
      title: "Sepolia Testnet",
      description: "Ethereum's official testnet for development and testing. Safe to use with test tokens only.",
      details: "Chain ID: 11155111, Currency: SepoliaETH"
    },
    {
      icon: Coins,
      title: "Test Tokens",
      description: "Get free test tokens from faucets. These have no real value and are for testing only.",
      faucets: [
        "Sepolia Faucet: faucet.sepolia.dev",
        "Alchemy Faucet: sepoliafaucet.com"
      ]
    },
    {
      icon: Settings,
      title: "Network Configuration",
      description: "Add Sepolia to your wallet with the correct RPC URL and block explorer.",
      rpcUrl: "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
      explorer: "https://sepolia.etherscan.io"
    }
  ];

  const troubleshooting = [
    {
      issue: "Wallet not detected",
      symptoms: "Connect button doesn't appear or shows 'No wallet found'",
      solutions: [
        "Install MetaMask browser extension",
        "Refresh the page after installation",
        "Check if MetaMask is unlocked",
        "Try a different browser (Chrome/Firefox recommended)"
      ],
      prevention: "Always install MetaMask from the official website"
    },
    {
      issue: "Connection failed",
      symptoms: "Wallet connects but immediately disconnects",
      solutions: [
        "Check your internet connection",
        "Clear browser cache and cookies",
        "Disable browser extensions temporarily",
        "Try incognito/private mode"
      ],
      prevention: "Keep your browser and MetaMask updated"
    },
    {
      issue: "Wrong network",
      symptoms: "Connected but on wrong blockchain network",
      solutions: [
        "Click 'Switch to Sepolia' button",
        "Add Sepolia network manually",
        "Check network settings in MetaMask",
        "Refresh page after switching"
      ],
      prevention: "Always verify you're on the correct network"
    },
    {
      issue: "Transaction failed",
      symptoms: "Transactions revert or fail to execute",
      solutions: [
        "Check you have enough test ETH for gas",
        "Increase gas limit in MetaMask",
        "Wait for network congestion to clear",
        "Try again with higher gas price"
      ],
      prevention: "Keep some test ETH for transaction fees"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <Badge variant="secondary" className="gap-2">
          <Wallet className="h-3 w-3" />
          Step 3 of 10
        </Badge>
        <h1 className="font-display text-3xl font-bold">Connect Your Wallet</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect your wallet and switch to the Sepolia Testnet. Zama FHEVM is currently available on Sepolia.
        </p>
      </motion.div>

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Beginner Guardrail Banner */}
        {showGuardrail && (
          <Card className="mb-3 border-yellow-400/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" /> Beginner guardrail
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              {!walletInfo && (
                <div className="space-y-2">
                  <p className="text-muted-foreground">No wallet connected. Install or open MetaMask and click Connect.</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <a href="https://metamask.io" target="_blank" rel="noreferrer">Install MetaMask</a>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowGuardrail(false)}>Hide</Button>
                  </div>
                </div>
              )}
              {walletInfo && !isCorrectNetwork && (
                <div className="space-y-2">
                  <p className="text-muted-foreground">Wrong network detected. Switch or add Sepolia.</p>
                  <div className="flex gap-2">
                    <Button onClick={switchToSepolia} disabled={isSwitching} size="sm" className="gap-2">
                      <Zap className="h-3 w-3" /> {isSwitching ? 'Switching…' : 'Switch to Sepolia'}
                    </Button>
                    <Button variant="outline" onClick={addSepoliaNetwork} size="sm" className="gap-2">
                      <Plus className="h-3 w-3" /> Add Sepolia
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowGuardrail(false)}>Hide</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Wallet Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!walletInfo ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">No Wallet Connected</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to continue with the tutorial
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                          Real Wallet Required for Voting
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Step 9 (Private Voting Demo) requires a real wallet connection to interact with the FHEVM voting contract on Sepolia testnet. You'll need to sign transactions to cast encrypted votes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
                
                {connectionError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{connectionError}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Wallet Info */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-success-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Wallet Connected</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatAddress(walletInfo.address)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAddress}
                  >
                    {copiedAddress ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                {/* Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-background rounded-lg border">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-semibold text-sm text-green-600">{walletInfo.balance}</p>
                  </div>
                  <div className="p-2 bg-background rounded-lg border">
                    <p className="text-xs text-muted-foreground">Network</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        isCorrectNetwork ? 'bg-success animate-pulse' : 'bg-destructive'
                      }`} />
                      <p className="font-semibold text-xs">{walletInfo.chainName}</p>
                    </div>
                  </div>
                </div>

                {/* Voting Requirement Info */}
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-green-900 dark:text-green-100">
                        Ready for Real Voting
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Your wallet is connected and ready for Step 9 (Private Voting Demo). You'll be able to cast encrypted votes on the FHEVM voting contract.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Network Configuration */}
      {walletInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="tutorial-step">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Network Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCorrectNetwork ? (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Wrong network detected. Please switch to Sepolia Testnet to continue.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-2">
                    <Button onClick={switchToSepolia} disabled={isSwitching} className="gap-2">
                      <Zap className="h-4 w-4" />
                      {isSwitching ? 'Switching...' : 'Switch to Sepolia'}
                    </Button>
                    <Button variant="outline" onClick={addSepoliaNetwork} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Sepolia
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className="border-success/50 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ Connected to Sepolia successfully!
                    </AlertDescription>
                  </Alert>
                  
                  {/* Network Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p><strong>Chain ID:</strong> {SEPOLIA_TESTNET.chainId}</p>
                      <p><strong>Currency:</strong> {SEPOLIA_TESTNET.currency.symbol}</p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>RPC URL:</strong> {SEPOLIA_TESTNET.rpcUrl}</p>
                      {SEPOLIA_TESTNET.blockExplorer && (
                        <p className="flex items-center gap-1">
                          <strong>Explorer:</strong>
                          <a 
                            href={SEPOLIA_TESTNET.blockExplorer} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline hover:text-primary"
                          >
                            View
                            <ExternalLink className="h-3 w-3 ml-1 inline" />
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Wallet Security Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Wallet Security Tips</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSecurityTips(!showSecurityTips)}
          >
            {showSecurityTips ? 'Hide' : 'Show'} Tips
          </Button>
        </div>
        
        <AnimatePresence>
          {showSecurityTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid md:grid-cols-2 gap-3"
            >
              {securityTips.map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="tutorial-step border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <tip.icon className="h-3 w-3 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-sm">{tip.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {tip.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Testnet Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Sepolia Testnet Info</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTestnetInfo(!showTestnetInfo)}
          >
            {showTestnetInfo ? 'Hide' : 'Show'} Details
          </Button>
        </div>
        
        <AnimatePresence>
          {showTestnetInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {testnetInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="tutorial-step">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <info.icon className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">{info.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                      {info.details && (
                        <div className="bg-muted/50 rounded p-2">
                          <p className="text-xs font-mono">{info.details}</p>
                        </div>
                      )}
                      {info.faucets && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold">Faucets:</p>
                          <ul className="space-y-1">
                            {info.faucets.map((faucet, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground">
                                • {faucet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {info.rpcUrl && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold">RPC URL:</p>
                          <p className="text-xs font-mono bg-muted/50 rounded p-1">{info.rpcUrl}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Comprehensive Troubleshooting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Troubleshooting Guide</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
          >
            {showTroubleshooting ? 'Hide' : 'Show'} Troubleshooting
          </Button>
        </div>
        
        <AnimatePresence>
          {showTroubleshooting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {troubleshooting.map((item, index) => (
                <motion.div
                  key={item.issue}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="tutorial-step">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-2">
                        <HelpCircle className="h-4 w-4 text-destructive mt-0.5" />
                        <div>
                          <CardTitle className="text-sm text-destructive">{item.issue}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">{item.symptoms}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h4 className="font-semibold text-xs mb-1">Solutions:</h4>
                        <ul className="space-y-1">
                          {item.solutions.map((solution, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs">
                              <ArrowRight className="h-2 w-2 text-primary mt-1.5 flex-shrink-0" />
                              <span>{solution}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-success/10 border border-success/20 rounded p-2">
                        <p className="text-xs text-success">
                          <Shield className="h-3 w-3 inline mr-1" />
                          <strong>Prevention:</strong> {item.prevention}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Continue Button */}
      <AnimatePresence>
        {canContinue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <Button onClick={handleContinue} size="lg" className="gap-2">
              Continue to FHE Basics
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Great! You're ready to learn about encryption.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};