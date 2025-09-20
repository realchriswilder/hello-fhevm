import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Play, 
  Lock, 
  Home,
  Settings,
  Wifi,
  Shield,
  Vote,
  Rocket,
  BookOpen,
  TestTube
} from 'lucide-react';
import { useTutorialStore, TutorialStep } from '@/state/tutorialStore';
import { cn } from '@/lib/utils';

const steps: {
  id: TutorialStep;
  title: string;
  description: string;
  icon: React.ElementType;
  estimatedTime: string;
}[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Introduction to FHEVM',
    icon: Home,
    estimatedTime: '2 min'
  },
  {
    id: 'environment-setup',
    title: 'Environment Setup',
    description: 'Install dependencies',
    icon: Settings,
    estimatedTime: '5 min'
  },
  {
    id: 'connect-wallet',
    title: 'Connect Wallet',
    description: 'Wallet & Network setup',
    icon: Wifi,
    estimatedTime: '3 min'
  },
  {
    id: 'fhe-basics',
    title: 'FHE Basics',
    description: 'Learn encryption concepts',
    icon: Shield,
    estimatedTime: '8 min'
  },
  {
    id: 'write-contract',
    title: 'Write Contract',
    description: 'Build your first FHEVM contract',
    icon: BookOpen,
    estimatedTime: '10 min'
  },
  {
    id: 'contract-overview',
    title: 'Contract Overview',
    description: 'Vote contract overview',
    icon: BookOpen,
    estimatedTime: '6 min'
  },
  {
    id: 'deploy-test-counter',
    title: 'Simulate & Test Counter',
    description: 'Simulate FHE counter deployment and test live',
    icon: Rocket,
    estimatedTime: '8 min'
  },
  {
    id: 'testing-playground',
    title: 'Testing Playground',
    description: 'Test FHE operations live',
    icon: TestTube,
    estimatedTime: '15 min'
  },
  {
    id: 'private-voting',
    title: 'Private Voting Demo',
    description: 'Test the voting dApp on Sepolia',
    icon: Vote,
    estimatedTime: '10 min'
  },
  {
    id: 'review',
    title: 'Review & Next Steps',
    description: 'Summary and resources',
    icon: BookOpen,
    estimatedTime: '5 min'
  }
];

interface NavigationProps {
  isOpen: boolean;
  onStepSelect?: (step: TutorialStep) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  isOpen, 
  onStepSelect 
}) => {
  const { 
    currentStep, 
    completedSteps, 
    getStepNumber, 
    isStepCompleted, 
    canAccessStep,
    setCurrentStep,
    triggerConfetti
  } = useTutorialStore();

  const totalSteps = steps.length;
  const completedCount = completedSteps.size;
  const progressPercentage = (completedCount / totalSteps) * 100;

  const handleStepClick = (stepId: TutorialStep) => {
    if (canAccessStep(stepId)) {
      // Prevent confetti when navigating back to already-completed steps
      const isCompleted = isStepCompleted(stepId);
      if (!isCompleted) {
        const confettiSteps = ['environment-setup', 'connect-wallet', 'fhe-basics', 'write-contract', 'contract-overview', 'deploy-test-counter', 'testing-playground', 'private-voting'];
        if (confettiSteps.includes(stepId)) {
          triggerConfetti();
        }
      }

      setCurrentStep(stepId);
      onStepSelect?.(stepId);
    }
  };

  const StepIcon = ({ step, isActive, isCompleted }: {
    step: typeof steps[0];
    isActive: boolean;
    isCompleted: boolean;
  }) => {
    const IconComponent = step.icon;
    
    if (isCompleted) {
      return (
        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-success-foreground">
          <Check className="h-4 w-4" />
        </div>
      );
    }
    
    if (isActive) {
      return (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground animate-pulse-glow">
          <Play className="h-4 w-4" />
        </div>
      );
    }
    
    return (
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center border-2",
        canAccessStep(step.id) 
          ? "border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary" 
          : "border-muted text-muted"
      )}>
        {canAccessStep(step.id) ? (
          <IconComponent className="h-4 w-4" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed lg:static inset-y-0 left-0 z-40 w-70 bg-sidebar border-r border-sidebar-border lg:translate-x-0 h-screen overflow-y-auto"
        >
          <div className="flex h-full flex-col">
            {/* Progress Header */}
            <div className="p-6 border-b border-sidebar-border">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">
                    Tutorial Progress
                  </h2>
                  <Badge variant="secondary">
                    {completedCount}/{totalSteps}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={progressPercentage} 
                    className="h-2" 
                  />
                  <p className="text-sm text-muted-foreground">
                    {Math.round(progressPercentage)}% Complete
                  </p>
                </div>
              </div>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-1">
                {steps.map((step, index) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = isStepCompleted(step.id);
                  const canAccess = canAccessStep(step.id);
                  const stepNumber = getStepNumber(step.id);

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NavLink
                        to={`/step/${step.id}`}
                        className={({ isActive: linkActive }) => cn(
                          "block w-full",
                          !canAccess && "cursor-not-allowed"
                        )}
                        onClick={(e) => {
                          if (!canAccess) {
                            e.preventDefault();
                            return;
                          }
                          handleStepClick(step.id);
                        }}
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start p-3 h-auto text-left transition-all",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                            !canAccess && "opacity-50 cursor-not-allowed"
                          )}
                          disabled={!canAccess}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <StepIcon 
                              step={step} 
                              isActive={isActive} 
                              isCompleted={isCompleted} 
                            />
                            
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {stepNumber}. {step.title}
                                </span>
                                {isActive && (
                                  <Badge variant="default" className="text-xs">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground">
                                {step.description}
                              </p>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>📚 {step.estimatedTime}</span>
                                {isCompleted && (
                                  <span className="text-success">✅ Complete</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Button>
                      </NavLink>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border">
              <div className="text-xs text-muted-foreground space-y-2">
                <p>💡 <strong>Tip:</strong> Complete steps in order to unlock new content.</p>
                <p>🎯 <strong>Goal:</strong> Build your first confidential dApp!</p>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};