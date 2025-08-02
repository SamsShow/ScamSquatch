'use client';

import { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { store } from '@/store';
import { chains, getConfig } from '@/config/wagmi';

// Create a client
const queryClient = new QueryClient();

function WalletProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [wagmiConfig, setWagmiConfig] = useState<any>(null);

  useEffect(() => {
    const initConfig = async () => {
      try {
        const config = await getConfig();
        if (config) {
          setWagmiConfig(config);
        }
      } catch (error) {
        console.error('Failed to initialize Wagmi config:', error);
      }
      setMounted(true);
    };

    initConfig();
  }, []);

  // Prevent hydration issues
  if (!mounted) {
    return null;
  }

  // Don't render wallet components until config is ready
  if (!wagmiConfig) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
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