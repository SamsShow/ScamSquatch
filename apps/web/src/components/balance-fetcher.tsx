'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useBalance } from 'wagmi'
import { setBalance } from '@/store/slices/wallet'
import { formatEther } from 'viem'

interface BalanceFetcherProps {
  address: string
  chainId: number
  tokenAddress?: string
  symbol?: string
  decimals?: number
}

export function BalanceFetcher({ 
  address, 
  chainId, 
  tokenAddress, 
  symbol = 'ETH', 
  decimals = 18 
}: BalanceFetcherProps) {
  const dispatch = useDispatch()
  
  const { data: balanceData, isLoading, error } = useBalance({
    address: address as `0x${string}`,
    chainId,
    token: tokenAddress as `0x${string}` | undefined,
    watch: true,
  })

  useEffect(() => {
    if (balanceData && !isLoading && !error) {
      const formattedBalance = formatEther(balanceData.value)
      
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setBalance({
        symbol,
        balance: formattedBalance,
        decimals,
        chainId,
        address: tokenAddress || '0x0000000000000000000000000000000000000000', // ETH address
      }))
      
      console.log(`BalanceFetcher: Updated ${symbol} balance to ${formattedBalance} on chain ${chainId}`)
    } else if (error) {
      console.error(`BalanceFetcher: Error fetching ${symbol} balance:`, error)
    } else if (isLoading) {
      console.log(`BalanceFetcher: Loading ${symbol} balance...`)
    }
  }, [balanceData, isLoading, error, dispatch, symbol, decimals, chainId, tokenAddress])

  // This component doesn't render anything, it just fetches and syncs balances
  return null
} 