import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TutorialStep = 
  | 'welcome' 
  | 'environment-setup' 
  | 'connect-wallet' 
  | 'fhe-basics' 
  | 'contract-overview'
  | 'private-voting' 
  | 'testing-playground'
  | 'review';

export interface TutorialState {
  currentStep: TutorialStep;
  completedSteps: Set<TutorialStep>;
  sidebarOpen: boolean;
  activeTab: 'layman' | 'technical';
  progress: Record<TutorialStep, boolean>;
  confettiTrigger: boolean;
  celebrationModal: {
    isOpen: boolean;
    stepTitle: string;
    stepNumber: number;
    nextStepTitle?: string;
  };
  
  // Actions
  setCurrentStep: (step: TutorialStep) => void;
  completeStep: (step: TutorialStep) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: 'layman' | 'technical') => void;
  resetProgress: () => void;
  getStepNumber: (step: TutorialStep) => number;
  isStepCompleted: (step: TutorialStep) => boolean;
  canAccessStep: (step: TutorialStep) => boolean;
  triggerConfetti: () => void;
  showCelebration: (stepTitle: string, stepNumber: number, nextStepTitle?: string) => void;
  hideCelebration: () => void;
}

const stepOrder: TutorialStep[] = [
  'welcome',
  'environment-setup', 
  'connect-wallet',
  'fhe-basics',
  'contract-overview',
  'testing-playground',
  'private-voting',
  'review'
];

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      currentStep: 'welcome',
      completedSteps: new Set<TutorialStep>(),
      sidebarOpen: true,
      activeTab: 'layman',
      confettiTrigger: false,
      celebrationModal: {
        isOpen: false,
        stepTitle: '',
        stepNumber: 0,
        nextStepTitle: undefined
      },
      progress: {
        'welcome': false,
        'environment-setup': false,
        'connect-wallet': false,
        'fhe-basics': false,
        'contract-overview': false,
        'testing-playground': false,
        'private-voting': false,
        'review': false,
      },

      setCurrentStep: (step) => set({ currentStep: step }),
      
      completeStep: (step) => set((state) => {
        const newCompletedSteps = new Set([...state.completedSteps, step]);
        const newProgress = { ...state.progress, [step]: true };
        
        // Show celebration modal for certain step completions
        const celebrationSteps = ['environment-setup', 'connect-wallet', 'fhe-basics', 'contract-overview', 'testing-playground', 'private-voting'];
        const shouldShowCelebration = celebrationSteps.includes(step);
        
        if (shouldShowCelebration) {
          const stepNumber = stepOrder.indexOf(step) + 1;
          const nextStepIndex = stepOrder.indexOf(step) + 1;
          const nextStep = nextStepIndex < stepOrder.length ? stepOrder[nextStepIndex] : undefined;
          const nextStepTitle = nextStep ? stepOrder[nextStepIndex] : undefined;
          
          return {
            completedSteps: newCompletedSteps,
            progress: newProgress,
            celebrationModal: {
              isOpen: true,
              stepTitle: step,
              stepNumber,
              nextStepTitle
            }
          };
        }
        
        return {
          completedSteps: newCompletedSteps,
          progress: newProgress
        };
      }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      resetProgress: () => set({
        currentStep: 'welcome',
        completedSteps: new Set<TutorialStep>(),
        progress: {
          'welcome': false,
          'environment-setup': false,
          'connect-wallet': false,
          'fhe-basics': false,
          'contract-overview': false,
          'testing-playground': false,
          'private-voting': false,
          'review': false,
        }
      }),
      
      getStepNumber: (step) => stepOrder.indexOf(step) + 1,
      
      isStepCompleted: (step) => get().completedSteps.has(step),
      
      canAccessStep: (step) => {
        const stepIndex = stepOrder.indexOf(step);
        if (stepIndex === 0) return true; // Welcome is always accessible
        
        const previousStep = stepOrder[stepIndex - 1];
        return get().isStepCompleted(previousStep);
      },
      
      triggerConfetti: () => {
        console.log('🎉 triggerConfetti called!'); // Debug log
        set({ confettiTrigger: true });
      },
      
      showCelebration: (stepTitle, stepNumber, nextStepTitle) => set({
        celebrationModal: {
          isOpen: true,
          stepTitle,
          stepNumber,
          nextStepTitle
        }
      }),
      
      hideCelebration: () => set((state) => ({
        celebrationModal: {
          ...state.celebrationModal,
          isOpen: false
        }
      })),
    }),
    {
      name: 'fhevm-tutorial-progress',
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps),
        progress: state.progress,
        activeTab: state.activeTab,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        completedSteps: new Set(persistedState?.completedSteps || []),
      }),
    }
  )
);