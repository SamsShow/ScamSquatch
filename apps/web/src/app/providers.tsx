'use client';

import { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { store } from '@/store';
import { getConfig } from '@/config/wagmi';
import type { Config } from 'wagmi';

const queryClient = new QueryClient();

function WalletProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  
  useEffect(() => {
    setMounted(true);
    const loadConfig = async () => {
      const wagmiConfig = await getConfig();
      setConfig(wagmiConfig);
    };
    loadConfig();
  }, []);
  
  if (!mounted || !config) {
    return null;
  }

  return (
    <WagmiProvider config={config as Config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
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
      forcedTheme="dark"
    >
      <ReduxProvider store={store}>
        <WalletProviders>{children}</WalletProviders>
      </ReduxProvider>
    </ThemeProvider>
  );
}