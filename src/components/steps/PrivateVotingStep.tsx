import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Vote, ThumbsUp, ThumbsDown, ArrowRight, Loader2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
// removed mock tutorial services
import { useNavigate } from 'react-router-dom';
import { initializeFheInstance, getFheInstance } from '../../../vote-app/src/fhe';
import { createWalletClient, createPublicClient, custom, http, decodeEventLog, type Hex } from 'viem';
import { sepolia } from 'viem/chains';
// Import ABI from compiled contract
import SimpleVotingABI from '../../../vote-app/artifacts/contracts/SimpleVoting.sol/SimpleVoting.json';

export const PrivateVotingStep: React.FC = () => {
  const { setCurrentStep, completeStep } = useTutorialStore();
  const navigate = useNavigate();
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [proposalText, setProposalText] = useState("");
  const [proposalDuration, setProposalDuration] = useState(5); // minutes
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [liveBusy, setLiveBusy] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [liveSessionId, setLiveSessionId] = useState<bigint | null>(null);
  const [currentSubject, setCurrentSubject] = useState<string>("");
  const [cachedSessions, setCachedSessions] = useState<Array<{ id: string; subject: string; endTime: string; resolved?: boolean }>>([]);
  const [nowTs, setNowTs] = useState<number>(Math.floor(Date.now() / 1000));
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const [resolved, setResolved] = useState<boolean>(false);
  const [yesPct, setYesPct] = useState<number | null>(null);
  const [noPct, setNoPct] = useState<number | null>(null);
  const resolvedRef = useRef<boolean>(false);
  const revealedLoggedRef = useRef<boolean>(false);
  const [showDecryptModes, setShowDecryptModes] = useState(false);
  const [showStorageNote, setShowStorageNote] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 5;

  const SESSIONS_KEY = 'pv_cached_sessions_v1';

  // Pagination logic
  const totalPages = Math.ceil(cachedSessions.length / sessionsPerPage);
  const startIndex = (currentPage - 1) * sessionsPerPage;
  const endIndex = startIndex + sessionsPerPage;
  const paginatedSessions = cachedSessions.slice(startIndex, endIndex);

  const loadCachedSessions = () => {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY);
      if (!raw) return [] as Array<{ id: string; subject: string; endTime: string; resolved?: boolean }>;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Array<{ id: string; subject: string; endTime: string; resolved?: boolean }>;
      return [] as Array<{ id: string; subject: string; endTime: string; resolved?: boolean }>;
    } catch {
      return [] as Array<{ id: string; subject: string; endTime: string; resolved?: boolean }>;
    }
  };

  const persistCachedSessions = (sessions: Array<{ id: string; subject: string; endTime: string; resolved?: boolean }>) => {
    try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); } catch {}
  };

  useEffect(() => {
    const sessions = loadCachedSessions();
    setCachedSessions(sessions);
  }, []);

  // Reset to first page when sessions change
  useEffect(() => {
    setCurrentPage(1);
  }, [cachedSessions.length]);

  // ticking clock for countdowns
  useEffect(() => {
    const t = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  // autoscroll logs like a CLI
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [liveLogs]);

  // Pre-initialize FHE once on mount so voting is instant
  useEffect(() => {
    (async () => {
      try {
        await liveInitFhe();
      } catch (e) {
        setLiveLogs(l => [...l, `❌ FHE init failed: ${String(e)}`]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live (Sepolia) helpers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fheInstance: any = (window as any).__FHE_LIVE__ || null;
  const CONTRACT_ADDRESS = (import.meta as any).env?.VITE_VOTING_CONTRACT_ADDRESS || '0xF6edC2121983A17E040d3f8381357104A05761DF';
const CONTRACT_ABI = SimpleVotingABI.abi;

  const getWallet = () => createWalletClient({ chain: sepolia, transport: custom((window as any).ethereum) });
  // Use the user's wallet RPC to avoid public endpoint timeouts during dev
  const getPublic = () => createPublicClient({ chain: sepolia, transport: custom((window as any).ethereum) });
  const getAccount = async (): Promise<`0x${string}`> => {
    const [addr] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    return addr as `0x${string}`;
  };

  const formatRemaining = (endTs: number) => {
    const diff = Math.max(0, endTs - nowTs);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const shortHex = (hex: string, left = 12, right = 6) => {
    if (!hex?.startsWith('0x') || hex.length <= left + right + 2) return hex;
    return `${hex.slice(0, left)}…${hex.slice(-right)}`;
  };

  const checkChainId = async () => {
    try {
      const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
      const chainIdNumber = parseInt(chainId, 16);
      setLiveLogs(l => [...l, `🔗 Current chain ID: ${chainIdNumber} (expected: 11155111 for Sepolia)`]);
      if (chainIdNumber !== 11155111) {
        setLiveLogs(l => [...l, `⚠️  Please switch to Sepolia network in your wallet`]);
        return false;
      }
      return true;
    } catch (e) {
      setLiveLogs(l => [...l, `❌ Failed to get chain ID: ${String(e)}`]);
      return false;
    }
  };

  const switchToSepolia = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              rpcUrls: ['https://rpc.sepolia.org'],
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
        } catch (addError) {
          setLiveLogs(l => [...l, `❌ Failed to add Sepolia network: ${String(addError)}`]);
        }
      } else {
        setLiveLogs(l => [...l, `❌ Failed to switch to Sepolia: ${String(switchError)}`]);
      }
    }
  };

  const liveInitFhe = async () => {
    if (!fheInstance) {
      setLiveLogs(l => [...l, '🔐 Initializing FHE...']);
      await initializeFheInstance();
      fheInstance = getFheInstance();
      (window as any).__FHE_LIVE__ = fheInstance;
      setLiveLogs(l => [...l, '✅ FHE ready']);
    }
  };

  const liveCreateSession = async () => {
    try {
      setIsCreatingSession(true);
      setLiveBusy(true);
      
      // Check current chain and switch if needed
      const currentChainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
      const chainIdNumber = parseInt(currentChainId, 16);
      setLiveLogs(l => [...l, `🔗 Current chain ID: ${chainIdNumber} (expected: 11155111 for Sepolia)`]);
      
      if (currentChainId !== '0xaa36a7') { // 11155111 in hex
        setLiveLogs(l => [...l, `🔄 Switching to Sepolia network...`]);
        await switchToSepolia();
        setLiveLogs(l => [...l, `✅ Switched to Sepolia`]);
      }
      
      const secs = Math.max(1, proposalDuration) * 60;
      setLiveLogs(l => [...l, `🧭 Creating session (${secs/60} min)...`]);
      const wallet = getWallet();
      const account = await getAccount();
      const hash = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI as unknown as [], functionName: 'createSession', args: [BigInt(secs)], chain: sepolia, account });
      setLiveLogs(l => [...l, `⛓️  Tx submitted: ${hash}`]);

      // Prefer events: watch for SessionCreated emitted by our address
      const publicClient = getPublic();
      const fromBlock = await publicClient.getBlockNumber();
      const waitForEvent = () => new Promise<bigint | null>((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unwatch = (publicClient as any).watchContractEvent({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI as unknown as [],
          eventName: 'SessionCreated',
          args: { creator: account },
          fromBlock,
          onLogs: (logs: any[]) => {
            try {
              const found = logs.find(l => l?.args?.creator?.toLowerCase?.() === (account as string).toLowerCase());
              if (found) {
                const sid = BigInt(found.args.sessionId as string | number | bigint);
                console.log('[Session] Event sessionId ->', sid.toString());
                try { unwatch(); } catch {}
                resolve(sid);
              }
            } catch {
              try { unwatch(); } catch {}
              resolve(null);
            }
          },
          onError: (_e: unknown) => { try { unwatch(); } catch {}; resolve(null); }
        });
        // Safety timeout
        setTimeout(() => { try { unwatch(); } catch {}; resolve(null); }, 30000);
      });

      const sidFromEvent = await waitForEvent();
      if (sidFromEvent !== null) {
        setLiveSessionId(sidFromEvent);
        setCurrentSubject(proposalText);
        setCreateOpen(false);
        setIsCreatingSession(false);
        const newSession = { id: sidFromEvent.toString(), subject: proposalText, endTime: String(Date.now()/1000 + Math.max(1, proposalDuration)*60), resolved: false };
        const updated = [newSession, ...loadCachedSessions()].filter((s, idx, arr) => arr.findIndex(t => t.id === s.id) === idx).slice(0, 10);
        setCachedSessions(updated);
        persistCachedSessions(updated);
        // session is ready for voting
        setLiveLogs(l => [...l, `✅ Session ${sidFromEvent.toString()} (from event)`]);
      }

      // Also wait for the receipt and parse logs (secondary confirmation)
      const receipt = await getPublic().waitForTransactionReceipt({ hash });
      setLiveLogs(l => [...l, `📋 Transaction confirmed. Processing ${receipt.logs.length} logs...`]);
      
      let sessionCreated = false;
      for (const log of receipt.logs) {
        try {
          // Cast log to include topics property for decodeEventLog
          const logWithTopics = log as typeof log & { topics: [`0x${string}`, ...`0x${string}`[]]; address?: `0x${string}` };

          // Filter: only attempt to decode logs emitted by our contract
          const logAddress = (logWithTopics as any).address?.toLowerCase?.();
          if (!logAddress || logAddress !== (CONTRACT_ADDRESS as string).toLowerCase()) {
            continue;
          }

          setLiveLogs(l => [...l, `🔍 Checking log with ${logWithTopics.topics.length} topics...`]);
          
          // Use strict:false to avoid throwing on signature mismatches (older nodes may add system logs)
          const decoded = (decodeEventLog as any)({ abi: CONTRACT_ABI as unknown as [], data: logWithTopics.data, topics: logWithTopics.topics, strict: false }) as { eventName?: string; args?: Record<string, unknown> };
          if (!decoded?.eventName) {
            continue;
          }
          setLiveLogs(l => [...l, `📝 Decoded event: ${decoded.eventName}`]);
          
          if (decoded.eventName === 'SessionCreated') {
            const argsObj = decoded.args;
            const sid = BigInt(argsObj.sessionId as string | number | bigint);
            setLiveSessionId(sid);
            setCurrentSubject(proposalText);
            setLiveLogs(l => [...l, `✅ Session ${sid.toString()} created`]);
            // Modal already closed optimistically
            // Cache this session locally for quick access
            const newSession = { id: sid.toString(), subject: proposalText, endTime: String(argsObj.endTime ?? (Date.now()/1000 + Math.max(1, proposalDuration)*60)), resolved: false };
            // Reconcile: replace any optimistic entry
            const prev = loadCachedSessions().filter(s => s.id !== String(sid));
            const updated = [newSession, ...prev].slice(0, 10);
            setCachedSessions(updated);
            persistCachedSessions(updated);
            sessionCreated = true;
            break;
          }
        } catch (e) {
          // Silently ignore unrelated/undecodable logs to avoid noisy UX
          // setLiveLogs(l => [...l, `⚠️  Failed to decode log: ${String(e)}`]);
        }
      }
      
      if (!sessionCreated) {
        setLiveLogs(l => [...l, `❌ No SessionCreated event found in transaction logs`]);
        // Fallback: assume session was created successfully
        setLiveLogs(l => [...l, `🔄 Fallback: assuming session was created...`]);
        // We'll use a temporary session ID and let the user know to refresh
        const tempSessionId = Date.now() % 1000000; // Simple fallback ID
        setLiveSessionId(BigInt(tempSessionId));
        setCurrentSubject(proposalText);
        setLiveLogs(l => [...l, `⚠️  Fallback: Using temporary session ID ${tempSessionId}. Please refresh to get the real session ID.`]);
        setCreateOpen(false);
        
        // Cache this session locally
        const newSession = { id: tempSessionId.toString(), subject: proposalText, endTime: String(Date.now()/1000 + Math.max(1, proposalDuration)*60), resolved: false };
        const updated = [newSession, ...loadCachedSessions()].slice(0, 10);
        setCachedSessions(updated);
        persistCachedSessions(updated);
      }
    } catch (e) {
      setLiveLogs(l => [...l, `❌ Create session failed: ${String(e)}`]);
    } finally {
      setIsCreatingSession(false);
      setLiveBusy(false);
    }
  };

  const liveVote = async (choice: 'yes' | 'no') => {
    if (liveSessionId === null) return;
    try {
      setLiveBusy(true);
      await liveInitFhe();
      setLiveLogs(l => [...l, `🔏 Encrypting ${choice.toUpperCase()}...`] );
      // Pure YES/NO voting - encrypt the choice directly
      const voteChoice = choice === 'yes' ? 1 : 0; // 0 = No, 1 = Yes
      
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contractChecksum = ethers.getAddress(CONTRACT_ADDRESS as string);
      
      setLiveLogs(l => [...l, `👤 Signer: ${userAddress}`]);
      setLiveLogs(l => [...l, `🏛️ Contract: ${contractChecksum}`]);
      
      // Encrypt the vote choice directly (0 or 1) - exactly like your working contract
      const ciphertext = await fheInstance.createEncryptedInput(contractChecksum, userAddress);
      ciphertext.add8(BigInt(voteChoice)); // Encrypt the choice (0 or 1)
      const { handles, inputProof } = await ciphertext.encrypt();
      const encryptedHex = ethers.hexlify(handles[0]);
      const proofHex = ethers.hexlify(inputProof);
      
      // Log ciphertext & proof summary before submission
      setLiveLogs(l => [
        ...l,
        `🧪 Ciphertext handle: ${shortHex(encryptedHex)}`,
        `🧪 Input proof: ${shortHex(proofHex)}`,
      ]);
      
      setLiveLogs(l => [...l, `🗳️ Voting on session ID: ${liveSessionId}`]);
      
    // Call the contract's vote function - using correct ABI format
    const contract = new ethers.Contract(contractChecksum, CONTRACT_ABI as unknown as [], signer);
    const tx = await contract.vote(
      liveSessionId,
      encryptedHex,  // externalEuint8 as bytes32
      proofHex,      // proof as bytes
      { gasLimit: 1000000 }
    );
      setLiveLogs(l => [...l, `⛓️  Vote tx: ${tx.hash}`]);
      const rcpt = await tx.wait();
      setLiveLogs(l => [...l, `📋 Vote mined. status: ${rcpt?.status === 1 ? 'success' : 'reverted'}`]);
    } catch (e) {
      setLiveLogs(l => [...l, `❌ Vote failed: ${String(e)}`]);
    } finally {
      setLiveBusy(false);
    }
  };

  const liveRequestReveal = async () => {
    if (liveSessionId === null) return;
    try {
      setLiveBusy(true);
      const wallet = getWallet();
      const account = await getAccount();
      const hash = await wallet.writeContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI as unknown as [], functionName: 'requestTallyReveal', args: [liveSessionId], chain: sepolia, account });
      setLiveLogs(l => [...l, `🔓 Reveal requested. Tx: ${hash}`]);
      setLiveLogs(l => [...l, '⛏️  Waiting for reveal tx to be mined...']);
      const rcpt = await getPublic().waitForTransactionReceipt({ hash });
      setLiveLogs(l => [...l, `📦 Reveal tx receipt status: ${rcpt.status === 'success' ? 'success' : 'reverted'}`]);
      setLiveLogs(l => [...l, '🛰️  Waiting for oracle callback (resolveTallyCallback)...']);
      
      // Poll until resolved or timeout (~60s)
      const start = Date.now();
      const poll = async () => {
        await liveCheckResults();
        if (resolvedRef.current) return;
        if (Date.now() - start > 60000) {
          setLiveLogs(l => [...l, '⌛ Reveal taking longer than usual. You can press "Check Results" anytime.']);
          return;
        }
        setTimeout(poll, 4000);
      };
      setTimeout(poll, 4000);
    } catch (e) {
      setLiveLogs(l => [...l, `❌ Reveal request failed: ${String(e)}`]);
    } finally {
      setLiveBusy(false);
    }
  };

  const liveCheckResults = async () => {
    if (liveSessionId === null) return;
    try {
      const publicClient = getPublic();
      const result = await (publicClient as any).readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI as unknown as [],
        functionName: 'getSession',
        args: [liveSessionId]
      });
      
      const [creator, endTime, isResolved, yesVotes, noVotes] = result as any;
      
      setLiveLogs(l => [...l, `📊 Session ${liveSessionId} Results:`]);
      setLiveLogs(l => [...l, `   Resolved: ${isResolved}`]);
      setLiveLogs(l => [...l, `   Yes Votes: ${yesVotes}`]);
      setLiveLogs(l => [...l, `   No Votes: ${noVotes}`]);
      
      setResolved(Boolean(isResolved));
      resolvedRef.current = Boolean(isResolved);
      if (isResolved) {
        const y = Number(yesVotes);
        const n = Number(noVotes);
        const t = Math.max(0, y + n);
        if (t > 0) {
          const yp = Math.round((y / t) * 100);
          setYesPct(yp);
          setNoPct(100 - yp);
        } else {
          setYesPct(null);
          setNoPct(null);
        }
        if (!revealedLoggedRef.current) {
          setLiveLogs(l => [...l, `✅ Tally revealed! Yes: ${yesVotes}, No: ${noVotes}`]);
          setLiveLogs(l => [...l, '🧩 resolveTallyCallback has executed on-chain.']);
          revealedLoggedRef.current = true;
        }
        // mark current cached session as resolved for UI tag
        setCachedSessions(prev => {
          const updated = prev.map(s => s.id === String(liveSessionId) ? { ...s, resolved: true } : s);
          persistCachedSessions(updated);
          return updated;
        });
      } else {
        setYesPct(null);
        setNoPct(null);
        revealedLoggedRef.current = false;
      }
    } catch (e) {
      setLiveLogs(l => [...l, `❌ Failed to check results: ${String(e)}`]);
    }
  };

  // removed mock castVote

  // removed mock flows

  const handleContinue = () => {
    completeStep('private-voting');
    setCurrentStep('review');
    navigate('/step/review');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <Badge variant="secondary"><Vote className="h-3 w-3" /> Step 9 of 10</Badge>
        <h1 className="font-display text-3xl font-bold">Private Voting Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Interact with a real FHEVM contract on Sepolia! Create sessions, cast encrypted votes, 
          and experience live confidential computing on the blockchain.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="interactive-demo">
          <CardHeader>
            <CardTitle>Create a Session and Cast Your Vote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Decryption modes</div>
              <Button size="sm" variant="outline" onClick={() => setShowDecryptModes(!showDecryptModes)}>
                {showDecryptModes ? 'Hide' : 'Show'}
              </Button>
            </div>
            <AnimatePresence>
              {showDecryptModes && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded border p-2 bg-muted/30">
                    <div className="font-semibold mb-1">Public reveal (current)</div>
                    <div>Contract marks tallies and requests decryption of aggregates; oracle callback publishes totals.</div>
                  </div>
                  <div className="rounded border p-2 bg-muted/30">
                    <div className="font-semibold mb-1">User-private decrypt (alt)</div>
                    <div>SDK re-encrypts result with your key; use userDecrypt() in the frontend to read privately.</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Inline stage hints */}
            <div className="grid sm:grid-cols-3 gap-2 text-xs">
              <div className="rounded border p-2 bg-muted/30">
                <div className="font-semibold">1) Encrypt</div>
                <div>We encrypt 0/1 locally using the Relayer SDK.</div>
              </div>
              <div className="rounded border p-2 bg-muted/30">
                <div className="font-semibold">2) Prove</div>
                <div>SDK generates a proof that the ciphertext is valid.</div>
              </div>
              <div className="rounded border p-2 bg-muted/30">
                <div className="font-semibold">3) Submit</div>
                <div>We call <code>vote(sessionId, externalEuint8, proof)</code>.</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Create Session</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>New Voting Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <label className="text-sm">Describe the voting topic</label>
                  <textarea className="w-full border rounded p-2 bg-background" rows={3} value={proposalText} onChange={(e) => setProposalText(e.target.value)} placeholder="e.g. Should we have pizza for lunch?" />
                  <div className="flex items-center gap-3">
                    <label className="text-sm">Duration (minutes)</label>
                    <input type="number" min={1} className="w-24 border rounded p-2 bg-background" value={proposalDuration} onChange={(e)=> setProposalDuration(parseInt(e.target.value||'5'))} />
                  </div>
                  <Button onClick={liveCreateSession} disabled={isCreatingSession || !proposalText.trim()} className="w-full">
                    {isCreatingSession ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Session...
                      </>
                    ) : (
                      'Start Session'
                    )}
                  </Button>
                </div>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  setLiveLogs(l => [...l, `🔄 Refreshing connection...`]);
                  try {
                    const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
                    const chainIdNumber = parseInt(chainId, 16);
                    setLiveLogs(l => [...l, `🔗 Current chain ID: ${chainIdNumber}`]);
                    if (chainIdNumber === 11155111) {
                      setLiveLogs(l => [...l, `✅ Connected to Sepolia`]);
                    } else {
                      setLiveLogs(l => [...l, `⚠️  Please switch to Sepolia (Chain ID: 11155111)`]);
                    }
                  } catch (e) {
                    setLiveLogs(l => [...l, `❌ Connection check failed: ${String(e)}`]);
                  }
                }}
              >
                Check Network
              </Button>
            </div>

            {liveSessionId !== null && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Session #{liveSessionId.toString()}</div>
                {currentSubject && <div className="text-base font-medium">{currentSubject}</div>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => liveVote('yes')}
                disabled={hasVoted || isVoting || liveBusy || liveSessionId === null}
                className="gap-2 h-16"
                variant={hasVoted ? "secondary" : "default"}
              >
                <ThumbsUp className="h-5 w-5" />
                Yes{yesPct !== null && resolved ? ` • ${yesPct}%` : ''}
              </Button>
              <Button
                onClick={() => liveVote('no')}
                disabled={hasVoted || isVoting || liveBusy || liveSessionId === null}
                className="gap-2 h-16"
                variant={hasVoted ? "secondary" : "outline"}
              >
                <ThumbsDown className="h-5 w-5" />
                No{noPct !== null && resolved ? ` • ${noPct}%` : ''}
              </Button>
            </div>
            <div className="space-y-2">
              <Button onClick={liveRequestReveal} disabled={liveSessionId === null || liveBusy} variant="secondary" className="w-full">End Session & Request Tally</Button>
              <Button onClick={liveCheckResults} disabled={liveSessionId === null || liveBusy} variant="outline" className="w-full">Check Results</Button>
              <div className="text-xs text-muted-foreground">
                Ending a session triggers a <em>reveal request</em>. The network decrypts the two tallies and calls the
                contract’s callback. Use “Check Results” after a few seconds to see the clear totals.
              </div>
              <div className="text-[11px] text-muted-foreground">
                Docs: <a className="underline" href="https://docs.zama.ai/protocol/relayer-sdk-guides/fhevm-relayer/decryption" target="_blank" rel="noreferrer">Decryption & Callbacks</a>
              </div>
            </div>

            {/* Terminal-like logs */}
            <div className="rounded-md border text-xs font-mono bg-white text-neutral-800 dark:bg-black/80 dark:text-neutral-200">
              <div className="flex items-center justify-between px-3 py-2 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="ml-3 text-[10px] uppercase tracking-wider text-black/70 dark:text-white/70">Session Logs</span>
                </div>
                <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => setLiveLogs([])}>Clear</Button>
              </div>
              <div ref={terminalRef} className="h-56 overflow-auto px-3 py-2 space-y-1">
                {liveLogs.length === 0 && (
                  <div className="text-black/50 dark:text-white/50">➜ Waiting for actions…</div>
                )}
                {liveLogs.map((l, i) => {
                  const color = l.startsWith('❌') ? 'text-red-400' : l.startsWith('✅') ? 'text-green-400' : l.startsWith('⚠️') ? 'text-yellow-600 dark:text-yellow-300' : 'text-neutral-800 dark:text-neutral-200';
                  return (
                    <div key={i} className={`whitespace-pre-wrap ${color}`}>
                      <span className="text-green-500">➜</span> {l}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Browser Cache Storage Note - Collapsible */}
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStorageNote(!showStorageNote)}
                className="w-full justify-between p-2 h-auto text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">💾 Data Storage Notice</span>
                </div>
                {showStorageNote ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <AnimatePresence>
                {showStorageNote && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="mb-2">
                          Your voting sessions and results are currently stored in your browser's local cache for demonstration purposes. 
                          This allows you to see your recent sessions and vote history.
                        </p>
                        <p>
                          <strong>For production use:</strong> Consider integrating a backend service like Supabase or Firebase 
                          to persist data across devices and provide a more robust user experience.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {hasVoted && (
              <div className="text-center text-sm text-success">
                ✅ Your encrypted vote has been submitted!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="tutorial-step">
          <CardHeader>
            <CardTitle>Live Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>Encrypted tallies accumulate on-chain during the session.</div>
              <div>After ending the session, request a reveal to decrypt totals.</div>
              {currentSubject && (
                <div className="mt-2">
                  <span className="text-foreground font-medium">Current proposal:</span> {currentSubject}
                </div>
              )}
            </div>

            {/* Cached sessions list with pagination */}
            {cachedSessions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Your recent sessions</div>
                  {cachedSessions.length > sessionsPerPage && (
                    <div className="text-xs text-muted-foreground">
                      Page {currentPage} of {totalPages} ({cachedSessions.length} total)
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {paginatedSessions.map((s) => {
                    const end = parseInt(s.endTime || '0', 10);
                    const remaining = formatRemaining(end);
                    const ended = nowTs >= end;
                    return (
                      <div key={s.id} className="rounded-lg border p-3 bg-gradient-to-br from-primary/5 to-primary/10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-xs text-muted-foreground">Session #{s.id}</div>
                            <div className="truncate font-medium">{s.subject || 'Untitled'}</div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <div className={`text-xs ${ended ? 'text-destructive' : 'text-foreground'}`}>{ended ? 'Ended' : `Ends in ${remaining}`}</div>
                              {s.resolved && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Tallied</span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground">Sepolia</div>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          <Button size="sm" onClick={() => setLiveSessionId(BigInt(s.id))}>Select</Button>
                          <Button size="sm" variant="outline" disabled={ended} onClick={() => { setLiveSessionId(BigInt(s.id)); liveVote('yes'); }}>Yes</Button>
                          <Button size="sm" variant="outline" disabled={ended} onClick={() => { setLiveSessionId(BigInt(s.id)); liveVote('no'); }}>No</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination Controls */}
                {cachedSessions.length > sessionsPerPage && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-3"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="h-8 w-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button onClick={handleContinue} size="lg" className="gap-2">
          Continue to Review <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};