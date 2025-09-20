import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check,
  Terminal,
  Download,
  Settings,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Info,
  Lightbulb,
  Shield,
  Zap,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';

interface EnvironmentCheck {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  command?: string;
  version?: string;
  errorMessage?: string;
}

export const EnvironmentSetupStep: React.FC = () => {
  const { setCurrentStep, completeStep } = useTutorialStore();
  const navigate = useNavigate();
  const [compatCheck, setCompatCheck] = useState<null | { ok: boolean; message: string }>(null);
  const [checks, setChecks] = useState<EnvironmentCheck[]>([
    {
      id: 'node',
      name: 'Node.js',
      description: 'JavaScript runtime (v18+ required)',
      status: 'pending',
      command: 'node --version'
    },
    {
      id: 'npm',
      name: 'npm/pnpm',
      description: 'Package manager',
      status: 'pending',
      command: 'npm --version'
    },
    {
      id: 'wallet',
      name: 'MetaMask Extension',
      description: 'Browser wallet extension (checked in Step 3)',
      status: 'pending'
    },
    {
      id: 'env',
      name: 'Environment Variables',
      description: 'Project configuration',
      status: 'pending'
    }
  ]);

  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [currentStep, setCurrentStepLocal] = useState(0);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const troubleshooting = [
    {
      issue: "Node.js version error",
      symptoms: "Command not found or version too old",
      solutions: [
        "Update Node.js: Visit nodejs.org and download LTS version",
        "Use nvm: `nvm install 18 && nvm use 18`",
        "Check PATH: Ensure Node.js is in your system PATH"
      ],
      prevention: "Always use LTS versions for stability"
    },
    {
      issue: "Package installation fails",
      symptoms: "npm/pnpm install errors or timeouts",
      solutions: [
        "Clear cache: `npm cache clean --force` or `pnpm store prune`",
        "Delete node_modules: `rm -rf node_modules package-lock.json`",
        "Use different registry: `npm config set registry https://registry.npmjs.org/`",
        "Check network: Ensure stable internet connection"
      ],
      prevention: "Use pnpm for faster, more reliable installs"
    },
    {
      issue: "MetaMask not detected",
      symptoms: "Wallet connection fails",
      solutions: [
        "Install MetaMask: Visit metamask.io and install extension",
        "Enable site access: Click MetaMask icon and allow this site",
        "Check network: Ensure you're on Sepolia testnet",
        "Refresh page: Hard refresh (Ctrl+F5) after installing"
      ],
      prevention: "Always install MetaMask before starting tutorial"
    },
    {
      issue: "Environment variables missing",
      symptoms: "Configuration errors or undefined variables",
      solutions: [
        "Copy .env.example: `cp .env.example .env`",
        "Add API keys: Get keys from Infura, Alchemy, or Etherscan",
        "Check format: Ensure no spaces around = sign",
        "Restart dev server: Stop and restart after changes"
      ],
      prevention: "Always copy .env.example and fill in real values"
    },
    {
      issue: "FHEVM initialization fails",
      symptoms: "SDK loading errors or WASM issues",
      solutions: [
        "Check browser: Use Chrome/Firefox (Safari has limitations)",
        "Enable COOP/COEP: Add headers for WASM support",
        "Clear browser cache: Hard refresh and clear site data",
        "Check console: Look for specific error messages"
      ],
      prevention: "Use modern browsers with WASM support"
    }
  ];

  const proTips = [
    {
      icon: Lightbulb,
      title: "Use pnpm for faster installs",
      description: "pnpm is 2-3x faster than npm and uses less disk space. It's perfect for FHEVM projects with many dependencies."
    },
    {
      icon: Shield,
      title: "Keep your .env secure",
      description: "Never commit .env files to git. Use .env.example for templates and add .env to .gitignore."
    },
    {
      icon: Zap,
      title: "Use VS Code for better development",
      description: "Install Solidity, TypeScript, and FHEVM extensions for syntax highlighting and IntelliSense support."
    },
    {
      icon: BookOpen,
      title: "Bookmark the documentation",
      description: "Keep the FHEVM docs open: docs.zama.ai. It's your best reference for API details and examples."
    }
  ];

  const commands = [
    {
      title: "Install Node.js (if not installed)",
      description: "Download and install Node.js v18 or higher",
      command: "# Visit nodejs.org and download the LTS version\n# Or use nvm:\ncurl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash\nnvm install 18\nnvm use 18",
      url: "https://nodejs.org/"
    },
    {
      title: "Install pnpm (recommended)",
      description: "Fast, disk space efficient package manager",
      command: "npm install -g pnpm",
    },
    {
      title: "Install project dependencies",
      description: "From the project root",
      command: "pnpm i"
    },
    {
      title: "Set up environment variables",
      description: "Copy and configure environment settings",
      command: "cp .env.example .env"
    }
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(text);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const runEnvironmentChecks = async () => {
    const newChecks = [...checks];
    
    // Check Node.js
    setChecks(prev => prev.map(check => 
      check.id === 'node' ? { ...check, status: 'checking' } : check
    ));
    
    try {
      // In a real app, you'd make actual system calls
      // For this tutorial, we'll simulate the checks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const hasNode = typeof window !== 'undefined';
      newChecks[0] = {
        ...newChecks[0],
        status: hasNode ? 'success' : 'error',
        version: hasNode ? 'v18.17.0' : undefined,
        errorMessage: hasNode ? undefined : 'Node.js not detected'
      };
      setChecks([...newChecks]);

      // Check npm/pnpm
      setChecks(prev => prev.map(check => 
        check.id === 'npm' ? { ...check, status: 'checking' } : check
      ));
      
      await new Promise(resolve => setTimeout(resolve, 800));
      newChecks[1] = {
        ...newChecks[1],
        status: 'success',
        version: '9.8.1'
      };
      setChecks([...newChecks]);

      // Check MetaMask (always pass - Step 3 will handle actual connection)
      setChecks(prev => prev.map(check => 
        check.id === 'wallet' ? { ...check, status: 'checking' } : check
      ));
      
      await new Promise(resolve => setTimeout(resolve, 600));
      newChecks[2] = {
        ...newChecks[2],
        status: 'success',
        version: 'Will be checked in Step 3'
      };
      setChecks([...newChecks]);

      // Check environment
      setChecks(prev => prev.map(check => 
        check.id === 'env' ? { ...check, status: 'checking' } : check
      ));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      newChecks[3] = {
        ...newChecks[3],
        status: 'success'
      };
      setChecks([...newChecks]);

    } catch (error) {
      console.error('Environment check failed:', error);
    }
  };

  const handleCompatCheck = async () => {
    // Simulate a quick FHEVM compatibility checklist output
    setCompatCheck(null);
    await new Promise(r => setTimeout(r, 500));
    setCompatCheck({ ok: true, message: 'FHEVM compatibility looks good (contracts use euint8, fromExternal, allowThis, requestDecryption, checkSignatures).' });
  };


  useEffect(() => {
    // Auto-run checks on component mount
    const timer = setTimeout(() => {
      runEnvironmentChecks();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const allChecksComplete = checks.every(check => check.status === 'success');
  const hasErrors = checks.some(check => check.status === 'error');
  const progress = checks.filter(check => check.status === 'success').length / checks.length * 100;

  const handleContinue = () => {
    completeStep('environment-setup');
    setCurrentStep('connect-wallet');
    navigate('/step/connect-wallet');
  };

  const StatusIcon = ({ status }: { status: EnvironmentCheck['status'] }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 animate-spin text-primary" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <Badge variant="secondary" className="gap-2">
          <Settings className="h-3 w-3" />
          Step 2 of 10
        </Badge>
        <h1 className="font-display text-3xl font-bold">Environment Setup</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Let's prepare your development environment for building confidential applications. 
          We'll check your system and install the necessary tools.
        </p>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <div className="flex justify-between text-sm">
          <span>Setup Progress</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </motion.div>

      {/* Environment Checks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="tutorial-step">
          <CardHeader className="flex flex-row items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <CardTitle>System Requirements Check</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={runEnvironmentChecks}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {checks.map((check, index) => (
              <motion.div
                key={check.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-lg border"
              >
                <StatusIcon status={check.status} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{check.name}</h4>
                    {check.version && (
                      <Badge variant="outline" className="text-xs">
                        {check.version}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{check.description}</p>
                  {check.errorMessage && (
                    <p className="text-xs text-destructive mt-1">{check.errorMessage}</p>
                  )}
                </div>
                {check.command && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(check.command!)}
                  >
                    {copiedCommand === check.command ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Installation Commands */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-6"
      >
        <h2 className="font-display text-xl font-semibold">Installation Guide</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {commands.map((cmd, index) => (
            <Card key={index} className="tutorial-step">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">
                        {index + 1}
                      </span>
                      {cmd.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{cmd.description}</p>
                  </div>
                  {cmd.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={cmd.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="code-block">
                    <pre className="text-sm overflow-x-auto">
                      <code>{cmd.command}</code>
                    </pre>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(cmd.command)}
                  >
                    {copiedCommand === cmd.command ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Compatibility & Docs callouts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.52 }}
        className="space-y-3"
      >
        <Card className="tutorial-step">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">FHEVM Compatibility Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Verify your stack uses the core Zama primitives we’ll rely on.</p>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleCompatCheck} className="gap-2">
                <Shield className="h-3 w-3" /> Run Check
              </Button>
              {compatCheck && (
                <span className={`text-xs ${compatCheck.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {compatCheck.message}
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Docs: <a className="underline" href="https://docs.zama.ai/fhevm" target="_blank" rel="noreferrer">FHEVM</a> · <a className="underline" href="https://docs.zama.ai/protocol/relayer-sdk-guides/fhevm-relayer/decryption" target="_blank" rel="noreferrer">Decryption & Callbacks</a>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Start Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <Card className="tutorial-step">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" /> Quick Start Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="bg-muted rounded p-2">
                  <p className="text-xs font-semibold mb-1">0) Clone this repository</p>
                  <pre className="text-xs overflow-x-auto"><code>{`git clone https://github.com/realchriswilder/hello-fhevm.git
cd vote-app`}</code></pre>
                </div>
                <div className="bg-muted rounded p-2">
                  <p className="text-xs font-semibold mb-1">1) Install & setup</p>
                  <pre className="text-xs overflow-x-auto"><code>{`# Node 18+ and pnpm
npm i -g pnpm

# From project root
pnpm i
cp .env.example .env`}</code></pre>
                </div>
                <div className="bg-muted rounded p-2">
                  <p className="text-xs font-semibold mb-1">2) Configure env</p>
                  <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                    <li>Frontend: set VITE_VOTING_CONTRACT_ADDRESS in .env</li>
                    <li>Contracts: set PRIVATE_KEY, INFURA_API_KEY, ETHERSCAN_API_KEY in vote-app/.env</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-muted rounded p-2">
                  <p className="text-xs font-semibold mb-1">3) Compile & deploy (Sepolia)</p>
                  <pre className="text-xs overflow-x-auto"><code>{`cd vote-app
npx hardhat compile
npx hardhat run scripts/deploy.cjs --network sepolia`}</code></pre>
                </div>
                <div className="bg-muted rounded p-2">
                  <p className="text-xs font-semibold mb-1">4) Run app</p>
                  <pre className="text-xs overflow-x-auto"><code>{`cd ..
pnpm dev`}</code></pre>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-muted rounded p-2">
                <p className="text-xs text-muted-foreground">5) Open Step 3 to connect wallet and switch/add Sepolia.</p>
              </div>
              <div className="bg-muted rounded p-2">
                <p className="text-xs text-muted-foreground">6) Use Step 9 to create a session, vote privately, request tally, and view results.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>


      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-6"
      >
        <h2 className="font-display text-xl font-semibold">Pro Tips for FHEVM Development</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {proTips.map((tip, index) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <Card className="tutorial-step border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <tip.icon className="h-4 w-4 text-primary" />
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
        </div>
      </motion.div>

      {/* Troubleshooting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-6"
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
              className="space-y-4"
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

      {/* Status Messages */}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some requirements are not met. Please install the missing components and refresh the checks.
                Need help? Check the{' '}
                <a href="#" className="underline">troubleshooting guide</a>.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {allChecksComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-4"
          >
            <Alert className="border-success/50 text-success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                🎉 Perfect! Your environment is ready for FHEVM development.
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleContinue} size="lg" className="gap-2">
              Continue to Wallet Setup
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};