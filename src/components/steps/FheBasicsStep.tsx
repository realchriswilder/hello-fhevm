import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Lock, 
  Network, 
  Copy, 
  Check, 
  Code2,
  Eye,
  EyeOff,
  Calculator,
  Database,
  Users,
  Vote,
  Key,
  Globe,
  Zap,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  Info,
  Brain,
  Cpu,
  Server,
  FileText,
  Workflow,
  Target,
  Building2,
  Heart,
  MessageSquare,
  Scale
} from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';
import { FheBasicsQuiz } from '@/components/quiz/FheBasicsQuiz';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import mermaid from 'mermaid';

export const FheBasicsStep: React.FC = () => {
  const { setCurrentStep, completeStep } = useTutorialStore();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTechnicalView, setShowTechnicalView] = useState(false);
  const [showProofExplainer, setShowProofExplainer] = useState(false);
  const [showTypeTips, setShowTypeTips] = useState(false);
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [isPreviewDark, setIsPreviewDark] = useState<boolean>(false);
  const [showMermaidModal, setShowMermaidModal] = useState(false);
  const [diagramDark, setDiagramDark] = useState<boolean>(false);
  const mermaidContainerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);

  useEffect(() => {
    try {
      const rootHasDark = document.documentElement.classList.contains('dark');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsPreviewDark(rootHasDark || prefersDark);
    } catch (_) {
      setIsPreviewDark(false);
    }
  }, []);

  useEffect(() => {
    const detectDark = (): boolean => {
      try {
        const classDark = document.documentElement.classList.contains('dark');
        const mediaDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return classDark || mediaDark;
      } catch {
        return false;
      }
    };

    const cssVar = (name: string): string => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v ? `hsl(${v})` : '';
    };

    const initMermaidWithTheme = (isDark: boolean) => {
      const text = cssVar('--foreground') || (isDark ? '#111827' : '#111827');
      const mutedText = cssVar('--muted-foreground') || (isDark ? '#6b7280' : '#6b7280');
      const mainBkg = cssVar('--card') || (isDark ? '#ffffff' : '#ffffff');
      const border = cssVar('--border') || (isDark ? '#d1d5db' : '#d1d5db');

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'base',
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        themeVariables: {
          background: 'transparent',
          primaryColor: mainBkg,
          secondaryColor: mainBkg,
          tertiaryColor: mainBkg,
          mainBkg,
          primaryTextColor: text,
          secondaryTextColor: text,
          tertiaryTextColor: text,
          textColor: text,
          lineColor: border,
          primaryBorderColor: border,
          secondaryBorderColor: border,
          tertiaryBorderColor: border,
          edgeLabelBackground: mainBkg,
          noteBkgColor: mainBkg,
          noteTextColor: text,
          // sequence-specific
          actorBorder: border,
          actorBkg: mainBkg,
          signalColor: border,
          signalTextColor: text,
          labelBoxBkgColor: mainBkg,
          labelBoxBorderColor: border,
          activationBkgColor: mainBkg,
          activationBorderColor: border,
          sequenceNumberColor: mutedText
        } as any
      });
    };

    const applyTheme = (isDark: boolean) => {
      setDiagramDark(isDark);
      initMermaidWithTheme(isDark);
      if (showMermaidModal) {
        // Re-render if the modal is open
        setTimeout(() => renderMermaid(), 0);
      }
    };

    applyTheme(detectDark());

    const media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const mediaHandler = () => applyTheme(detectDark());
    media?.addEventListener?.('change', mediaHandler);

    const observer = new MutationObserver(() => applyTheme(detectDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      media?.removeEventListener?.('change', mediaHandler);
      observer.disconnect();
    };
  }, [showMermaidModal]);

  const renderMermaid = () => {
    const container = mermaidContainerRef.current;
    if (!container) return;
    const code = `sequenceDiagram\n    participant User as \"User\"\n    participant React as \"React Frontend\"\n    participant SDK as \"@httpz/sdk\"\n    participant Contract as \"Smart Contract\"\n    participant Gateway as \"Gateway Service\"\n    participant KMS as \"Key Management System\"\n    participant Coprocessor as \"FHE Coprocessor\"\n    participant Oracle as \"Decryption Oracle\"\n\n    Note over User, Oracle: Input Encryption & Submission Phase\n    User->>React: \"Input sensitive data\"\n    React->>SDK: \"createEncryptedInput(contractAddr, userAddr)\"\n    SDK->>SDK: \"input.add64(value), input.addBool(flag)\"\n    SDK->>SDK: \"input.encrypt() - Generate ciphertext + ZKPoK\"\n    React->>Contract: \"Call function with encrypted inputs + proof\"\n    Contract->>Contract: \"FHE.asEuint64(input, proof) - Validate & convert\"\n    Note over Contract, Coprocessor: FHE Computation Phase\n    Contract->>Coprocessor: \"Symbolic execution - FHE operations\"\n    Coprocessor->>Coprocessor: \"Execute encrypted computations using evaluation key\"\n    Coprocessor->>Contract: \"Return encrypted results (handles)\"\n    Contract->>Contract: \"Store encrypted results\"\n    Note over Contract, Oracle: Decryption Request Phase\n    Contract->>Gateway: \"Gateway.requestDecryption(handles, callback, params)\"\n    Gateway->>Oracle: \"requestDecryption(requestID, handles, callbackSelector)\"\n    Oracle->>Oracle: \"Emit EventDecryption\"\n    Note over Oracle, KMS: KMS Decryption Phase\n    Oracle->>Gateway: \"Relayer detects event\"\n    Gateway->>KMS: \"Request decryption of ciphertext handles\"\n    KMS->>KMS: \"Decrypt using private FHE key\"\n    KMS->>Gateway: \"Return decrypted plaintext + signatures\"\n    Note over Gateway, Contract: Oracle Callback Phase\n    Gateway->>Contract: \"Call callback function with decrypted results\"\n    Contract->>Contract: \"Process plaintext results in callback\"\n    Contract->>Contract: \"Update contract state with decrypted values\"\n    Note over React, SDK: Frontend Data Retrieval Phase\n    React->>Contract: \"Call view function to get results\"\n    Contract->>React: \"Return processed results\"\n    React->>User: \"Display decrypted/processed data\"\n    Note over User, Oracle: Alternative: Re-encryption for Private Access\n    React->>SDK: \"generateKeypair() for user\"\n    React->>SDK: \"createEIP712(publicKey, contractAddr)\"\n    User->>React: \"Sign EIP712 message\"\n    React->>Contract: \"Get encrypted balance handle\"\n    React->>SDK: \"reencrypt(handle, privateKey, publicKey, signature)\"\n    SDK->>Gateway: \"Request re-encryption\"\n    Gateway->>KMS: \"Re-encrypt with user's public key\"\n    KMS->>Gateway: \"Return re-encrypted data\"\n    Gateway->>SDK: \"Return re-encrypted ciphertext\"\n    SDK->>SDK: \"Decrypt with user's private key\"\n    SDK->>React: \"Return plaintext for user only\"\n    React->>User: \"Display private data\"`;
    const id = 'fhe-advanced-seq';
    // Re-apply theme variables before rendering to ensure contrast (especially in light mode)
    const cssVar = (name: string): string => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v ? `hsl(${v})` : '';
    };
    const mainBkg = cssVar('--card') || '#ffffff';
    const text = cssVar('--foreground') || '#111827';
    const border = cssVar('--border') || '#d1d5db';
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'base',
      fontFamily: 'Inter, ui-sans-serif, system-ui',
      themeVariables: {
        background: 'transparent',
        mainBkg,
        primaryColor: mainBkg,
        secondaryColor: mainBkg,
        tertiaryColor: mainBkg,
        primaryTextColor: text,
        lineColor: border,
        primaryBorderColor: border,
        secondaryBorderColor: border,
        tertiaryBorderColor: border
      } as any
    });
    requestAnimationFrame(() => {
      mermaid.render(id, code).then(({ svg }) => {
        container.innerHTML = svg;
      }).catch((err) => {
        console.error('Mermaid render error', err);
        container.innerHTML = '<div class="text-xs text-destructive p-2">Failed to render diagram.</div>';
      });
    });
  };

  useEffect(() => {
    if (!showMermaidModal) return;
    renderMermaid();
  }, [showMermaidModal, diagramDark]);

  const onWheelZoom = (e: React.WheelEvent) => {
    // Avoid calling preventDefault to stop the passive-listener warning.
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.1 : 0.9;
    setZoom((z) => Math.min(3, Math.max(0.4, z * factor)));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isPanningRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };
  const onMouseUpLeave = () => { isPanningRef.current = false; };

  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStartDistRef.current = getTouchDistance(e.touches);
      pinchStartZoomRef.current = zoom;
    } else if (e.touches.length === 1) {
      isPanningRef.current = true;
      lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      const current = getTouchDistance(e.touches);
      if (current > 0) {
        const scale = current / pinchStartDistRef.current;
        const nextZoom = Math.min(3, Math.max(0.4, pinchStartZoomRef.current * scale));
        setZoom(nextZoom);
      }
    } else if (e.touches.length === 1 && isPanningRef.current) {
      const dx = e.touches[0].clientX - lastPosRef.current.x;
      const dy = e.touches[0].clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinchStartDistRef.current = null;
    }
    if (e.touches.length === 0) {
      isPanningRef.current = false;
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    const el = wrapperRef.current as any;
    if (!document.fullscreenElement) {
      if (el?.requestFullscreen) el.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
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

  const handleContinue = () => {
    completeStep('fhe-basics');
    setCurrentStep('write-contract');
    navigate('/step/write-contract');
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % fheSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + fheSlides.length) % fheSlides.length);
  };

  const fheSlides = [
    {
      id: 1,
      title: "Why Confidential Smart Contracts?",
      icon: Eye,
      technical: {
        title: "Technical View",
        content: "Normal blockchains = transparent by design. All transactions, balances, and states are visible. Confidentiality gap blocks adoption in: DeFi (MEV, front-running), Voting, Identity, Enterprise use. FHEVM = compute on encrypted data directly."
      },
      layman: {
        title: "Layman's View", 
        content: "Imagine your bank account was printed on a public notice board. FHEVM = 'Your balance is encrypted, but the system can still do math on it.'"
      },
      visual: "Two Ethereum blocks → one with open data, one with padlocks over the data.",
      code: null
    },
    {
      id: 2,
      title: "What is FHE (Fully Homomorphic Encryption)?",
      icon: Lock,
      technical: {
        title: "Technical View",
        content: "FHE allows arbitrary computations on encrypted inputs. Supported operations in FHEVM: Arithmetic (add, sub, mul, div), Logic (and, or, xor), Comparisons (eq, lt, gt). Output is still encrypted until explicitly decrypted."
      },
      layman: {
        title: "Layman's View",
        content: "Lock two numbers in safes. Give them to a machine. The machine adds them without opening the safes → result is a new locked safe."
      },
      visual: "Three safes → (3) + (5) → (8)",
      code: null
    },
    {
      id: 3,
      title: "FHEVM Architecture (Zama Protocol)",
      icon: Network,
      technical: {
        title: "Technical View",
        content: "Components: Gateway (orchestrator, verifies encrypted inputs, routes decryption requests), Coprocessors (execute heavy FHE operations off-chain), KMS (Key Management Service: threshold MPC → no single party holds decryption key), Oracles (bring decrypted results back on-chain), Relayers (help dApps/users communicate with Gateway). Security assumptions: At least 2/3 KMS honest, At least 1/2 coprocessors honest."
      },
      layman: {
        title: "Layman's View",
        content: "A trusted network of specialized computers that can do math on your encrypted data without ever seeing what it is. Like having a team of blind mathematicians who can still solve complex problems."
      },
      visual: "Diagram (User → Gateway → Coprocessors + KMS → Blockchain)",
      code: null
    },
    {
      id: 4,
      title: "Encrypted Types in Solidity",
      icon: Code2,
      technical: {
        title: "Technical View",
        content: "Supported types: euint8 → euint256, eint8 → eint256, ebool, eaddress, ebytesX. Use FHE.fromExternal for inputs, FHE.allow for access control, FHE.makePubliclyDecryptable for public reveals."
      },
      layman: {
        title: "Layman's View",
        content: "Developers code in Solidity almost the same way. The only difference: they use euint128 instead of uint128."
      },
      visual: "Side-by-side — 'Normal Solidity' vs 'Encrypted Solidity'",
      code: `import { FHE, euint128 } from "@fhevm/solidity/lib/FHE.sol";

euint128 public balance;

function deposit(externalEuint128 encAmount, bytes calldata proof) external {
    euint128 amount = FHE.fromExternal(encAmount, proof);
    balance = FHE.add(balance, amount);
    FHE.allow(balance, msg.sender); // grant user access
}`
    },
    {
      id: 5,
      title: "Encryption Workflow",
      icon: Workflow,
      technical: {
        title: "Technical View",
        content: "Step 1 (User): In frontend, user encrypts input → createEncryptedInput() from Relayer SDK, ZK proof ensures ciphertext is valid. Step 2 (Contract): Contract receives externalEuint128 + proof, Converts with FHE.fromExternal() into usable handle. Step 3 (Execution): Contract performs operations on handles (symbolic execution), Coprocessors run actual heavy math in parallel."
      },
      layman: {
        title: "Layman's View",
        content: "You put your secret number in a locked box, send it to the smart contract, which does math on the locked box, and gives you back a new locked box with the result."
      },
      visual: "User typing '10 tokens' → encrypted safe → contract box → new encrypted state.",
      code: null
    },
    {
      id: 6,
      title: "Decryption Workflow",
      icon: Key,
      technical: {
        title: "Technical View",
        content: "Public Decryption (everyone can see): Contract marks value → FHE.makePubliclyDecryptable(handle), Oracle requests Gateway → KMS decrypts → plaintext goes back on-chain. User Decryption (private): User signs EIP-712 request in wallet, KMS re-encrypts result with user's public key, Frontend SDK (userDecrypt) decrypts locally."
      },
      layman: {
        title: "Layman's View",
        content: "Public = 'announced on a bulletin board', Private = 'whispered only to you in your ear'"
      },
      visual: "Split path diagram (Public vs Private Decryption)",
      code: null
    },
    {
      id: 7,
      title: "Example Use Cases",
      icon: Target,
      technical: {
        title: "Technical View",
        content: "DeFi: Encrypted swaps stop front-running (MEV), Private balances/tokens for institutions. Governance & Voting: Secret ballots, results verifiable on-chain. Identity / Compliance: KYC claims stored encrypted, Smart contract only checks logic (e.g. 'is adult?'), never sees actual birthday. Social Apps: Posts, tips, subs all encrypted, Users decide when to reveal."
      },
      layman: {
        title: "Layman's View",
        content: "Voting where no one can see your vote until the final count. Banking where your balance is private but the bank can still process transactions. Social media where you control what gets revealed."
      },
      visual: "Icons → DeFi, Voting, Identity, Social Media",
      code: null
    },
    {
      id: 8,
      title: "How to Get Started",
      icon: Zap,
      technical: {
        title: "Technical View",
        content: "Contracts: Import @fhevm/solidity, Use FHE.fromExternal for inputs, Add access controls: FHE.allow, FHE.makePubliclyDecryptable. Frontend: Use @zama-fhe/relayer-sdk, Init with createInstance(SepoliaConfig), Use createEncryptedInput (encrypt), Use userDecrypt or publicDecrypt (decrypt). Deployment: Deploy with Hardhat → npx hardhat deploy --network sepolia, Verify compatibility → npx hardhat fhevm check-fhevm-compatibility."
      },
      layman: {
        title: "Layman's View",
        content: "Confidential smart contracts are as easy as normal Solidity — just with encryption built in."
      },
      visual: "Flowchart 'Write → Deploy → Use'",
      code: `// Frontend
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

const fhe = await createInstance(SepoliaConfig);
const encrypted = await fhe.createEncryptedInput(contractAddress, userAddress);
encrypted.add64(BigInt(100));
const { handles, inputProof } = await encrypted.encrypt();

// Contract
function vote(externalEuint64 encryptedVote, bytes calldata proof) external {
    euint64 vote = FHE.fromExternal(encryptedVote, proof);
    totalVotes = FHE.add(totalVotes, vote);
    FHE.allowThis(totalVotes);
}`
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <Badge variant="secondary" className="gap-2">
          <Shield className="h-3 w-3" />
          Step 4 of 10
        </Badge>
        <h1 className="font-display text-2xl font-bold">FHE Basics</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
          Master the fundamentals of Fully Homomorphic Encryption and Zama's FHEVM through interactive slides
        </p>
      </motion.div>

      {/* End-to-End Flow Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="tutorial-step">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Workflow className="h-4 w-4 text-primary" /> Encryption → Computation → Decryption (Simple Voting)
              </CardTitle>
              <div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button size="sm" className="shrink-0 w-full sm:w-auto" onClick={() => setShowFlowModal(true)}>
                  View advanced flow 
                </Button>
                <Button size="sm" variant="outline" className="shrink-0 w-full sm:w-auto" onClick={() => setShowMermaidModal(true)}>
                  Detailed view
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full overflow-x-auto">
              <svg width="1024" height="300" viewBox="0 0 1024 300" className="min-w-[720px]">
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
                  </marker>
                  <style>{`.node{fill:transparent;stroke:currentColor;opacity:.9}.label{font-size:12px;fill:currentColor;opacity:.9}`}</style>
                </defs>

                {/* Row 1: Frontend, Relayer, Contract */}
                <rect x="20" y="60" rx="8" ry="8" width="180" height="44" className="node" />
                <text x="110" y="82" textAnchor="middle" dominantBaseline="middle" className="label">React Frontend</text>

                <rect x="240" y="60" rx="8" ry="8" width="180" height="44" className="node" />
                <text x="330" y="82" textAnchor="middle" dominantBaseline="middle" className="label">Zama FHE Client</text>

                <rect x="460" y="60" rx="8" ry="8" width="220" height="44" className="node" />
                <text x="570" y="82" textAnchor="middle" dominantBaseline="middle" className="label">SimpleVoting (Contract)</text>

                {/* Row 2: Oracle/KMS and User/Public Decrypt */}
                <rect x="500" y="210" rx="8" ry="8" width="200" height="44" className="node" />
                <text x="600" y="232" textAnchor="middle" dominantBaseline="middle" className="label">Gateway · KMS · Oracle</text>

                <rect x="760" y="60" rx="8" ry="8" width="240" height="44" className="node" />
                <text x="880" y="82" textAnchor="middle" dominantBaseline="middle" className="label">User Decrypt / Public Reveal</text>

                {/* Arrows: encryption */}
                <path d="M200,82 L240,82" stroke="currentColor" fill="none" markerEnd="url(#arrow)" />
                <text x="220" y="58" className="label">encrypt vote</text>

                <path d="M420,82 L460,82" stroke="currentColor" fill="none" markerEnd="url(#arrow)" />
                <text x="440" y="58" className="label">enc vote + proof</text>

                {/* Computation in contract */}
                <text x="570" y="130" textAnchor="middle" className="label">FHE.fromExternal → FHE.add/select</text>

                {/* Decryption request */}
                <path d="M540,100 L540,210" stroke="currentColor" fill="none" markerEnd="url(#arrow)" />
                <text x="552" y="160" className="label">requestDecryption</text>

                {/* Oracle callback up */}
                <path d="M660,210 L660,100" stroke="currentColor" fill="none" markerEnd="url(#arrow)" />
                <text x="672" y="160" className="label">checkSignatures → callback</text>

                {/* Public reveal to frontend */}
                <path d="M680,82 L760,82" stroke="currentColor" fill="none" markerEnd="url(#arrow)" />
                <text x="720" y="58" className="label">revealed tallies</text>

                {/* Private user decrypt path (hinted, non-overlapping) */}
                <path d="M880,100 C880,150 760,170 700,170" stroke="currentColor" fill="none" strokeDasharray="4 4" />
                <path d="M700,170 L712,170" stroke="currentColor" markerEnd="url(#arrow)" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Advanced flow modal (image preview) */}
      <Dialog open={showFlowModal} onOpenChange={setShowFlowModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Advanced end-to-end flow</DialogTitle>
            <DialogDescription>
              This diagram mirrors the architecture from the screenshots. Toggle the theme to view the light/dark variants.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2 pb-2">
            <Label htmlFor="adv-flow-theme" className="text-xs">Dark image</Label>
            <Switch id="adv-flow-theme" checked={isPreviewDark} onCheckedChange={setIsPreviewDark} />
          </div>
          <div className="rounded-md overflow-hidden border">
            <img
              src={isPreviewDark ? '/bmode.png' : '/wmod.png'}
              alt={isPreviewDark ? 'Advanced flow (dark)' : 'Advanced flow (light)'}
              className="w-full h-auto block"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Mermaid detailed modal */}
      <Dialog open={showMermaidModal} onOpenChange={(v) => { setShowMermaidModal(v); if (!v) { setZoom(1); setPan({ x: 0, y: 0 }); } }}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Detailed sequence flow</DialogTitle>
            <DialogDescription>Zoom with mouse wheel, drag to pan. Double‑click diagram to toggle fullscreen.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2 pb-2">
            <span className="text-xs text-muted-foreground">Theme follows app</span>
            <Button size="sm" variant="outline" onClick={toggleFullscreen}>
              {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); renderMermaid(); }}>
              Reset view
            </Button>
          </div>
          <div
            ref={wrapperRef}
            className={`relative w-full ${isFullscreen ? 'h-[100svh]' : 'h-[78vh]'} bg-muted rounded-md overflow-auto border ${isPanningRef.current ? 'cursor-grabbing' : 'cursor-grab'}`}
            onWheel={onWheelZoom}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUpLeave}
            onMouseLeave={onMouseUpLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onDoubleClick={toggleFullscreen}
          >
            <div
              ref={mermaidContainerRef}
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
              className="min-w-[1100px] min-h-[700px]"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Proof Explainer & Type Sizing Tips (additive) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="grid md:grid-cols-2 gap-3"
      >
        <Card className="tutorial-step">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4" /> Why do we include a proof?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Button size="sm" variant="outline" onClick={() => setShowProofExplainer(!showProofExplainer)}>
              {showProofExplainer ? 'Hide' : 'Show'} explainer
            </Button>
            <AnimatePresence>
              {showProofExplainer && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                  <p>FHE.fromExternal requires a validity proof to safely ingest user-encrypted inputs. This prevents malformed ciphertexts from corrupting state or leaking info via errors.</p>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>Integrity: ciphertexts are well-formed</li>
                    <li>Soundness: matches user’s claimed plaintext domain</li>
                    <li>Consistency: avoids side-channel data-dependent branches</li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Card className="tutorial-step">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4" /> Type sizing tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Button size="sm" variant="outline" onClick={() => setShowTypeTips(!showTypeTips)}>
              {showTypeTips ? 'Hide' : 'Show'} tips
            </Button>
            <AnimatePresence>
              {showTypeTips && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                  <p>Prefer the smallest encrypted type that fits. Smaller widths can be cheaper/faster to operate on.</p>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>Binary choices: euint8</li>
                    <li>Small counters: euint16 / euint32</li>
                    <li>Large values only when necessary: euint64+</li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* FHE Educational Slides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="text-center px-4 sm:px-0">
          <h2 className="text-lg sm:text-xl font-bold mb-2">Understanding FHE & Zama Protocol</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">8 key concepts you'll master in this tutorial</p>
        </div>

        {/* Slide Container */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-start sm:space-x-3 space-y-3 sm:space-y-0">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-md">
                        {React.createElement(fheSlides[currentSlide].icon, {
                          className: "w-5 h-5 text-primary"
                        })}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold mb-2">
                          {fheSlides[currentSlide].title}
                        </h3>
                        
                        {/* Technical/Layman Toggle */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                          <Button
                            variant={!showTechnicalView ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowTechnicalView(false)}
                            className="text-xs w-full sm:w-auto"
                          >
                            <Brain className="w-3 h-3 mr-1" />
                            Layman's View
                          </Button>
                          <Button
                            variant={showTechnicalView ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowTechnicalView(true)}
                            className="text-xs w-full sm:w-auto"
                          >
                            <Code2 className="w-3 h-3 mr-1" />
                            Technical View
                          </Button>
                        </div>

                        {/* Content based on view */}
                        <div className="space-y-2">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <h4 className="font-semibold text-sm mb-1">
                              {showTechnicalView ? fheSlides[currentSlide].technical.title : fheSlides[currentSlide].layman.title}
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {showTechnicalView ? fheSlides[currentSlide].technical.content : fheSlides[currentSlide].layman.content}
                            </p>
                          </div>

                          {/* Visual Description */}
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-2">
                            <p className="text-primary font-semibold text-center text-xs">
                              📊 {fheSlides[currentSlide].visual}
                            </p>
                          </div>

                          {/* Code Example */}
                          {fheSlides[currentSlide].code && (
                            <div className="relative">
                              <div className="bg-muted rounded-lg p-3">
                                <pre className="text-xs whitespace-pre-wrap break-words">
                                  <code>{fheSlides[currentSlide].code}</code>
                                </pre>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => copyToClipboard(fheSlides[currentSlide].code || '', `slide-${currentSlide}-code`)}
                              >
                                {copiedId === `slide-${currentSlide}-code` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-3 px-4 sm:px-0">
            <Button
              onClick={prevSlide}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="text-xs">Previous</span>
            </Button>

            {/* Slide Indicators */}
            <div className="hidden sm:flex space-x-1">
              {fheSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextSlide}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <span className="text-xs">Next</span>
              <ArrowRightIcon className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Reference Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="font-display text-lg font-semibold text-center">Quick Reference</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Card className="tutorial-step">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Key className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Key Types</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    euint8, euint16, euint32, euint64, ebool, eaddress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="tutorial-step">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Calculator className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Operations</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    add, sub, mul, div, eq, lt, gt, and, or, xor
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="tutorial-step">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Access Control</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    FHE.allow, FHE.makePubliclyDecryptable
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="tutorial-step">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Network className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Decryption</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Public (everyone) or Private (user only)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Detailed Technical Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="font-display text-lg font-semibold text-center">Detailed Technical Reference</h2>
        <Card className="tutorial-step">
          <CardContent className="p-4">
            <Accordion type="multiple" className="w-full">

              <AccordionItem value="fhe-101">
                <AccordionTrigger>
                  <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> FHE 101: What and Why</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p><strong>Layman:</strong> FHE is like doing math on locked boxes. You can add boxes together without opening them.</p>
                    <p><strong>Technical:</strong> FHE enables evaluation of arithmetic/logic circuits on ciphertexts; decrypting the result matches the plaintext computation. It preserves privacy during computation.</p>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">Key properties</h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Semantic security of ciphertexts</li>
                        <li>Supported ops: addition, multiplication, comparisons (via TFHE in FHEVM)</li>
                        <li>Access control for decryption (authorized reveal only)</li>
                      </ul>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Privacy during computation, not just at rest/in transit.</li>
                      <li>Operations on ciphertexts mirror operations on plaintexts ("homomorphic").</li>
                      <li>Great for voting, counters, private comparisons, risk scoring, more.</li>
                    </ul>
                    <a className="underline text-xs" href="https://docs.zama.ai/" target="_blank" rel="noreferrer">Zama: FHEVM Docs</a>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fhevm-overview">
                <AccordionTrigger>
                  <span className="flex items-center gap-2"><Layers className="h-4 w-4" /> FHEVM: Encrypted Types in Smart Contracts</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p><strong>Layman:</strong> FHEVM is an Ethereum-like computer that understands locked numbers.</p>
                    <p><strong>Technical:</strong> Zama's EVM-compatible runtime exposing FHE types (<code>ebool</code>, <code>euintX</code>) and ops via <code>FHE.sol</code>. Contracts operate on ciphertexts; decryption is controlled via permissions and callbacks.</p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Types: <code>ebool</code>, <code>euint8/16/32/64</code>.</li>
                      <li>Ops: <code>add</code>, <code>sub</code>, <code>mul</code>, comparisons, logical, bitwise, <code>select</code>.</li>
                      <li>Gatekeeping: <code>allowThis</code> marks which ciphertexts the contract can request to decrypt later.</li>
                    </ul>
                    <a className="underline text-xs" href="https://docs.zama.ai/protocol/solidity-guides/smart-contract/inputs" target="_blank" rel="noreferrer">Zama: FHEVM Docs</a>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="relayer">
                <AccordionTrigger>
                  <span className="flex items-center gap-2"><Network className="h-4 w-4" /> Relayer & Decryption Ceremony</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p><strong>Layman:</strong> A trusted set of network servers can open only the final total and send it back.</p>
                    <p><strong>Technical flow:</strong> client encrypts → contract computes on ciphertexts → contract calls <code>requestDecryption</code> for aggregates → relayer/oracle returns plaintext via callback after verifying signatures with <code>checkSignatures</code>.</p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Never decrypt individual votes, only totals.</li>
                      <li>Map <code>requestId</code> → proposal to handle the callback.</li>
                      <li>Keep ciphertext permissions tight with <code>allowThis</code>.</li>
                    </ul>
                    <a className="underline text-xs" href="https://docs.zama.ai/protocol/relayer-sdk-guides/fhevm-relayer/decryption" target="_blank" rel="noreferrer">Zama: Decryption & Callbacks</a>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="relayer-sdk">
                <AccordionTrigger>
                  <span className="flex items-center gap-2"><Code2 className="h-4 w-4" /> Relayer SDK: Initialize, Encrypt, Decrypt</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p><strong>What it does:</strong> Loads WASM, creates an FHE instance bound to your network, encrypts values locally, and lets you request decryption of aggregates via the relayer. You use the encrypted handles in contract calls.</p>
                    <div className="relative">
                      <div className="bg-muted rounded-lg p-3">
                        <pre className="text-xs overflow-x-auto"><code>{`import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

let fheInstance: any = null;

export async function initializeFheInstance() {
  await initSDK(); // Loads WASM
  const config = { ...SepoliaConfig, network: (window as any).ethereum };
  fheInstance = await createInstance(config);
  return fheInstance;
}

export function getFheInstance() {
  return fheInstance;
}

// Decrypt a single encrypted value using the relayer
export async function decryptValue(encryptedBytes: string): Promise<number> {
  const fhe = getFheInstance();
  if (!fhe) throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');

  try {
    let handle = encryptedBytes;
    if (typeof handle === 'string' && handle.startsWith('0x') && handle.length === 66) {
      const values = await fhe.publicDecrypt([handle]);
      return Number(values[handle]);
    } else {
      throw new Error('Invalid ciphertext handle for decryption');
    }
  } catch (error: any) {
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      throw new Error('Decryption service is temporarily unavailable. Please try again later.');
    }
    throw error;
  }
}`}</code></pre>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(`import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';\n\nlet fheInstance: any = null;\n\nexport async function initializeFheInstance() {\n  await initSDK(); // Loads WASM\n  const config = { ...SepoliaConfig, network: (window as any).ethereum };\n  fheInstance = await createInstance(config);\n  return fheInstance;\n}\n\nexport function getFheInstance() {\n  return fheInstance;\n}\n\n// Decrypt a single encrypted value using the relayer\nexport async function decryptValue(encryptedBytes: string): Promise<number> {\n  const fhe = getFheInstance();\n  if (!fhe) throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');\n\n  try {\n    let handle = encryptedBytes;\n    if (typeof handle === 'string' && handle.startsWith('0x') && handle.length === 66) {\n      const values = await fhe.publicDecrypt([handle]);\n      return Number(values[handle]);\n    } else {\n      throw new Error('Invalid ciphertext handle for decryption');\n    }\n  } catch (error: any) {\n    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {\n      throw new Error('Decryption service is temporarily unavailable. Please try again later.');\n    }\n    throw error;\n  }\n}`, 'relayer-sdk-snippet')}
                      >
                        {copiedId === 'relayer-sdk-snippet' ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Why this matters: the SDK handles WASM crypto, keys, and relayer coordination so your frontend can encrypt locally and request authorized decryptions of aggregates. Pair this with contract-side <code>requestDecryption</code> and <code>checkSignatures</code> to complete the loop.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reference: <a className="underline" href="https://docs.zama.ai/" target="_blank" rel="noreferrer">FHEVM Documentation</a>
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="types-ops">
                <AccordionTrigger>
                  <span className="flex items-center gap-2"><Layers className="h-4 w-4" /> Data Types & Operations</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>Use the smallest encrypted type that fits to keep costs down. Encrypted integers come in widths (euint8/16/32/64/256). Smaller widths are typically cheaper and faster.</p>
                    <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
                      <p className="font-semibold">Common operations you can use on encrypted values:</p>
                      <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                        <li><strong>Arithmetic</strong>: FHE.add, FHE.sub, FHE.mul, FHE.div (plaintext divisor), FHE.rem (plaintext divisor)</li>
                        <li><strong>Bitwise</strong>: FHE.and, FHE.or, FHE.xor, FHE.not, FHE.shr, FHE.shl, FHE.rotr, FHE.rotl</li>
                        <li><strong>Comparisons</strong>: FHE.eq, FHE.ne, FHE.ge, FHE.gt, FHE.le, FHE.lt</li>
                        <li><strong>Ternary select</strong>: FHE.select(ebool condition, a, b)</li>
                        <li><strong>Random</strong>: FHE.randEuintX() to generate on-chain random encrypted integers</li>
                      </ul>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs">
                      <p className="font-semibold">Tip</p>
                      <p>Prefer scalar operands when available (e.g., FHE.add(x, 42)) instead of encrypting constants; it saves gas while producing the same encrypted result.</p>
                    </div>
                    <a className="underline text-xs" href="https://docs.zama.ai/protocol/solidity-guides/v0.7/smart-contract/operations" target="_blank" rel="noreferrer">Zama: FHEVM Operations Reference</a>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Best Practices Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              FHEVM Best Practices
            </CardTitle>
            <CardDescription>
              Essential guidelines for building secure and efficient FHEVM applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Smart Contract Best Practices */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Code2 className="h-4 w-4 text-green-600" />
                Smart Contract (Solidity) Best Practices
              </h4>
              <div className="space-y-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">🔒 Avoid FHE in view/pure functions</p>
                  <p className="text-xs text-muted-foreground">FHE operations require offchain coprocessors → they won't execute inside a view function. Always use state-changing transactions for computations.</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">🔑 Use FHE.allow / FHE.allowTransient wisely</p>
                  <p className="text-xs text-muted-foreground">Grant access only to trusted contracts/users. Use allowTransient for temporary sharing within a single transaction. Don't over-grant access, similar to not approving unlimited ERC20 allowances.</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">🌐 Leverage FHE.makePubliclyDecryptable only when necessary</p>
                  <p className="text-xs text-muted-foreground">Making values publicly decryptable means anyone can see them. Only use when transparency is required (e.g., final auction results).</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">🔀 Branch securely with FHE.select</p>
                  <p className="text-xs text-muted-foreground">You can't use encrypted booleans in if/else. Use FHE.select to choose between values without leaking conditions.</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">⚠️ Be mindful of unsupported types/ops</p>
                  <p className="text-xs text-muted-foreground">eaddress and euint256 only support comparisons and bitwise ops (not math). Always check library docs for valid operations.</p>
                </div>
              </div>
            </div>

            {/* Frontend Best Practices */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                Frontend (Relayer SDK) Best Practices
              </h4>
              <div className="space-y-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">🔐 Encrypt inputs via createEncryptedInput</p>
                  <p className="text-xs text-muted-foreground">Always use the SDK's encryption before sending values onchain. Never attempt to "DIY encrypt" values manually.</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">👤 Use userDecrypt for private reads</p>
                  <p className="text-xs text-muted-foreground">For balances or private states, require the user's wallet signature (EIP-712). This ensures only the rightful user can see their data.</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">🌍 Use publicDecrypt only when appropriate</p>
                  <p className="text-xs text-muted-foreground">For values meant to be globally visible (e.g., governance results). Avoid leaking sensitive states.</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">📱 Plan UX for encrypted balances</p>
                  <p className="text-xs text-muted-foreground">Users won't see balances in MetaMask. Build a dApp dashboard that integrates re-encryption and decryption flows.</p>
                </div>
              </div>
            </div>

            {/* General Best Practices */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Scale className="h-4 w-4 text-purple-600" />
                General Best Practices
              </h4>
              <div className="space-y-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">⚖️ Minimize decryptions</p>
                  <p className="text-xs text-muted-foreground">Each decryption requires coordination with the KMS and Gateway. Batch requests when possible.</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">⛽ Gas considerations</p>
                  <p className="text-xs text-muted-foreground">Symbolic FHE ops are cheap onchain, but heavy ops (mul/div) increase offchain compute load—optimize where possible.</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">🔍 Audit access control flows</p>
                  <p className="text-xs text-muted-foreground">Encrypted states are powerful, but mishandling allow rules can leak or lock data.</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-xs mb-2">🛡️ Think privacy by design</p>
                  <p className="text-xs text-muted-foreground">Decide upfront which data must remain private vs. which can eventually be public.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quiz Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <FheBasicsQuiz />
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Button onClick={handleContinue} size="lg" className="gap-2">
          Continue to Write Contract
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Ready to write your first FHEVM contract!
        </p>
      </motion.div>
    </div>
  );
};