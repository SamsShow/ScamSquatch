import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.logo}>
          <div className="flex items-center gap-3">
            <img src="/logo-shield.svg" alt="ScamSquatch Logo" className="w-12 h-12" />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3ECF8E' }}>
              ScamSquatch
            </h1>
          </div>
          <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '0.5rem' }}>
            AI-Powered Cross-Chain Swap Protection
          </p>
        </div>

        <div style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'left' }}>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>API Documentation</h2>
          
          <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3 style={{ color: '#3ECF8E', marginBottom: '1rem' }}>🚀 Core Features</h3>
            <ul style={{ lineHeight: '1.6' }}>
              <li><strong>1inch Fusion+ Integration:</strong> Real-time route discovery and swap execution</li>
              <li><strong>AI Risk Assessment:</strong> Multi-factor scam detection and scoring</li>
              <li><strong>Cross-Chain Support:</strong> Ethereum Sepolia ↔ Polygon Amoy</li>
              <li><strong>Token Selection:</strong> Searchable token lists with popular tokens</li>
              <li><strong>Route Visualization:</strong> Risk-labeled routes with detailed warnings</li>
            </ul>
          </div>

          <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3 style={{ color: '#3ECF8E', marginBottom: '1rem' }}>🔒 Risk Assessment Factors</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <h4>Protocol Security (25%)</h4>
                <p>Detects untrusted DEX protocols</p>
              </div>
              <div>
                <h4>Price Impact (20%)</h4>
                <p>Warns about high-slippage trades</p>
              </div>
              <div>
                <h4>Route Complexity (10%)</h4>
                <p>Flags multi-hop transaction risks</p>
              </div>
              <div>
                <h4>Cross-Chain Bridges (15%)</h4>
                <p>Special handling for bridge transactions</p>
              </div>
              <div>
                <h4>Suspicious Tokens (20%)</h4>
                <p>Identifies scam token patterns</p>
              </div>
              <div>
                <h4>Liquidity Risk (15%)</h4>
                <p>Detects low-liquidity routes</p>
              </div>
            </div>
          </div>

          <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3 style={{ color: '#3ECF8E', marginBottom: '1rem' }}>🔧 API Endpoints</h3>
            <div style={{ fontFamily: 'monospace', background: '#fff', padding: '1rem', borderRadius: '4px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>GET /api/tokens?chainId=11155111</strong><br/>
                <span style={{ color: '#666' }}>Fetch supported tokens for a chain</span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>POST /api/routes</strong><br/>
                <span style={{ color: '#666' }}>Get swap routes with risk assessment</span>
              </div>
              <div>
                <strong>POST /api/swap</strong><br/>
                <span style={{ color: '#666' }}>Execute secure cross-chain swap</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3 style={{ color: '#3ECF8E', marginBottom: '1rem' }}>🌐 Supported Networks</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: '#fff', padding: '1rem', borderRadius: '4px' }}>
                <h4>Ethereum Sepolia</h4>
                <p>Chain ID: 11155111</p>
                <p>Testnet for Ethereum</p>
              </div>
              <div style={{ background: '#fff', padding: '1rem', borderRadius: '4px' }}>
                <h4>Polygon Amoy</h4>
                <p>Chain ID: 80002</p>
                <p>Testnet for Polygon</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.ctas}>
          <Link
            className={styles.primary}
            href="/"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            🚀 Try ScamSquatch
          </Link>
          <a
            href="https://portal.1inch.dev/documentation/apis/swap/fusion-plus/introduction"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            📚 1inch API Docs
          </a>
        </div>
      </main>
      
      <footer className={styles.footer}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <p>Built with Next.js, TypeScript, and 1inch Fusion+</p>
          <p>Protecting users from scam routes since 2024</p>
        </div>
      </footer>
    </div>
  );
}
