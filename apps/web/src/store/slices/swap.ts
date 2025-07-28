import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { type Chain } from 'viem'

export interface Token {
  symbol: string
  address: string
  decimals: number
  chainId: number
  name: string
}

export interface SwapRoute {
  id: string
  protocols: string[]
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
  estimatedGas: string
  gasCost: string
  priceImpact: number
  route: any // 1inch route object
}

export interface SwapState {
  isLoading: boolean
  fromToken: Token | null
  toToken: Token | null
  fromAmount: string
  routes: SwapRoute[]
  selectedRouteId: string | null
  error: string | null
  fromChain: Chain | null
  toChain: Chain | null
}

const initialState: SwapState = {
  isLoading: false,
  fromToken: null,
  toToken: null,
  fromAmount: '',
  routes: [],
  selectedRouteId: null,
  error: null,
  fromChain: null,
  toChain: null,
}

export const swapSlice: Slice<SwapState> = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
      if (action.payload) {
        state.error = null
      }
    },
    setFromToken: (state, action: PayloadAction<Token | null>) => {
      state.fromToken = action.payload
      // Reset routes when token changes
      state.routes = []
      state.selectedRouteId = null
    },
    setToToken: (state, action: PayloadAction<Token | null>) => {
      state.toToken = action.payload
      // Reset routes when token changes
      state.routes = []
      state.selectedRouteId = null
    },
    setFromAmount: (state, action: PayloadAction<string>) => {
      state.fromAmount = action.payload
      // Reset routes when amount changes
      state.routes = []
      state.selectedRouteId = null
    },
    setRoutes: (state, action: PayloadAction<SwapRoute[]>) => {
      state.routes = action.payload
      state.selectedRouteId = action.payload[0]?.id || null
    },
    selectRoute: (state, action: PayloadAction<string>) => {
      state.selectedRouteId = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    setChain: (state, action: PayloadAction<{ type: 'from' | 'to', chain: Chain }>) => {
      const { type, chain } = action.payload
      if (type === 'from') {
        state.fromChain = JSON.parse(JSON.stringify(chain))
        // Reset from token when chain changes
        if (state.fromToken?.chainId !== chain.id) {
          state.fromToken = null
        }
      } else {
        state.toChain = JSON.parse(JSON.stringify(chain))
        // Reset to token when chain changes
        if (state.toToken?.chainId !== chain.id) {
          state.toToken = null
        }
      }
      // Reset routes when chain changes
      state.routes = []
      state.selectedRouteId = null
    },
    resetSwap: (state) => {
      state.isLoading = false
      state.fromToken = null
      state.toToken = null
      state.fromAmount = ''
      state.routes = []
      state.selectedRouteId = null
      state.error = null
      state.fromChain = null
      state.toChain = null
    },
  },
})

export const {
  setLoading,
  setFromToken,
  setToToken,
  setFromAmount,
  setRoutes,
  selectRoute,
  setChain,
  setError,
  resetSwap,
} = swapSlice.actions

export default swapSlice.reducer 