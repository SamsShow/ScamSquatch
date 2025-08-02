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
    <div className="min-h-screen bg-background relative">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-grid-white dark:bg-grid-dark z-0" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent">
              ScamSquatch
            </h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-foreground/80 hover:text-foreground transition-colors">
                How it works
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
      <section className="relative pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1 bg-primary/10 text-primary rounded-full">
              <span className="text-sm font-medium">Trusted by 10,000+ traders • $1B+ protected</span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Trade with
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent">
                absolute security
              </span>
            </h2>
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              AI-powered protection against scam routes, fake bridges, and honeypots.
              Trade with confidence across any chain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isConnected ? (
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
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
                      className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                      onClick={openConnectModal}
                    >
                      Start Trading Safely
                      <Zap className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                </ConnectButton.Custom>
              )}
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => window.open('https://docs.scamsquatch.dev', '_blank')}
              >
                View Documentation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 mt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent mb-2">$1B+</div>
              <div className="text-sm text-foreground/60">Assets Protected</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent mb-2">10K+</div>
              <div className="text-sm text-foreground/60">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent mb-2">99.9%</div>
              <div className="text-sm text-foreground/60">Scam Prevention</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent mb-2">20+</div>
              <div className="text-sm text-foreground/60">Chains Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Advanced Protection Features</h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive protection across multiple chains,
              ensuring your assets remain secure during every transaction.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-background rounded-lg border border-border group hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Protection</h3>
              <p className="text-foreground/80">
                Advanced AI algorithms detect and prevent scams before they happen, protecting your assets in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-background rounded-lg border border-border group hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cross-Chain Swaps</h3>
              <p className="text-foreground/80">
                Seamlessly swap assets across multiple blockchain networks with built-in security checks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-background rounded-lg border border-border group hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Bridge</h3>
              <p className="text-foreground/80">
                Built-in security features protect your assets during cross-chain transfers with real-time monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              Get started with ScamSquatch in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute -right-4 top-8 hidden md:block">
                <ArrowRight className="w-8 h-8 text-primary/30" />
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary/30 mb-4">01</div>
                <h3 className="text-xl font-bold mb-2">Connect Wallet</h3>
                <p className="text-foreground/80">
                  Connect your wallet to access our secure trading platform
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-4 top-8 hidden md:block">
                <ArrowRight className="w-8 h-8 text-primary/30" />
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-primary/30 mb-4">02</div>
                <h3 className="text-xl font-bold mb-2">Select Trade</h3>
                <p className="text-foreground/80">
                  Choose your assets and trading route across any supported chain
                </p>
              </div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-primary/30 mb-4">03</div>
              <h3 className="text-xl font-bold mb-2">Trade Safely</h3>
              <p className="text-foreground/80">
                Let our AI protect you while you execute your trades with confidence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Chains Section */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Supported Chains</h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              Trade safely across all major blockchain networks
            </p>
          </div>
          <div className="relative w-full overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:w-[100px] before:h-full before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:w-[100px] after:h-full after:bg-gradient-to-l after:from-background after:to-transparent">
            <div className="flex animate-scroll">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-8 min-w-max">
                  {[
                    { name: 'Ethereum', logo: '⟠' },
                    { name: 'BSC', logo: '⛓️' },
                    { name: 'Polygon', logo: '⬡' },
                    { name: 'Arbitrum', logo: '🔷' },
                    { name: 'Optimism', logo: '🔴' },
                    { name: 'Avalanche', logo: '🔺' },
                    { name: 'Base', logo: '🔵' },
                    { name: 'Solana', logo: '☀️' }
                  ].map((chain) => (
                    <div 
                      key={chain.name} 
                      className="w-48 p-6 bg-background rounded-lg border border-border flex-shrink-0 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <span className="text-2xl">{chain.logo}</span>
                      </div>
                      <h3 className="text-lg font-bold">{chain.name}</h3>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by Traders</h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              See what our users say about ScamSquatch
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Thompson",
                role: "DeFi Trader",
                text: "ScamSquatch saved me from multiple honeypot scams. The AI detection is incredible!"
              },
              {
                name: "Sarah Chen",
                role: "Crypto Analyst",
                text: "The cross-chain protection features are unmatched. Essential tool for serious traders."
              },
              {
                name: "Marcus Rodriguez",
                role: "Portfolio Manager",
                text: "Finally, I can trade with confidence knowing I'm protected from scam routes."
              }
            ].map((testimonial, i) => (
              <div 
                key={i}
                className="p-6 bg-background rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="text-primary font-bold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-foreground/60">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-foreground/80">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Latest Updates</h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              Stay informed about the latest in blockchain security
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "New Chain Support: Arbitrum Nova",
                date: "July 28, 2025",
                description: "We've added support for Arbitrum Nova, expanding our cross-chain capabilities."
              },
              {
                title: "AI Model Update v2.5",
                date: "July 29, 2025",
                description: "Our AI protection system got even smarter with improved scam detection rates."
              },
              {
                title: "Partnership with ChainGuard",
                date: "July 30, 2025",
                description: "Strategic partnership to enhance cross-chain security measures."
              }
            ].map((post, i) => (
              <div 
                key={i}
                className="group cursor-pointer"
                onClick={() => window.open('/blog', '_blank')}
              >
                <div className="h-48 bg-accent rounded-lg mb-4 overflow-hidden">
                  <div className="w-full h-full bg-primary/10 group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-sm text-foreground/60 mb-2">{post.date}</p>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-foreground/80">{post.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              Everything you need to know about ScamSquatch
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "How does ScamSquatch protect my trades?",
                a: "Our AI analyzes multiple factors including contract code, liquidity patterns, and historical transaction data to identify potential scams before you trade."
              },
              {
                q: "Which chains are supported?",
                a: "We support all major EVM chains including Ethereum, BSC, Polygon, Arbitrum, Optimism, and Avalanche, with more being added regularly."
              },
              {
                q: "How much does it cost?",
                a: "ScamSquatch is free to use! We take a small fee only on successful trades to maintain our infrastructure."
              }
            ].map((faq, i) => (
              <div 
                key={i} 
                className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
              >
                <button className="w-full p-6 text-left focus:outline-none">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">{faq.q}</h3>
                    <ArrowRight className="w-5 h-5 transform transition-transform" />
                  </div>
                  <p className="mt-4 text-foreground/80">{faq.a}</p>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Trade Safely?</h2>
            <p className="text-xl text-foreground/80 mb-8">
              Join thousands of traders who trust ScamSquatch for secure cross-chain trading
            </p>
            {!isConnected && (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={openConnectModal}
                  >
                    Start Trading Now
                    <Zap className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </ConnectButton.Custom>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-foreground/60 hover:text-foreground">Features</a></li>
                <li><a href="#how-it-works" className="text-foreground/60 hover:text-foreground">How it works</a></li>
                <li><a href="/dashboard" className="text-foreground/60 hover:text-foreground">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="https://docs.scamsquatch.dev" className="text-foreground/60 hover:text-foreground">Documentation</a></li>
                <li><a href="/blog" className="text-foreground/60 hover:text-foreground">Blog</a></li>
                <li><a href="/status" className="text-foreground/60 hover:text-foreground">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="text-foreground/60 hover:text-foreground">About</a></li>
                <li><a href="/careers" className="text-foreground/60 hover:text-foreground">Careers</a></li>
                <li><a href="/contact" className="text-foreground/60 hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-foreground/60 hover:text-foreground">Privacy Policy</a></li>
                <li><a href="/terms" className="text-foreground/60 hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-foreground/60">© 2025 ScamSquatch. All rights reserved.</p>
              <div className="flex space-x-6">
                <a href="https://twitter.com/scamsquatch" className="text-foreground/60 hover:text-foreground">
                  Twitter
                </a>
                <a href="https://discord.gg/scamsquatch" className="text-foreground/60 hover:text-foreground">
                  Discord
                </a>
                <a href="https://github.com/scamsquatch" className="text-foreground/60 hover:text-foreground">
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}