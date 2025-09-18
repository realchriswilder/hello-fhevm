import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Moon, 
  Sun, 
  Wallet, 
  ChevronDown,
  ExternalLink,
  Github
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppBarProps {
  onMenuToggle: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  walletConnected: boolean;
  walletAddress?: string;
  currentNetwork?: string;
  isCorrectNetwork: boolean;
  onConnectWallet: () => void;
  onSwitchNetwork: () => void;
  onDisconnect?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({
  onMenuToggle,
  isDarkMode,
  onThemeToggle,
  walletConnected,
  walletAddress,
  currentNetwork,
  isCorrectNetwork,
  onConnectWallet,
  onSwitchNetwork,
  onDisconnect,
}) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const NetworkBadge = () => {
    if (!currentNetwork) return null;
    
    return (
      <Badge 
        variant={isCorrectNetwork ? "default" : "destructive"}
        className="hidden sm:flex items-center gap-1"
      >
        <div className={`w-2 h-2 rounded-full ${
          isCorrectNetwork ? 'bg-success animate-pulse' : 'bg-destructive'
        }`} />
        {currentNetwork}
      </Badge>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        
        {/* Left side: Logo and navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="p-2 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-display font-bold text-primary-foreground">
                Z
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-xl font-bold">Hello FHEVM</h1>
                <p className="text-xs text-muted-foreground hidden md:block">
                  Learn Confidential Computing
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Center: Network status (on larger screens) */}
        <div className="hidden md:flex items-center">
          <NetworkBadge />
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2">
          {/* Network status (mobile) */}
          <div className="md:hidden">
            <NetworkBadge />
          </div>

          {/* Wallet connection */}
          {walletConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {formatAddress(walletAddress!)}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  Connected
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Copy Address
                </DropdownMenuItem>
                {!isCorrectNetwork && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={onSwitchNetwork}
                      className="text-warning"
                    >
                      Switch Network
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={onDisconnect}>
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onConnectWallet} className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
            </Button>
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onThemeToggle}
            className="p-2"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Links menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <ExternalLink className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Github className="h-4 w-4 mr-2" />
                GitHub Repository
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                Zama Documentation
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                FHEVM Explorer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Network warning banner */}
      {walletConnected && !isCorrectNetwork && (
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="bg-warning text-warning-foreground px-4 py-2 text-center text-sm"
        >
          <div className="flex items-center justify-center gap-2">
            <span>⚠️ Wrong network detected.</span>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={onSwitchNetwork}
              className="ml-2"
            >
              Switch to Sepolia
            </Button>
          </div>
        </motion.div>
      )}
    </header>
  );
};