'use client';

import { SwapForm } from "@/components/swap-form";
import { RiskAnalysis } from "@/components/risk-analysis";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
            ScamSquatch
          </h1>
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
      <main className="container mx-auto px-4 pt-24">
        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          {/* Swap Form */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-semibold mb-6">Swap</h2>
            <SwapForm />
          </Card>

          {/* Risk Analysis */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-semibold mb-6">Risk Analysis</h2>
            <RiskAnalysis />
          </Card>
        </div>
      </main>
    </div>
  );
}
