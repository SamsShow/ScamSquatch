import { http } from 'wagmi';
import { sepolia, polygonMumbai } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Configure supported chains
export const chains = [sepolia, polygonMumbai] as const;

// Get WalletConnect project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (typeof window !== 'undefined' && !projectId) {
  console.warn(
    'Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable. ' +
    'Get your project ID from https://cloud.walletconnect.com'
  );
}

// Create wagmi config dynamically to prevent SSR issues
export const getConfig = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  // Ensure we have valid RPC URLs
  const rpcConfig = {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo'
    ),
    [polygonMumbai.id]: http(
      process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-mumbai.g.alchemy.com/v2/demo'
    ),
  };

  return getDefaultConfig({
    appName: 'ScamSquatch',
    projectId: projectId || '00000000000000000000000000000000',
    chains: chains,
    transports: rpcConfig,
    ssr: false,
  });
};