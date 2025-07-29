'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, Zap, Lock } from "lucide-react";
import { useTheme } from "next-themes";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConfig } from "wagmi";
import { useEffect, useState } from "react";

export default function HomeContent() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const config = useConfig();
  const { isConnected, isConnecting, isReconnecting } = useAccount();
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

  // Redirect to dashboard if wallet is connected
  useEffect(() => {
    if (isConnected && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/dashboard');
    }
  }, [isConnected, router, isRedirecting]);

  const isLoading = isConnecting || isReconnecting || isRedirecting;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
              ScamSquatch
            </h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
                Features
              </a>
              <a href="https://docs.scamsquatch.dev" className="text-foreground/80 hover:text-foreground transition-colors">
                Docs
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              {theme === 'dark' ? '☀️' : '🌙'} {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
            <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
              Secure Cross-Chain Swaps
            </h2>
            <p className="text-xl text-foreground/80 mb-8">
              AI-powered protection against scam routes, fake bridges, and honeypots.
              Trade with confidence across any chain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isConnected ? (
                <Button 
                  size="lg" 
                  className="bg-brand hover:bg-brand-dark text-white"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <Button 
                      size="lg" 
                      className="bg-brand hover:bg-brand-dark text-white"
                      onClick={openConnectModal}
                    >
                      Connect Wallet
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                </ConnectButton.Custom>
              )}
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open('https://docs.scamsquatch.dev', '_blank')}
              >
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-card border border-border rounded-lg">
              <Shield className="h-12 w-12 text-brand mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Protection</h3>
              <p className="text-foreground/80">
                Advanced machine learning models detect and prevent scam attempts in real-time.
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-lg">
              <Zap className="h-12 w-12 text-brand mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cross-Chain Security</h3>
              <p className="text-foreground/80">
                Seamlessly swap assets across multiple chains with built-in security checks.
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-lg">
              <Lock className="h-12 w-12 text-brand mb-4" />
              <h3 className="text-xl font-semibold mb-2">Risk Assessment</h3>
              <p className="text-foreground/80">
                Comprehensive risk scoring for every swap route and smart contract.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 