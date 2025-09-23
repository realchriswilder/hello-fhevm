import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, Shield, ScrollText, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const ContractOverviewStep: React.FC = () => {
  const { setCurrentStep, completeStep } = useTutorialStore();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);

  const handleContinue = () => {
    completeStep('contract-overview');
    setCurrentStep('deploy-test-counter');
    navigate('/step/deploy-test-counter');
  };

  const openSolidityFile = () => {
    window.open('https://github.com/realchriswilder/hello-fhevm/blob/main/vote-app/contracts/SimpleVoting.sol', '_blank');
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Contract explanations for the voting contract
  const contractExplanations = [
    {
      line: 1,
      text: "Import FHE types and operations from Zama's library",
      highlight: "bg-green-100 dark:bg-green-900/30"
    },
    {
      line: 2,
      text: "Import Sepolia network configuration for FHEVM",
      highlight: "bg-green-100 dark:bg-green-900/30"
    },
    {
      line: 5,
      text: "Contract inherits from SepoliaConfig (required for FHEVM)",
      highlight: "bg-yellow-100 dark:bg-yellow-900/30"
    },
    {
      line: 8,
      text: "Store encrypted Yes vote count",
      highlight: "bg-red-100 dark:bg-red-900/30"
    },
    {
      line: 9,
      text: "Store encrypted No vote count",
      highlight: "bg-red-100 dark:bg-red-900/30"
    },
    {
      line: 12,
      text: "Store decrypted Yes count (after reveal)",
      highlight: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      line: 13,
      text: "Store decrypted No count (after reveal)",
      highlight: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      line: 20,
      text: "Convert external encrypted input to internal euint8",
      highlight: "bg-orange-100 dark:bg-orange-900/30"
    },
    {
      line: 21,
      text: "Create encrypted constant 1",
      highlight: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
      line: 22,
      text: "Create encrypted constant 0",
      highlight: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
      line: 23,
      text: "Check if vote equals 1 (encrypted comparison)",
      highlight: "bg-cyan-100 dark:bg-cyan-900/30"
    },
    {
      line: 25,
      text: "Add 1 to Yes count if vote is Yes, 0 otherwise",
      highlight: "bg-pink-100 dark:bg-pink-900/30"
    },
    {
      line: 26,
      text: "Add 1 to No count if vote is No, 0 otherwise",
      highlight: "bg-pink-100 dark:bg-pink-900/30"
    },
    {
      line: 28,
      text: "FHE.allowThis() - grants the contract permission to decrypt the encrypted value stored in yesVotes",
      highlight: "bg-rose-100 dark:bg-rose-900/30"
    },
    {
      line: 29,
      text: "FHE.allowThis() - grants the contract permission to decrypt the encrypted value stored in noVotes",
      highlight: "bg-rose-100 dark:bg-rose-900/30"
    },
    {
      line: 35,
      text: "Convert encrypted Yes count to bytes32 for decryption",
      highlight: "bg-indigo-100 dark:bg-indigo-900/30"
    },
    {
      line: 36,
      text: "Convert encrypted No count to bytes32 for decryption",
      highlight: "bg-indigo-100 dark:bg-indigo-900/30"
    },
    {
      line: 37,
      text: "Request decryption of both encrypted counts",
      highlight: "bg-violet-100 dark:bg-violet-900/30"
    },
    {
      line: 42,
      text: "Verify decryption signatures are valid",
      highlight: "bg-emerald-100 dark:bg-emerald-900/30"
    },
    {
      line: 45,
      text: "Store the decrypted Yes count",
      highlight: "bg-teal-100 dark:bg-teal-900/30"
    },
    {
      line: 46,
      text: "Store the decrypted No count",
      highlight: "bg-teal-100 dark:bg-teal-900/30"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <Badge variant="secondary"><ScrollText className="h-3 w-3" /> Step 6 of 10</Badge>
        <h1 className="font-display text-3xl font-bold">Voting Contract Overview</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          In this section, we'll walk together through the entire <em>SimpleVoting</em> contract, line by line.
          We'll explain each choice in plain language and show the FHE pattern behind it.
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Quick Links */}
        <Card className="tutorial-step">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> Resources & Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={openSolidityFile}>Open SimpleVoting.sol</Button>
              <Button size="sm" variant="outline" asChild>
                <a href="https://docs.zama.ai" target="_blank" rel="noreferrer">Zama FHEVM Docs</a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="https://docs.zama.ai/protocol/relayer-sdk-guides/fhevm-relayer/decryption" target="_blank" rel="noreferrer">Decryption & Callbacks</a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="https://docs.zama.ai/" target="_blank" rel="noreferrer">FHEVM Documentation</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 1. Imports & Types */}
        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center flex-shrink-0">1</span>
              <span className="text-sm sm:text-base leading-tight">Step 1 — Imports & Types (what we're using and why)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
                className="w-full sm:w-auto"
              >
                {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-2">{showExplanations ? 'Hide' : 'Show'} Line Explanations</span>
              </Button>
            </div>
            <div className="relative">
              <div className="code-block">
                <pre className="text-sm overflow-x-auto"><code>{`import { FHE, externalEuint8, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";`}</code></pre>
              </div>
              <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(`import { FHE, externalEuint8, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";\nimport { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";`, 'imports')}>
                {copiedId === 'imports' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {showExplanations && (
              <div className="space-y-2 p-2 sm:p-3 bg-muted/30 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">1</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">import {`{`} FHE, externalEuint8, euint8, ebool {`}`} from "@fhevm/solidity/lib/FHE.sol";</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Import FHE types and operations from Zama's library</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">2</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">import {`{`} SepoliaConfig {`}`} from "@fhevm/solidity/config/ZamaConfig.sol";</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Import Sepolia network configuration for FHEVM</p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              We start by importing FHE types and helpers. We choose <code>euint8</code> on purpose: our votes are just
              <strong> 0 (No)</strong> or <strong>1 (Yes)</strong>, so an 8‑bit encrypted integer is cheaper than wider types.
              The helpers you'll see throughout the contract are the standard FHEVM building blocks:
              <code>fromExternal</code> to ingest user ciphertexts, <code>add</code>/<code>eq</code>/<code>select</code> for
              computation without branches, <code>allowThis</code> to authorize later decryption requests, and
              <code>requestDecryption</code>/<code>checkSignatures</code> for the reveal ceremony. <code>SepoliaConfig</code>
              simply wires the network keys.
            </p>
          </CardContent>
        </Card>

        {/* 2. State */}
        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center flex-shrink-0">2</span>
              <span className="text-sm sm:text-base leading-tight">Step 2 — State: Encrypted Tallies (Yes / No)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
                className="w-full sm:w-auto"
              >
                {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-2">{showExplanations ? 'Hide' : 'Show'} Line Explanations</span>
              </Button>
            </div>
            <div className="relative">
              <div className="code-block">
                <pre className="text-sm overflow-x-auto"><code>{`struct Session {
    address creator;
    uint256 endTime;
    bool resolved;
    euint8 yesVotes;
    euint8 noVotes;
    uint8 revealedYes;
    uint8 revealedNo;
    uint256 decryptionRequestId;
}`}</code></pre>
              </div>
              <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(`struct Session {\n    address creator;\n    uint256 endTime;\n    bool resolved;\n    euint8 yesVotes;\n    euint8 noVotes;\n    uint8 revealedYes;\n    uint8 revealedNo;\n    uint256 decryptionRequestId;\n}`, 'state')}>
                {copiedId === 'state' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {showExplanations && (
              <div className="space-y-2 p-2 sm:p-3 bg-muted/30 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">1</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">struct Session {`{`}</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Define a Session structure to hold voting data</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">2</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">address creator;</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Who created this voting session</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">3</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">uint256 endTime;</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">When voting ends (timestamp)</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">4</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">bool resolved;</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Whether results have been revealed</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">5</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">euint8 yesVotes;</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Encrypted count of Yes votes</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">6</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">euint8 noVotes;</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Encrypted count of No votes</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">7</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">uint8 revealedYes;</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Decrypted Yes count (after reveal)</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">8</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">uint8 revealedNo;</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Decrypted No count (after reveal)</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border-l-4 border-purple-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">9</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">uint256 decryptionRequestId;</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">ID for tracking decryption request</p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Here we define a single <code>Session</code>. The important bit is that the tallies live as
              <code>euint8</code> so all counting happens on encrypted data. The plain <code>uint8</code> fields stay zero
              until the oracle callback sets the final results.
            </p>
          </CardContent>
        </Card>

        {/* 3. createVotingSession */}
        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center flex-shrink-0">3</span>
              <span className="text-sm sm:text-base leading-tight">Step 3 — createSession(durationSeconds): starting a vote</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
                className="w-full sm:w-auto"
              >
                {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-2">{showExplanations ? 'Hide' : 'Show'} Line Explanations</span>
              </Button>
            </div>
            <div className="relative">
              <div className="code-block">
                <pre className="text-sm overflow-x-auto"><code>{`Session memory s = Session({
    creator: msg.sender,
    endTime: block.timestamp + durationSeconds,
    resolved: false,
    yesVotes: FHE.asEuint8(0),
    noVotes: FHE.asEuint8(0),
    revealedYes: 0,
    revealedNo: 0,
    decryptionRequestId: 0
});`}</code></pre>
              </div>
              <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(`Session memory s = Session({\n    creator: msg.sender,\n    endTime: block.timestamp + durationSeconds,\n    resolved: false,\n    yesVotes: FHE.asEuint8(0),\n    noVotes: FHE.asEuint8(0),\n    revealedYes: 0,\n    revealedNo: 0,\n    decryptionRequestId: 0\n});`, 'create')}>
                {copiedId === 'create' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {showExplanations && (
              <div className="space-y-2 p-2 sm:p-3 bg-muted/30 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">1</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">Session memory s = Session({`{`}</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Create a new Session in memory</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">2</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">creator: msg.sender,</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Set creator to the function caller</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">3</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">endTime: block.timestamp + durationSeconds,</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Calculate when voting ends</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">4</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">resolved: false,</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Start as unresolved (no results yet)</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">5</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">yesVotes: FHE.asEuint8(0),</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Initialize encrypted Yes count to zero</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">6</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">noVotes: FHE.asEuint8(0),</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Initialize encrypted No count to zero</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">7</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">revealedYes: 0,</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Start with zero revealed Yes count</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">8</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">revealedNo: 0,</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Start with zero revealed No count</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border-l-4 border-purple-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">9</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">decryptionRequestId: 0</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">No decryption request yet</p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              We initialize the session and set both encrypted counters to zero using <code>asEuint8(0)</code>. This ensures
              the first homomorphic add starts from a valid encrypted zero.
            </p>
          </CardContent>
        </Card>

        {/* 4. vote */}
        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center flex-shrink-0">4</span>
              <span className="text-sm sm:text-base leading-tight">Step 4 — vote(sessionId, externalEuint8, proof): counting on ciphertexts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
                className="w-full sm:w-auto"
              >
                {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-2">{showExplanations ? 'Hide' : 'Show'} Line Explanations</span>
              </Button>
            </div>
            <div className="relative">
              <div className="code-block">
                <pre className="text-sm overflow-x-auto"><code>{`euint8 v = FHE.fromExternal(encryptedVote, proof); // 0 or 1
euint8 one = FHE.asEuint8(1);
euint8 zero = FHE.asEuint8(0);
ebool isYes = FHE.eq(v, one);

session.yesVotes = FHE.add(session.yesVotes, FHE.select(isYes, one, zero));
session.noVotes = FHE.add(session.noVotes, FHE.select(isYes, zero, one));

FHE.allowThis(session.yesVotes);
FHE.allowThis(session.noVotes);`}</code></pre>
              </div>
              <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(`euint8 v = FHE.fromExternal(encryptedVote, proof); // 0 or 1\neuint8 one = FHE.asEuint8(1);\neuint8 zero = FHE.asEuint8(0);\nebool isYes = FHE.eq(v, one);\n\nsession.yesVotes = FHE.add(session.yesVotes, FHE.select(isYes, one, zero));\nsession.noVotes = FHE.add(session.noVotes, FHE.select(isYes, zero, one));\n\nFHE.allowThis(session.yesVotes);\nFHE.allowThis(session.noVotes);`, 'vote')}>
                {copiedId === 'vote' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {showExplanations && (
              <div className="space-y-2 p-2 sm:p-3 bg-muted/30 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border-l-4 border-orange-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">1</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">euint8 v = FHE.fromExternal(encryptedVote, proof);</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Convert external encrypted input to internal euint8</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border-l-4 border-purple-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">2</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">euint8 one = FHE.asEuint8(1);</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Create encrypted constant 1</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border-l-4 border-purple-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">3</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">euint8 zero = FHE.asEuint8(0);</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Create encrypted constant 0</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded border-l-4 border-cyan-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">4</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">ebool isYes = FHE.eq(v, one);</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Check if vote equals 1 (encrypted comparison)</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-pink-50 dark:bg-pink-900/20 rounded border-l-4 border-pink-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">6</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">session.yesVotes = FHE.add(session.yesVotes, FHE.select(isYes, one, zero));</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Add 1 to Yes count if vote is Yes, 0 otherwise</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-pink-50 dark:bg-pink-900/20 rounded border-l-4 border-pink-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">7</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">session.noVotes = FHE.add(session.noVotes, FHE.select(isYes, zero, one));</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Add 1 to No count if vote is No, 0 otherwise</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-rose-50 dark:bg-rose-900/20 rounded border-l-4 border-rose-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">9</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">FHE.allowThis(session.yesVotes);</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">FHE.allowThis() - grants the contract permission to decrypt the encrypted value stored in yesVotes</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-rose-50 dark:bg-rose-900/20 rounded border-l-4 border-rose-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">10</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">FHE.allowThis(session.noVotes);</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">FHE.allowThis() - grants the contract permission to decrypt the encrypted value stored in noVotes</p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              You send an encrypted 0/1 and a proof. We convert it with <code>fromExternal</code>, then use
              <code>eq</code> + <code>select</code> to update the correct counter without branching. At no point do we see a
              plaintext vote on-chain.
            </p>
          </CardContent>
        </Card>

        {/* Compact Function Table */}
        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center flex-shrink-0">T</span>
              <span className="text-sm sm:text-base leading-tight">Function Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-5 gap-2 font-semibold">
                <div>Function</div>
                <div>Params</div>
                <div>Encrypted?</div>
                <div>Key FHE calls</div>
                <div>Notes</div>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-2">
                <div>createSession</div>
                <div>durationSeconds</div>
                <div>—</div>
                <div>FHE.asEuint8</div>
                <div>Init encrypted tallies</div>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-1">
                <div>vote</div>
                <div>sessionId, externalEuint8, proof</div>
                <div>Yes</div>
                <div>FHE.fromExternal, FHE.eq, FHE.select, FHE.add, FHE.allowThis</div>
                <div>No plaintext branching</div>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-1">
                <div>requestTallyReveal</div>
                <div>sessionId</div>
                <div>Tallies only</div>
                <div>FHE.toBytes32, FHE.requestDecryption</div>
                <div>Aggregates, not individuals</div>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-1">
                <div>resolveTallyCallback</div>
                <div>requestId, signatures, revealedYes, revealedNo</div>
                <div>—</div>
                <div>FHE.checkSignatures</div>
                <div>Authenticated callback</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. requestTallyReveal */}
        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center flex-shrink-0">5</span>
              <span className="text-sm sm:text-base leading-tight">Step 5 — requestTallyReveal(sessionId): asking the network to decrypt totals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
                className="w-full sm:w-auto"
              >
                {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-2">{showExplanations ? 'Hide' : 'Show'} Line Explanations</span>
              </Button>
            </div>
            <div className="relative">
              <div className="code-block">
                <pre className="text-sm overflow-x-auto"><code>{`bytes32[] memory cts = new bytes32[](2);
 cts[0] = FHE.toBytes32(session.yesVotes);
 cts[1] = FHE.toBytes32(session.noVotes);
 uint256 requestId = FHE.requestDecryption(cts, this.resolveTallyCallback.selector);`}</code></pre>
              </div>
              <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(`bytes32[] memory cts = new bytes32[](2);\ncts[0] = FHE.toBytes32(session.yesVotes);\ncts[1] = FHE.toBytes32(session.noVotes);\nuint256 requestId = FHE.requestDecryption(cts, this.resolveTallyCallback.selector);`, 'reveal')}>
                {copiedId === 'reveal' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {showExplanations && (
              <div className="space-y-2 p-2 sm:p-3 bg-muted/30 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">1</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">bytes32[] memory cts = new bytes32[](2);</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Create array to hold encrypted vote counts</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">2</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">cts[0] = FHE.toBytes32(session.yesVotes);</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Convert encrypted Yes count to bytes32 format</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">3</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">cts[1] = FHE.toBytes32(session.noVotes);</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Convert encrypted No count to bytes32 format</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">4</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">uint256 requestId = FHE.requestDecryption(cts, this.resolveTallyCallback.selector);</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Request network to decrypt the vote counts and call our callback</p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              We only ever request decryption of the two aggregate tallies. The network collects signatures and later calls
              our contract's callback with the clear totals.
            </p>
          </CardContent>
        </Card>

        {/* 6. resolveTallyCallback */}
        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center flex-shrink-0">6</span>
              <span className="text-sm sm:text-base leading-tight">Step 6 — resolveTallyCallback(...): verifying and writing the result</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
                className="w-full sm:w-auto"
              >
                {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-2">{showExplanations ? 'Hide' : 'Show'} Line Explanations</span>
              </Button>
            </div>
            <div className="relative">
              <div className="code-block">
                <pre className="text-sm overflow-x-auto"><code>{`FHE.checkSignatures(requestId, signatures);
 uint256 sessionId = sessionIdByRequestId[requestId];
 Session storage s = sessions[sessionId];
 s.revealedYes = revealedYes;
 s.revealedNo = revealedNo;
 s.resolved = true;`}</code></pre>
              </div>
              <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(`FHE.checkSignatures(requestId, signatures);\nuint256 sessionId = sessionIdByRequestId[requestId];\nSession storage s = sessions[sessionId];\ns.revealedYes = revealedYes;\ns.revealedNo = revealedNo;\ns.resolved = true;`, 'callback')}>
                {copiedId === 'callback' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {showExplanations && (
              <div className="space-y-2 p-2 sm:p-3 bg-muted/30 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border-l-4 border-orange-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">1</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">FHE.checkSignatures(requestId, signatures);</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Verify that the decryption request is legitimate</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">2</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">uint256 sessionId = sessionIdByRequestId[requestId];</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Get the session ID from the decryption request</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">3</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">Session storage s = sessions[sessionId];</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Get reference to the session in storage</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">4</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">s.revealedYes = revealedYes;</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Store the decrypted Yes count</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">5</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">s.revealedNo = revealedNo;</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Store the decrypted No count</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border-l-4 border-purple-500">
                  <span className="text-muted-foreground w-5 text-right text-xs sm:text-sm font-mono flex-shrink-0">6</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-blue-600 font-mono text-xs sm:text-sm break-all">s.resolved = true;</code>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Mark the session as resolved</p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              We first verify signatures with <code>checkSignatures</code>, then persist the clear tallies and mark the
              session resolved. Only totals are revealed; individual votes remain secret forever.
            </p>

            {/* 7. Wrap‑up */}
            <Card className="tutorial-step">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center flex-shrink-0">7</span>
                  <span className="text-sm sm:text-base leading-tight">Pattern Recap — Why this contract fits FHE best‑practices</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Binary decisions use <code>euint8</code> to minimize costs.</li>
                  <li>All updates are homomorphic (<code>add</code>, <code>select</code>) with no plaintext branching.</li>
                  <li>Access is explicit: we call <code>allowThis</code> only for values we may later reveal.</li>
                  <li>Reveals target aggregates only; individuals remain encrypted.</li>
                  <li>Oracle callback is authenticated with <code>checkSignatures</code> before mutating state.</li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button onClick={handleContinue} size="lg" className="gap-2">
          Continue to Testing Playground <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ContractOverviewStep;


