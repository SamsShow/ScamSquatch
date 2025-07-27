'use client'

import { WagmiProvider as WagmiConfigProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/config/wagmi'

const queryClient = new QueryClient()

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfigProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfigProvider>
  )
} 