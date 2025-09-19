import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  ArrowRight, 
  Star, 
  Trophy, 
  Zap, 
  Shield,
  Brain,
  BookOpen,
  TestTube,
  Vote,
  Target
} from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepTitle: string;
  stepNumber: number;
  nextStepTitle?: string;
  onContinue?: () => void;
}

const stepMessages = {
  'environment-setup': {
    title: "Environment Ready! 🚀",
    message: "Perfect! Your development environment is all set up. You're ready to start building confidential applications.",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950"
  },
  'connect-wallet': {
    title: "Wallet Connected! 🔗",
    message: "Excellent! Your wallet is connected and ready to interact with the blockchain. You're one step closer to building your first FHE dApp.",
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950"
  },
  'fhe-basics': {
    title: "FHE Mastery Unlocked! 🧠",
    message: "Amazing! You now understand the fundamentals of Fully Homomorphic Encryption. You're ready to see it in action.",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950"
  },
  'contract-overview': {
    title: "Smart Contract Decoded! 📚",
    message: "Fantastic! You've learned how FHE is implemented in smart contracts. Time to see the magic happen live.",
    icon: BookOpen,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950"
  },
  'testing-playground': {
    title: "Testing Champion! 🧪",
    message: "Incredible! You've successfully tested FHE operations. You're now ready to build your first confidential dApp.",
    icon: TestTube,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-950"
  },
  'private-voting': {
    title: "Privacy Pioneer! 🗳️",
    message: "Outstanding! You've built and tested a complete confidential voting dApp. You're now a certified FHEVM developer!",
    icon: Vote,
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950"
  }
};

const motivationalQuotes = [
  "You're building the future of privacy! 🔐",
  "Every encrypted computation counts! ⚡",
  "You're making blockchain truly confidential! 🌟",
  "Privacy by design, one step at a time! 🛡️",
  "You're unlocking new possibilities! 🚀",
  "Confidential computing is the future! 💎"
];

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  stepTitle,
  stepNumber,
  nextStepTitle,
  onContinue
}) => {
  const stepConfig = stepMessages[stepTitle as keyof typeof stepMessages] || {
    title: "Step Complete! 🎉",
    message: "Great job! You've completed another step in your FHEVM journey.",
    icon: CheckCircle,
    color: "text-primary",
    bgColor: "bg-primary/10"
  };

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const IconComponent = stepConfig.icon;

  // Trigger confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      // Auto-close after 2 seconds
      const closeTimer = setTimeout(() => onClose(), 5000);
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire confetti from multiple positions
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });

        confetti({
          ...defaults,
          particleCount,
          origin: { x: 0.5, y: Math.random() - 0.2 }
        });
      }, 250);

      return () => { clearInterval(interval); clearTimeout(closeTimer); };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg mx-4"
        >
          <Card className="tutorial-step border-2 border-primary/20 shadow-2xl">
            <CardContent className="p-8 text-center space-y-6">
              {/* Celebration Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 10, stiffness: 200 }}
                className={`w-20 h-20 mx-auto rounded-full ${stepConfig.bgColor} flex items-center justify-center`}
              >
                <IconComponent className={`w-10 h-10 ${stepConfig.color}`} />
              </motion.div>

              {/* Step Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Badge variant="secondary" className="text-sm">
                  Step {stepNumber} Complete
                </Badge>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-primary"
              >
                {stepConfig.title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground leading-relaxed"
              >
                {stepConfig.message}
              </motion.p>

              {/* Motivational Quote */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-primary/10 border border-primary/20 rounded-lg p-4"
              >
                <p className="text-sm font-medium text-primary">
                  {randomQuote}
                </p>
              </motion.div>

              {/* Progress Indicator */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <Trophy className="w-4 h-4" />
                <span>You're {Math.round((stepNumber / 8) * 100)}% through the tutorial!</span>
              </motion.div>

              {/* No action buttons; auto-dismiss */}

              {/* Stars Animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex justify-center gap-1"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ 
                      delay: 1 + i * 0.1, 
                      type: "spring", 
                      damping: 10, 
                      stiffness: 200 
                    }}
                  >
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
