'use client'

import { ConnectButton } from '@/components/connect-button'
import { SwapForm } from '@/components/swap-form'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-dark-secondary">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-dark backdrop-blur supports-[backdrop-filter]:bg-dark/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold text-brand">ScamSquatch</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Search will go here */}
            </div>
            <nav className="flex items-center">
              <ConnectButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container flex-1 items-start md:grid md:grid-cols-[1fr_200px] md:gap-6 lg:grid-cols-[1fr_300px]">
        <main className="relative py-6 lg:gap-10 lg:py-8">
          <div className="mx-auto flex max-w-md flex-col items-center space-y-4">
            <h1 className="text-center text-3xl font-bold text-foreground">
              Secure Cross-Chain Swaps
            </h1>
            <p className="text-center text-muted-foreground">
              AI-powered protection against scam routes, fake bridges, and honeypots
            </p>
            <SwapForm />
          </div>
        </main>
        <aside className="hidden w-[200px] flex-col md:flex lg:w-[300px]">
          {/* Risk info will go here */}
        </aside>
      </div>
    </main>
  )
} 