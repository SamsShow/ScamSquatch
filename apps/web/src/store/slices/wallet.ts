import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { type PublicClient, type WalletClient } from 'viem'

export interface TokenBalance {
  symbol: string
  balance: string
  decimals: number
  chainId: number
  address: string
}

export interface WalletState {
  isConnecting: boolean
  isConnected: boolean
  address: string | null
  chainId: number | null
  provider: WalletClient | null
  publicClient: PublicClient | null
  error: string | null
  balances: TokenBalance[]
}

const initialState: WalletState = {
  isConnecting: false,
  isConnected: false,
  address: null,
  chainId: null,
  provider: null,
  publicClient: null,
  error: null,
  balances: [],
}

export const walletSlice: Slice<WalletState> = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload
      if (action.payload) {
        state.error = null
      }
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
      if (!action.payload) {
        state.address = null
        state.chainId = null
        state.provider = null
        state.publicClient = null
        state.balances = []
      }
    },
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload
    },
    setChainId: (state, action: PayloadAction<number | null>) => {
      state.chainId = action.payload
    },
    setProvider: (state, action: PayloadAction<WalletClient | null>) => {
      // @ts-expect-error - Complex viem types not compatible with immer
      state.provider = action.payload
    },
    setPublicClient: (state, action: PayloadAction<PublicClient | null>) => {
      // @ts-expect-error - Complex viem types not compatible with immer
      state.publicClient = action.payload
    },
    setBalance: (state, action: PayloadAction<TokenBalance>) => {
      const { address, chainId, symbol } = action.payload
      const existingIndex = state.balances.findIndex(
        balance => balance.address === address && 
                  balance.chainId === chainId && 
                  balance.symbol === symbol
      )
      
      if (existingIndex >= 0) {
        state.balances[existingIndex] = action.payload
      } else {
        state.balances.push(action.payload)
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isConnecting = false
    },
    resetWallet: (state) => {
      state.isConnecting = false
      state.isConnected = false
      state.address = null
      state.chainId = null
      state.provider = null
      state.publicClient = null
      state.error = null
      state.balances = []
    },
  },
})

export const {
  setConnecting,
  setConnected,
  setAddress,
  setChainId,
  setProvider,
  setPublicClient,
  setBalance,
  setError,
  resetWallet,
} = walletSlice.actions

export default walletSlice.reducer 