import { configureStore } from '@reduxjs/toolkit'
import walletReducer from './slices/wallet'
import swapReducer from './slices/swap'

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    swap: swapReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['wallet/setProvider'],
        ignoredPaths: ['wallet.provider'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 