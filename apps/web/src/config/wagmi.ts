import { http } from 'wagmi';
import { sepolia, polygonAmoy } from 'wagmi/chains';

// Get RPC URLs from environment variables
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://rpc.sepolia.org';
const amoyRpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-amoy.infura.io/v3/';

// Configure supported chains
export const chains = [sepolia, polygonAmoy] as const;

// Validate WalletConnect project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

// Create wagmi config dynamically to prevent SSR issues
export const getConfig = async () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Dynamic import to prevent SSR issues
  const { getDefaultConfig } = await import('@rainbow-me/rainbowkit');
  
  return getDefaultConfig({
    appName: 'ScamSquatch',
    projectId: projectId || '00000000000000000000000000000000', // Fallback project ID
    chains: chains,
    ssr: false, // Disable SSR to prevent indexedDB errors
    transports: {
      [sepolia.id]: http(sepoliaRpcUrl),
      [polygonAmoy.id]: http(amoyRpcUrl),
    },
  });
};

// Log warning if using fallback project ID
if (typeof window !== 'undefined' && (!projectId || projectId === 'your_walletconnect_project_id_here')) {
  console.warn(
    'Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable. ' +
    'Please get your project ID from https://cloud.walletconnect.com/ and add it to your .env.local file.'
  );
}