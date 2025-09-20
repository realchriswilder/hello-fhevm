import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppBar } from "@/components/layout/AppBar";
import { Navigation } from "@/components/layout/Navigation";
import { TutorialSidebar } from "@/components/layout/TutorialSidebar";
import { WelcomeStep } from "@/components/steps/WelcomeStep";
import { EnvironmentSetupStep } from "@/components/steps/EnvironmentSetupStep";
import { ConnectWalletStep } from "@/components/steps/ConnectWalletStep";
import { FheBasicsStep } from "@/components/steps/FheBasicsStep";
import { WriteContractStep } from "@/components/steps/WriteContractStep";
import { ContractOverviewStep } from "@/components/steps/ContractOverviewStep";
import { PrivateVotingStep } from "@/components/steps/PrivateVotingStep";
import { TestingPlaygroundStep } from "@/components/steps/TestingPlaygroundStep";
import ReviewStep from "@/components/steps/ReviewStep";
import NotFound from "./pages/NotFound";
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { WagmiConfig, useAccount, useChainId } from 'wagmi';
import { useDisconnect, useSwitchChain } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { wagmiConfig, chains } from '@/lib/wallet/wagmi';
import { Confetti } from '@/components/ui/confetti';
import { CelebrationModal } from '@/components/ui/celebration-modal';
import { useTutorialStore } from '@/state/tutorialStore';

const queryClient = new QueryClient();

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [navOpen, setNavOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    confettiTrigger, 
    triggerConfetti, 
    celebrationModal, 
    hideCelebration, 
    setCurrentStep
  } = useTutorialStore();

  useEffect(() => {
    const isDark = localStorage.theme === 'dark' || 
      (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    localStorage.theme = newIsDark ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', newIsDark);
  };

  // Wallet state for AppBar
  const AppBarWithWallet = () => {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const { openConnectModal } = useConnectModal();
    const isCorrect = chainId === 11155111;

    return (
      <AppBar
        onMenuToggle={() => setNavOpen(!navOpen)}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
        walletConnected={!!isConnected}
        walletAddress={address || undefined}
        currentNetwork={chainId ? `Chain ${chainId}` : undefined}
        isCorrectNetwork={!!isCorrect}
        onConnectWallet={() => openConnectModal?.()}
        onSwitchNetwork={() => switchChain?.({ chainId: 11155111 })}
        onDisconnect={() => disconnect()}
      />
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <BrowserRouter>
          <div className="min-h-screen bg-background">
            <AppBarWithWallet />
            
            <div className="flex h-screen">
              <Navigation isOpen={navOpen} />
              
              <main className="flex-1 p-6 overflow-y-auto lg:ml-0">
                {/* RainbowKit Connect (optional display) */}
                <div className="mb-4 hidden">
                  <ConnectButton />
                </div>
                <Routes>
                  <Route path="/" element={<WelcomeStep />} />
                  <Route path="/step/welcome" element={<WelcomeStep />} />
                  <Route path="/step/environment-setup" element={<EnvironmentSetupStep />} />
                  <Route path="/step/connect-wallet" element={<ConnectWalletStep />} />
                  <Route path="/step/fhe-basics" element={<FheBasicsStep />} />
                  <Route path="/step/write-contract" element={<WriteContractStep />} />
                  <Route path="/step/contract-overview" element={<ContractOverviewStep />} />
                  <Route path="/step/private-voting" element={<PrivateVotingStep />} />
                  <Route path="/step/testing-playground" element={<TestingPlaygroundStep />} />
                  <Route path="/step/review" element={<ReviewStep />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              
              <TutorialSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
              />
            </div>
            
            {/* Sidebar Toggle - Fixed position */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              aria-label="Open tutorial guide"
              title="Click here to open the tutorial guide"
            >
              <span role="img" aria-label="book">📖</span>
              <span className="hidden sm:inline text-sm font-medium">Click here</span>
            </button>
            
            {/* Confetti Component */}
            <Confetti 
              trigger={confettiTrigger} 
              onComplete={() => {
                console.log('🎉 Confetti animation completed!'); // Debug log
                // Reset confetti trigger after animation
                setTimeout(() => {
                  useTutorialStore.setState({ confettiTrigger: false });
                }, 100);
              }} 
            />
            
            {/* Celebration Modal */}
            <CelebrationModal
              isOpen={celebrationModal.isOpen}
              onClose={hideCelebration}
              stepTitle={celebrationModal.stepTitle}
              stepNumber={celebrationModal.stepNumber}
              nextStepTitle={celebrationModal.nextStepTitle}
              onContinue={() => {
                if (celebrationModal.nextStepTitle) {
                  setCurrentStep(celebrationModal.nextStepTitle as any);
                  // Navigate to next step
                  window.location.href = `/step/${celebrationModal.nextStepTitle}`;
                }
                hideCelebration();
              }}
            />
          </div>
            </BrowserRouter>
          </RainbowKitProvider>
        </WagmiConfig>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
