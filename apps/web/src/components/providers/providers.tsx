'use client'

import { Provider as ReduxProvider } from 'react-redux'
import { store } from '@/store'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { WagmiProvider } from '@/components/providers/wagmi-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <ReduxProvider store={store}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="scamsquatch-theme"
        >
          {children}
        </ThemeProvider>
      </ReduxProvider>
    </WagmiProvider>
  )
} 