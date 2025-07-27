'use client';

import { SwapForm } from "@/components/swap-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield, ArrowRight, Zap, Lock } from "lucide-react";
import { useTheme } from "next-themes";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
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
              <a href="#app" className="text-foreground/80 hover:text-foreground transition-colors">
                App
              </a>
              <a href="#docs" className="text-foreground/80 hover:text-foreground transition-colors">
                Docs
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-dark/20 hover:bg-dark/30 transition-colors"
            >
              Toggle Theme
            </button>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-grid-white">
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
              <Button size="lg" className="bg-brand hover:bg-brand-dark text-white">
                Launch App
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
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
            <Card className="p-6 bg-card border-border">
              <Shield className="h-12 w-12 text-brand mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Protection</h3>
              <p className="text-foreground/80">
                Advanced machine learning models detect and prevent scam attempts in real-time.
              </p>
            </Card>
            <Card className="p-6 bg-card border-border">
              <Zap className="h-12 w-12 text-brand mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cross-Chain Security</h3>
              <p className="text-foreground/80">
                Seamlessly swap assets across multiple chains with built-in security checks.
              </p>
            </Card>
            <Card className="p-6 bg-card border-border">
              <Lock className="h-12 w-12 text-brand mb-4" />
              <h3 className="text-xl font-semibold mb-2">Risk Assessment</h3>
              <p className="text-foreground/80">
                Comprehensive risk scoring for every swap route and smart contract.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* App Dashboard */}
      <section id="app" className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
            {/* Swap Form */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold mb-6">Swap</h2>
              <SwapForm />
            </Card>

            {/* Risk Analysis */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold mb-6">Risk Analysis</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <h3 className="text-lg font-medium mb-2">Security Checks</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-green-500">
                      <Shield className="h-4 w-4 mr-2" />
                      Contract verified
                    </li>
                    <li className="flex items-center text-green-500">
                      <Shield className="h-4 w-4 mr-2" />
                      Liquidity locked
                    </li>
                    <li className="flex items-center text-yellow-500">
                      <Shield className="h-4 w-4 mr-2" />
                      Medium price impact
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted border border-border">
                  <h3 className="text-lg font-medium mb-2">Risk Score</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-500">85</span>
                    <span className="text-foreground/60">Low Risk</span>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-green-500 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}