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
  
  // Actions
  setCurrentStep: (step: TutorialStep) => void;
  completeStep: (step: TutorialStep) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: 'layman' | 'technical') => void;
  resetProgress: () => void;
  getStepNumber: (step: TutorialStep) => number;
  isStepCompleted: (step: TutorialStep) => boolean;
  canAccessStep: (step: TutorialStep) => boolean;
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
      
      completeStep: (step) => set((state) => ({
        completedSteps: new Set([...state.completedSteps, step]),
        progress: { ...state.progress, [step]: true }
      })),
      
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