import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'

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
}

const initialState: SwapState = {
  isLoading: false,
  fromToken: null,
  toToken: null,
  fromAmount: '',
  routes: [],
  selectedRouteId: null,
  error: null,
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
    resetSwap: (state) => {
      state.isLoading = false
      state.fromToken = null
      state.toToken = null
      state.fromAmount = ''
      state.routes = []
      state.selectedRouteId = null
      state.error = null
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
  setError,
  resetSwap,
} = swapSlice.actions

export default swapSlice.reducer 