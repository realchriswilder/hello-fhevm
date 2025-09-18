import { create } from 'zustand';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isCorrectNetwork: boolean;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
  error: string | null;

  // Actions
  setConnectionState: (connected: boolean, address?: string) => void;
  setChainInfo: (chainId: number, isCorrect: boolean) => void;
  setBalance: (balance: string) => void;
  setConnectionStatus: (status: WalletState['connectionStatus']) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  address: null,
  chainId: null,
  balance: null,
  isCorrectNetwork: false,
  connectionStatus: 'idle',
  error: null,

  setConnectionState: (connected, address) => 
    set({ isConnected: connected, address: address || null }),

  setChainInfo: (chainId, isCorrect) => 
    set({ chainId, isCorrectNetwork: isCorrect }),

  setBalance: (balance) => set({ balance }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setError: (error) => set({ error }),

  reset: () => set({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
    isCorrectNetwork: false,
    connectionStatus: 'idle',
    error: null,
  }),
}));