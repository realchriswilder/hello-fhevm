import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, Shield, ScrollText, Copy, Check } from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';

export const ContractOverviewStep: React.FC = () => {
  const { setCurrentStep, completeStep } = useTutorialStore();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleContinue = () => {
    completeStep('contract-overview');
    setCurrentStep('testing-playground');
    navigate('/step/testing-playground');
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <Badge variant="secondary"><ScrollText className="h-3 w-3" /> Step 5 of 8</Badge>
        <h1 className="font-display text-3xl font-bold">Contract Overview</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          In this section, we’ll walk together through the entire <em>SimpleVoting</em> contract, line by line.
          We’ll explain each choice in plain language and show the FHE pattern behind it.
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
                <a href="https://docs.zama.ai/fhevm" target="_blank" rel="noreferrer">Zama FHEVM Docs</a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="https://docs.zama.ai/protocol/relayer-sdk-guides/fhevm-relayer/decryption" target="_blank" rel="noreferrer">Decryption & Callbacks</a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="https://docs.zama.ai/fhevm" target="_blank" rel="noreferrer">FHEVM Documentation</a>
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* 1. Imports & Types */}
        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">1</span>
              Step 1 — Imports & Types (what we’re using and why)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <div className="code-block">
                <pre className="text-sm overflow-x-auto"><code>{`import { FHE, externalEuint8, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";`}</code></pre>
              </div>
              <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(`import { FHE, externalEuint8, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";\nimport { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";`, 'imports')}>
                {copiedId === 'imports' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              We start by importing FHE types and helpers. We choose <code>euint8</code> on purpose: our votes are just
              <strong> 0 (No)</strong> or <strong>1 (Yes)</strong>, so an 8‑bit encrypted integer is cheaper than wider types.
              The helpers you’ll see throughout the contract are the standard FHEVM building blocks:
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
            <CardTitle className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">2</span>
              Step 2 — State: Encrypted Tallies (Yes / No)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
            <CardTitle className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">3</span>
              Step 3 — createSession(durationSeconds): starting a vote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
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
            <p className="text-sm text-muted-foreground">
              We initialize the session and set both encrypted counters to zero using <code>asEuint8(0)</code>. This ensures
              the first homomorphic add starts from a valid encrypted zero.
            </p>
          </CardContent>
        </Card>

        {/* 4. vote */}
        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">4</span>
              Step 4 — vote(sessionId, externalEuint8, proof): counting on ciphertexts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
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
            <CardTitle className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">T</span>
              Function Overview
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
            <CardTitle className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">5</span>
              Step 5 — requestTallyReveal(sessionId): asking the network to decrypt totals
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-3 text-sm">
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
            <p className="text-sm text-muted-foreground">
              We only ever request decryption of the two aggregate tallies. The network collects signatures and later calls
              our contract’s callback with the clear totals.
            </p>
          </CardContent>
        </Card>

        {/* 6. resolveTallyCallback */}
        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">6</span>
              Step 6 — resolveTallyCallback(...): verifying and writing the result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
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
            <p className="text-sm text-muted-foreground">
              We first verify signatures with <code>checkSignatures</code>, then persist the clear tallies and mark the
              session resolved. Only totals are revealed; individual votes remain secret forever.
            </p>

        {/* 7. Wrap‑up */}
        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">7</span>
              Pattern Recap — Why this contract fits FHE best‑practices
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


