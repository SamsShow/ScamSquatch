import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from '@/store'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { WagmiProvider } from '@/components/providers/wagmi-provider'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ScamSquatch - AI-Powered Cross-Chain Swap Protection',
  description: 'Secure your cross-chain swaps with AI-powered fraud detection',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
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
      </body>
    </html>
  )
} 