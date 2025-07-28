import { http } from 'wagmi';
import { sepolia, polygonAmoy } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Get RPC URLs from environment variables
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://rpc.sepolia.org';
const amoyRpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-amoy.infura.io/v3/';

// Configure supported chains
export const chains = [sepolia, polygonAmoy] as const;

// Validate WalletConnect project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!projectId || projectId === 'your_walletconnect_project_id_here') {
  throw new Error(
    'Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable. ' +
    'Please get your project ID from https://cloud.walletconnect.com/ and add it to your .env.local file.'
  );
}

// Create wagmi config using RainbowKit's getDefaultConfig
export const config = getDefaultConfig({
  appName: 'ScamSquatch',
  projectId: projectId,
  chains: chains,
  ssr: true, // Enable SSR support
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
    [polygonAmoy.id]: http(amoyRpcUrl),
  },
});