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
  Target
} from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';

export const WelcomeStep: React.FC = () => {
  const { setCurrentStep, completeStep } = useTutorialStore();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleStartTutorial = () => {
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

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h2 className="font-display text-xl font-semibold text-center mb-4">
          Why This Tutorial Matters
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
            >
              <Card className="tutorial-step h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
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

      {/* Learning Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <Card className="tutorial-step">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-4 w-4 text-primary" />
              What You'll Learn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {learningGoals.map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                className="flex items-start gap-2"
              >
                <CheckCircle className="h-3 w-3 text-success mt-1 flex-shrink-0" />
                <span className="text-xs">{goal}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Prerequisites & Time Estimate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="grid md:grid-cols-2 gap-4"
      >
        <Card className="tutorial-step">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">📋 Prerequisites</CardTitle>
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
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">⏱️ Time Estimate</CardTitle>
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