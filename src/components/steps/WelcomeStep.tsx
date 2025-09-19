import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft,
  Shield, 
  Vote, 
  Lock, 
  Eye,
  Zap,
  Users,
  CheckCircle,
  Brain,
  Cpu,
  Key,
  Database,
  Globe,
  Target,
  TrendingUp,
  Building2,
  DollarSign,
  FileText
} from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';

export const WelcomeStep: React.FC = () => {
  const { setCurrentStep, completeStep, triggerConfetti } = useTutorialStore();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBeginnerPanel, setShowBeginnerPanel] = useState(true);

  const handleStartTutorial = () => {
    completeStep('welcome');
    setCurrentStep('environment-setup');
    navigate('/step/environment-setup');
  };

  const handleImNewToFHE = () => {
    completeStep('welcome');
    setCurrentStep('fhe-basics');
    navigate('/step/fhe-basics');
  };

  const handleSkipIntro = () => {
    completeStep('welcome');
    setCurrentStep('environment-setup');
    navigate('/step/environment-setup');
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % educationalSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + educationalSlides.length) % educationalSlides.length);
  };

  const educationalSlides = [
    {
      id: 1,
      title: "What is Fully Homomorphic Encryption?",
      icon: Brain,
      content: "FHE allows computation on encrypted data without ever decrypting it. Think of it as performing math on a locked safe - you can add, subtract, and calculate inside without ever seeing the contents.",
      highlight: "Computation on encrypted data without decryption"
    },
    {
      id: 2,
      title: "The Zama Protocol",
      icon: Globe,
      content: "Zama is building the future of privacy-preserving applications. Their FHEVM brings homomorphic encryption to Ethereum, enabling confidential smart contracts that protect user data.",
      highlight: "Privacy-preserving applications on Ethereum"
    },
    {
      id: 3,
      title: "Client-Side Encryption",
      icon: Key,
      content: "Data is encrypted on your device before being sent to the blockchain. Only you have the decryption key, ensuring your private information never leaves your control in plaintext.",
      highlight: "Encrypt locally, compute globally"
    },
    {
      id: 4,
      title: "On-Chain Computation",
      icon: Cpu,
      content: "Smart contracts can perform complex calculations on encrypted data using FHE operations. The blockchain processes your encrypted inputs and produces encrypted outputs.",
      highlight: "Smart contracts that compute on encrypted data"
    },
    {
      id: 5,
      title: "Selective Decryption",
      icon: Eye,
      content: "Only specific results are revealed when needed. Individual inputs stay private forever, but final outcomes can be decrypted and made public for transparency.",
      highlight: "Reveal only what's necessary"
    },
    {
      id: 6,
      title: "Trustless Privacy",
      icon: Shield,
      content: "No trusted third parties needed. Cryptography guarantees privacy - not promises from companies. The math itself ensures your data stays confidential.",
      highlight: "Privacy guaranteed by mathematics"
    },
    {
      id: 7,
      title: "Real-World Applications",
      icon: Target,
      content: "Private voting, confidential auctions, secure machine learning, private financial transactions, and more. FHE enables applications that were impossible before.",
      highlight: "Unlock new possibilities for privacy"
    }
  ];

  const features = [
    {
      icon: Lock,
      title: "Private Inputs",
      description: "Your votes are encrypted before leaving your device"
    },
    {
      icon: Zap,
      title: "On-chain Computation",
      description: "Smart contracts count votes without seeing individual choices"
    },
    {
      icon: Eye,
      title: "Selective Transparency",
      description: "Only final results are revealed, individual votes stay private"
    },
    {
      icon: Users,
      title: "Trustless Process",
      description: "No trusted intermediary needed - cryptography guarantees privacy"
    }
  ];

  const fheImpact = [
    {
      icon: DollarSign,
      title: "$100T+ Tokenization",
      description: "Financial assets moving onchain with confidentiality"
    },
    {
      icon: Building2,
      title: "Enterprise Adoption",
      description: "TradFi institutions can use public blockchains"
    },
    {
      icon: TrendingUp,
      title: "Mass Adoption",
      description: "Confidentiality enables blockchain's true potential"
    },
    {
      icon: FileText,
      title: "Compliance Built-in",
      description: "KYC/AML checks embedded in smart contracts"
    }
  ];

  const learningGoals = [
    "Encrypt data using fhevmjs client library",
    "Deploy and interact with FHE-enabled smart contracts", 
    "Perform computations on encrypted data on-chain",
    "Implement controlled decryption for results",
    "Build a complete confidential dApp from scratch"
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm">
            🎓 Interactive Tutorial
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Ship Your First <span className="text-primary">FHEVM</span> dApp 🚀
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Learn to build your first <strong>confidential application</strong> on the Zama Protocol. 
            Create a private voting system where individual choices stay secret, but the final tally is transparent.
          </p>
        </div>

        {/* FHE Backstory & Importance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="tutorial-step border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-primary">The Blockchain Confidentiality Revolution</h2>
                  <p className="text-muted-foreground">Why FHE changes everything for blockchain adoption</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-primary flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      The Problem
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Blockchains solve trust by making everything public, but this creates a fundamental conflict: 
                      the data we want to protect (money, identity, votes) is highly sensitive. Without confidentiality, 
                      blockchain cannot reach mass adoption.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-primary flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      The Solution
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Zama's FHEVM brings <strong>end-to-end encryption</strong> to smart contracts. Data is encrypted 
                      on your device, computed on-chain without decryption, and only specific results are revealed. 
                      It's like HTTPS for blockchain - the next natural step.
                    </p>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-center text-sm font-medium text-primary">
                    💡 <strong>This tutorial teaches you the technology that will power $100T+ in confidential financial transactions</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Beginner Fast-Track Panel (additive, non-destructive) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="tutorial-step">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Beginner Fast-Track</span>
              <Button size="sm" variant="outline" onClick={() => setShowBeginnerPanel(!showBeginnerPanel)}>
                {showBeginnerPanel ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {showBeginnerPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-muted rounded p-3">
                      <p className="font-semibold mb-2">What you’ll ship today</p>
                      <p className="text-muted-foreground">A private voting dApp on Sepolia: encrypt locally → compute on-chain → reveal tallies.</p>
                    </div>
                    <div className="bg-muted rounded p-3">
                      <p className="font-semibold mb-2">Beginner checklist (2–3 min)</p>
                      <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                        <li>Install MetaMask (or compatible wallet)</li>
                        <li>Switch/Add Sepolia testnet, grab faucet ETH</li>
                        <li>Install Node 18+, pnpm; copy .env files</li>
                        <li>Deploy contract, set VITE_VOTING_CONTRACT_ADDRESS</li>
                        <li>Run dev server and open the app</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleImNewToFHE} variant="outline" className="gap-2">
                      I’m new to FHE — teach me first
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button onClick={handleSkipIntro} className="gap-2">
                      Skip intro — set up environment
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Educational Slides Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Understanding FHE & Zama Protocol</h2>
          <p className="text-muted-foreground">7 key concepts you'll master in this tutorial</p>
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
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shadow-md">
                        {React.createElement(educationalSlides[currentSlide].icon, {
                          className: "w-6 h-6 text-primary"
                        })}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold mb-1">
                          {educationalSlides[currentSlide].title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {educationalSlides[currentSlide].content}
                        </p>
                      </div>
                      
                      {/* Highlight */}
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                        <p className="text-primary font-semibold text-center text-sm">
                          💡 {educationalSlides[currentSlide].highlight}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <Button
              onClick={prevSlide}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="text-sm">Previous</span>
            </Button>

            {/* Slide Indicators */}
            <div className="flex space-x-1">
              {educationalSlides.map((_, index) => (
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
              className="flex items-center space-x-2"
            >
              <span className="text-sm">Next</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Compact Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h2 className="font-display text-xl font-semibold text-center mb-4">
          Why This Tutorial Matters
        </h2>
        <div className="grid md:grid-cols-4 gap-2">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
            >
              <Card className="tutorial-step h-full">
                <CardContent className="p-3">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-xs">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FHE Impact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h2 className="font-display text-xl font-semibold text-center mb-4">
          The FHE Revolution Impact
        </h2>
        <div className="grid md:grid-cols-4 gap-2">
          {fheImpact.map((impact, index) => (
            <motion.div
              key={impact.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
            >
              <Card className="tutorial-step h-full border-success/20 bg-gradient-to-br from-success/5 to-success/10">
                <CardContent className="p-3">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center mx-auto">
                      <impact.icon className="h-4 w-4 text-success" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-xs text-success">{impact.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {impact.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Compact Learning Goals & Prerequisites */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <Card className="tutorial-step">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              What You'll Learn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {learningGoals.map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                className="flex items-start gap-2"
              >
                <CheckCircle className="h-3 w-3 text-success mt-1 flex-shrink-0" />
                <span className="text-xs">{goal}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="tutorial-step">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">📋 Prerequisites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-xs space-y-1">
              <p>✅ Basic JavaScript/TypeScript knowledge</p>
              <p>✅ Familiarity with React (helpful but not required)</p>
              <p>✅ MetaMask or compatible wallet</p>
              <p>✅ Node.js 18+ installed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="tutorial-step">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">⏱️ Time Estimate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-xs space-y-1">
              <p>🚀 <strong>Total:</strong> ~30 minutes</p>
              <p>📖 <strong>Reading:</strong> 10 minutes</p>
              <p>⌨️ <strong>Coding:</strong> 15 minutes</p>
              <p>🧪 <strong>Testing:</strong> 5 minutes</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="text-center"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            You’re about to learn Zama FHEVM by building a complete, reproducible dApp. By the end, you’ll encrypt inputs, compute on-chain, and reveal results — your first confidential app, shipped.
          </p>
          <Button
            onClick={handleStartTutorial}
            size="lg"
            className="gap-2 px-8 py-6 text-lg font-semibold animate-pulse-glow"
          >
            Start Tutorial
            <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="text-xs text-muted-foreground">
            No blockchain experience? No problem! We'll guide you through everything.
          </p>
        </div>
      </motion.div>
    </div>
  );
};