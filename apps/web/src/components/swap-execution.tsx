'use client'

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount, useWalletClient } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { setError } from '@/store/slices/swap'
import type { RootState } from '@/store'

export function SwapExecution() {
  const dispatch = useDispatch()
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { selectedRouteId, routes } = useSelector((state: RootState) => state.swap)
  
  const [isExecuting, setIsExecuting] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const selectedRoute = routes.find(route => route.id === selectedRouteId)

  const handleExecuteSwap = async () => {
    if (!selectedRoute || !address || !walletClient) {
      return
    }

    try {
      setIsExecuting(true)
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setError(null))

      // For MVP, we'll simulate the swap execution
      // In production, this would:
      // 1. Get the swap transaction from 1inch
      // 2. Sign it with the wallet
      // 3. Submit it to the network
      // 4. Monitor the transaction

      console.log('Executing swap:', {
        route: selectedRoute,
        userAddress: address,
      })

      // Simulate transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`
      setTxHash(mockTxHash)

      // In real implementation:
      // const swapTx = await oneInchAPI.executeSwap({
      //   routeId: selectedRoute.route.id,
      //   userAddress: address,
      //   signature: await walletClient.signMessage(...)
      // })

    } catch (error) {
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setError((error as Error).message))
    } finally {
      setIsExecuting(false)
    }
  }

  if (!selectedRoute) {
    return (
      <Card className="p-4 bg-dark border-border/40">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Execute Swap</h3>
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-4">🔒</div>
            <p>Select tokens and find routes to see swap execution options</p>
          </div>
        </div>
      </Card>
    )
  }

  const formatAmount = (amount: string, decimals: number) => {
    const num = parseFloat(amount) / Math.pow(10, decimals)
    return num.toFixed(6)
  }

  return (
    <Card className="p-4 bg-dark border-border/40">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Execute Swap</h3>
        
        {/* Swap Summary */}
        <div className="space-y-3 p-3 bg-dark-accent rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You Pay:</span>
            <span className="font-medium">
              {formatAmount(selectedRoute.fromAmount, selectedRoute.fromToken.decimals)} {selectedRoute.fromToken.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You Receive:</span>
            <span className="font-medium">
              {formatAmount(selectedRoute.toAmount, selectedRoute.toToken.decimals)} {selectedRoute.toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price Impact:</span>
            <span className={`font-medium ${
              selectedRoute.priceImpact > 5 ? 'text-orange-500' : 'text-green-500'
            }`}>
              {selectedRoute.priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Gas:</span>
            <span className="font-medium">
              {parseFloat(selectedRoute.estimatedGas).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Transaction Status */}
        {txHash && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
            <div className="text-sm text-green-500">
              Transaction submitted! Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </div>
          </div>
        )}

        {/* Execute Button */}
        <Button
          className="w-full bg-brand hover:bg-brand-dark"
          disabled={isExecuting}
          onClick={handleExecuteSwap}
        >
          {isExecuting ? 'Executing Swap...' : 'Execute Swap'}
        </Button>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground text-center">
          By executing this swap, you agree to the terms and acknowledge that cryptocurrency transactions are irreversible.
        </div>
      </div>
    </Card>
  )
} 