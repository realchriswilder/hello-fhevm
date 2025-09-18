import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { injected } from 'wagmi/connectors';

export const chains = [sepolia] as const;

const projectId = import.meta.env.VITE_WC_PROJECT_ID as string | undefined;

export const wagmiConfig = projectId
  ? getDefaultConfig({
      appName: 'Vote App',
      projectId,
      chains,
      transports: {
        [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'),
      },
    })
  : createConfig({
      chains,
      transports: {
        [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'),
      },
      connectors: [injected()],
      multiInjectedProviderDiscovery: true,
      ssr: false,
    });


