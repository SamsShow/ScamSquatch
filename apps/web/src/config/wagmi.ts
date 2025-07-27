import { http, createConfig } from 'wagmi'
import { sepolia, polygonAmoy } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Get RPC URLs from environment variables
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://rpc.sepolia.org'
const amoyRpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-amoy.infura.io/v3/'

// Configure supported chains
export const chains = [sepolia, polygonAmoy] as const

// Create wagmi config
export const config = createConfig({
  chains,
  connectors: [
    injected(),
  ],
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
    [polygonAmoy.id]: http(amoyRpcUrl),
  },
}) 