'use client'

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { setFromAmount, setLoading, setRoutes, setError } from '@/store/slices/swap'
import { oneInchAPI } from '@/lib/api/1inch'
import { riskScoringService, type RiskAssessment } from '@/lib/services/risk-scoring'
import { TokenSelector } from '@/components/token-selector'
import { RouteList } from '@/components/route-list'
import type { RootState } from '@/store'

export function SwapForm() {
  const dispatch = useDispatch()
  const { isConnected, address } = useSelector((state: RootState) => state.wallet)
  const { fromToken, toToken, fromAmount, routes, isLoading, error } = useSelector((state: RootState) => state.swap)
  
  const [showFromTokenSelector, setShowFromTokenSelector] = useState(false)
  const [showToTokenSelector, setShowToTokenSelector] = useState(false)
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // @ts-expect-error - Redux action creators are properly typed
    dispatch(setFromAmount(e.target.value))
  }

  const handleFindRoutes = async () => {
    if (!isConnected || !address || !fromToken || !toToken || !fromAmount) {
      return
    }

    try {
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setLoading(true))
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setError(null))

      // Convert amount to wei
      const amountInWei = (parseFloat(fromAmount) * Math.pow(10, fromToken.decimals)).toString()

      const quote = await oneInchAPI.getRoutes({
        fromToken: fromToken.address,
        toToken: toToken.address,
        fromAmount: amountInWei,
        fromChainId: fromToken.chainId,
        toChainId: toToken.chainId,
        userAddress: address,
      })

      if (quote.error) {
        // @ts-expect-error - Redux action creators are properly typed
        dispatch(setError(quote.error))
        return
      }

      // Assess risk for each route
      const assessments = riskScoringService.assessRoutesRisk(quote.routes)
      setRiskAssessments(assessments)

      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setRoutes(quote.routes))
    } catch (error) {
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setError((error as Error).message))
    } finally {
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setLoading(false))
    }
  }

  const canFindRoutes = isConnected && fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0

  return (
    <div className="space-y-6">
      <Card className="w-full p-4 bg-dark border-border/40">
        <div className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="text-sm text-muted-foreground">
                Balance: 0.00 {fromToken?.symbol || 'ETH'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="border-border/40 hover:bg-dark-accent"
                onClick={() => setShowFromTokenSelector(true)}
              >
                {fromToken ? fromToken.symbol : 'Select Token'}
              </Button>
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={handleAmountChange}
                className="bg-dark-accent border-border/40"
              />
            </div>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">To</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="border-border/40 hover:bg-dark-accent"
                onClick={() => setShowToTokenSelector(true)}
              >
                {toToken ? toToken.symbol : 'Select Token'}
              </Button>
              <div className="flex-1 h-10 bg-dark-accent border border-border/40 rounded-md flex items-center px-3 text-muted-foreground">
                {toToken && fromAmount && fromToken ? 'Calculating...' : '0.0'}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <div className="text-sm text-red-500">{error}</div>
            </div>
          )}

          {/* Find Routes Button */}
          <Button
            className="w-full bg-brand hover:bg-brand-dark"
            disabled={!canFindRoutes || isLoading}
            onClick={handleFindRoutes}
          >
            {!isConnected
              ? 'Connect Wallet'
              : !fromToken || !toToken
              ? 'Select Tokens'
              : !fromAmount || parseFloat(fromAmount) <= 0
              ? 'Enter Amount'
              : isLoading
              ? 'Finding Routes...'
              : 'Find Secure Routes'}
          </Button>
        </div>
      </Card>

      {/* Routes Display */}
      {routes.length > 0 && (
        <RouteList routes={routes} riskAssessments={riskAssessments} />
      )}

      {/* Token Selectors */}
      {showFromTokenSelector && (
        <TokenSelector type="from" onClose={() => setShowFromTokenSelector(false)} />
      )}
      {showToTokenSelector && (
        <TokenSelector type="to" onClose={() => setShowToTokenSelector(false)} />
      )}
    </div>
  )
} 