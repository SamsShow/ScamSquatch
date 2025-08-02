'use client';

import { useEffect, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia, polygon } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { store } from '@/store';
import type { Config } from 'wagmi';

const queryClient = new QueryClient();

// Configure RainbowKit wallet connection
const { wallets } = getDefaultWallets({
  appName: 'ScamSquatch',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Add your WalletConnect project ID here
  chains: [sepolia, polygon],
});

function WalletProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [wagmiConfig, setWagmiConfig] = useState<Config | null>(null);
  
  useEffect(() => {
    setMounted(true);
    const config = createConfig({
      chains: [sepolia, polygon],
      transports: {
        [sepolia.id]: http(),
        [polygon.id]: http(),
      },
      ssr: true,
    });
    setWagmiConfig(config);
  }, []);

  if (!mounted || !wagmiConfig) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={[sepolia, polygon]}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={true}
      disableTransitionOnChange
    >
      <ReduxProvider store={store}>
        <WalletProviders>{children}</WalletProviders>
      </ReduxProvider>
    </ThemeProvider>
  );
}