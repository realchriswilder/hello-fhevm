import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { injected } from 'wagmi/connectors';

// RainbowKit/Wagmi configuration for Sepolia Testnet
export const chains = [sepolia] as const;

const projectId = import.meta.env.VITE_WC_PROJECT_ID;

export const wagmiConfig = projectId
  ? getDefaultConfig({
      appName: 'Hello FHEVM Tutorial',
      projectId,
      chains,
      transports: {
        [sepolia.id]: http(
          (import.meta as any).env?.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'
        ),
      },
    })
  : createConfig({
      chains,
      transports: {
        [sepolia.id]: http(
          (import.meta as any).env?.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'
        ),
      },
      connectors: [injected()],
      multiInjectedProviderDiscovery: true,
      ssr: false,
    });


