'use client';

import dynamic from 'next/dynamic';
import { SwapForm } from '@/components/swap-form';
import { RiskAnalysis } from '@/components/risk-analysis';
import { EnhancedSwapExecution } from '@/components/enhanced-swap-execution';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConfig } from 'wagmi';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Dynamically import components to prevent SSR issues
const QuickStats = dynamic(() => import('@/components/quick-stats').then(mod => mod.QuickStats), {
  ssr: false,
  loading: () => (
    <Card className="p-6 bg-card border-border">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-10 w-10 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-6 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  ),
});

const TransactionHistory = dynamic(() => import('@/components/transaction-history').then(mod => mod.TransactionHistory), {
  ssr: false,
  loading: () => (
    <Card className="p-6 bg-card border-border">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded" />
          ))}
        </div>
      </div>
    </Card>
  ),
});

const PortfolioOverview = dynamic(() => import('@/components/portfolio-overview').then(mod => mod.PortfolioOverview), {
  ssr: false,
  loading: () => (
    <Card className="p-6 bg-card border-border">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-40 bg-muted rounded" />
        <div className="h-16 bg-muted rounded" />
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded" />
          ))}
        </div>
      </div>
    </Card>
  ),
});

export default function DashboardContent() {
  const config = useConfig();
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Show loading state if WagmiProvider is not available
  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Initializing wallet connection...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/');
    }
  }, [isConnected, router, isRedirecting]);

  const isLoading = isConnecting || isReconnecting || isRedirecting;

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
              ScamSquatch
            </h1>
            <nav className="hidden md:flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className={`text-foreground/80 hover:text-foreground transition-colors ${
                  pathname === '/dashboard' ? 'bg-accent' : ''
                }`}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/ml-ops')}
                className={`text-foreground/80 hover:text-foreground transition-colors ${
                  pathname === '/ml-ops' ? 'bg-accent' : ''
                }`}
              >
                ML Ops
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/analytics')}
                className={`text-foreground/80 hover:text-foreground transition-colors ${
                  pathname === '/analytics' ? 'bg-accent' : ''
                }`}
              >
                Analytics
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
              <ConnectButton showBalance={true} chainStatus="icon" accountStatus="address" />
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              disabled={isLoading}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Quick Stats Row */}
        <div className="mb-8">
          <QuickStats />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Swap Form */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold mb-6">Cross-Chain Swap</h2>
              <SwapForm />
            </Card>

            {/* Transaction History */}
            <TransactionHistory />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Portfolio Overview */}
            <PortfolioOverview />

            {/* Risk Analysis */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold mb-6">Risk Analysis</h2>
              <RiskAnalysis />
            </Card>

            {/* Enhanced Swap Execution */}
            <EnhancedSwapExecution />
          </div>
        </div>
      </main>
    </div>
  );
}