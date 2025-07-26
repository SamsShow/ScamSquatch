# ScamSquatch 🚫💰

ScamSquatch is an AI-powered fraud detection layer for secure cross-chain swaps that integrates with 1inch Fusion+. By analyzing real-time data, on-chain patterns, and swap routes, ScamSquatch acts as a protective AI agent that flags scam routes, fake bridges, and potential honeypots.

## 🏗 Project Structure

```bash
scamsquatch/
├── apps/
│   ├── web/             # Next.js frontend
│   └── docs/            # Swagger API documentation
├── packages/
│   ├── ui/             # Shared UI components with shadcn
│   ├── config/         # Shared configs (TS, tailwind, etc)
│   └── contracts/      # Contract ABIs and types
```

## 🚀 MVP Features (Phase 1)

- Cross-chain swap discovery using 1inch Fusion+ API
- Rule-based fraud scoring system
- Ethereum ⇄ Aptos testnet support
- Risk-labelled route list UI
- Wallet integration (WalletConnect v2)

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: Redux Toolkit
- **Blockchain**: WalletConnect v2, wagmi, viem
- **API Documentation**: Swagger/OpenAPI
- **Development**: Turborepo, pnpm

## 🏁 Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## 📦 Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all apps and packages
- `pnpm test` - Run tests

## 🔐 Security Notes

- Support for EVM testnets:
  - Ethereum Sepolia (11155111)
  - Polygon Amoy (80002)
- Umi Network devnet RPC: `https://devnet.uminetwork.com/`

## 🤝 Contributing

1. Create a feature branch
2. Commit changes
3. Create a Pull Request

## 📄 License

MIT

## 🙏 Acknowledgments

- [1inch Fusion+](https://portal.1inch.dev/documentation/apis/swap/fusion-plus/introduction)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (Design inspiration)
