'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { setFromAmount, setLoading, setRoutes, setError } from '@/store/slices/swap'
import { ChainSelector } from '@/components/chain-selector'
import { scamsquatchApi, type QuoteResponse } from '@/lib/scamsquatchApi'
import { TokenSelector } from '@/components/token-selector'
import { EnhancedRouteList } from '@/components/enhanced-route-list'
import { BalanceFetcher } from '@/components/balance-fetcher'
import { formatBalance } from '@/lib/utils'

export function SwapForm() {
  const dispatch = useAppDispatch()
  const { address, chainId, balances } = useAppSelector((state) => state.wallet)
  const { fromToken, toToken, fromAmount, routes, isLoading, error, fromChain, toChain } = useAppSelector((state) => state.swap)
  
  const [showFromTokenSelector, setShowFromTokenSelector] = useState(false)
  const [showToTokenSelector, setShowToTokenSelector] = useState(false)
  const [quoteResponse, setQuoteResponse] = useState<QuoteResponse | null>(null)

  // Get the current balance for the selected token
  const getCurrentBalance = () => {
    if (!fromToken || !address || !chainId) return '0.00'
    
    const balance = balances.find(
      b => b.address === fromToken.address && 
           b.chainId === fromToken.chainId && 
           b.symbol === fromToken.symbol
    )
    
    if (!balance) return '0.00'
    return formatBalance(balance.balance, balance.decimals)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || !isNaN(parseFloat(value))) {
      (dispatch as any)(setFromAmount(value))
    }
  }

  // Check if we can find routes
  const canFindRoutes = Boolean(
    fromChain &&
    toChain &&
    fromToken && 
    toToken && 
    fromAmount && 
    parseFloat(fromAmount) > 0
  )

  const handleFindRoutes = async () => {
    if (!canFindRoutes || !fromToken || !toToken || !address || !fromChain || !toChain) return
    
    try {
      (dispatch as any)(setLoading(true))
      (dispatch as any)(setError(null))
      
      const response = await scamsquatchApi.getQuote({
        fromChain: fromChain.id,
        toChain: toChain.id,
        fromToken: fromToken.address,
        toToken: toToken.address,
        fromAmount,
        userAddress: address
      })

      if (response?.data) {
        setQuoteResponse(response)
        (dispatch as any)(setRoutes(response.data.routes))
      } else {
        (dispatch as any)(setError('Invalid response from server'))
      }
    } catch (err) {
      console.error('Error getting quote:', err)
      (dispatch as any)(setError('Failed to find routes. Please try again.'))
    } finally {
      (dispatch as any)(setLoading(false))
    }
  }

  return (
    <div className="space-y-6">
      {/* Balance Fetchers - These components fetch balances but don't render anything */}
      {address && chainId && (
        <>
          {/* Fetch ETH balance */}
          <BalanceFetcher 
            address={address} 
            chainId={chainId} 
            symbol="ETH" 
            decimals={18}
          />
          {/* Fetch balance for selected token if different from ETH */}
          {fromToken && fromToken.address !== '0x0000000000000000000000000000000000000000' && (
            <BalanceFetcher 
              address={address} 
              chainId={chainId} 
              tokenAddress={fromToken.address}
              symbol={fromToken.symbol} 
              decimals={fromToken.decimals}
            />
          )}
        </>
      )}

      <Card className="w-full p-4 bg-dark border-border/40">
        <div className="space-y-4">
          {/* From Chain */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">From Chain</span>
            </div>
            <ChainSelector type="from" />
          </div>

          {/* From Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="text-sm text-muted-foreground">
                Balance: {getCurrentBalance()} {fromToken?.symbol || 'ETH'}
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
          {/* To Chain */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">To Chain</span>
            </div>
            <ChainSelector type="to" />
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
            {!fromChain || !toChain
              ? 'Select Chains'
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
      {routes.length > 0 && quoteResponse?.data && (
        <EnhancedRouteList routes={routes} riskAssessments={quoteResponse.data.riskAssessments} />
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