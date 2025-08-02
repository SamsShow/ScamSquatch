'use client'

import { Card } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip-new'
import { InfoIcon } from 'lucide-react'
import { useAccount, useBalance, useChainId, useConfig } from 'wagmi'

interface TokenBalance {
  symbol: string
  amount: string
  value: number
  chain: string
  change?: string
}

export function PortfolioOverview() {
  const { address } = useAccount()
  const chainId = useChainId()
  const config = useConfig()
  const chainName = config.chains.find(c => c.id === chainId)?.name || 'Unknown Chain'

  // In MVP, we'll show mock data for demonstration
  const tokenBalances: TokenBalance[] = [
    {
      symbol: 'ETH',
      amount: '2.5',
      value: 4750.25,
      chain: 'Ethereum',
      change: '+5.2%'
    },
    {
      symbol: 'USDC',
      amount: '2500',
      value: 2500,
      chain: 'Polygon',
      change: '0%'
    },
    {
      symbol: 'BNB',
      amount: '3.2',
      value: 750.40,
      chain: 'BSC',
      change: '-2.1%'
    },
    {
      symbol: 'AVAX',
      amount: '45',
      value: 585.00,
      chain: 'Avalanche',
      change: '+8.5%'
    }
  ]

  const totalValue = tokenBalances.reduce((sum, token) => sum + token.value, 0)

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Portfolio Overview</h2>
        <Tooltip content="Your current holdings across supported chains">
          <InfoIcon className="w-5 h-5 text-muted-foreground" />
        </Tooltip>
      </div>

      <div className="space-y-6">
        <div className="p-4 rounded-lg border border-border bg-background/50">
          <div className="text-sm text-muted-foreground mb-1">Total Value</div>
          <div className="text-3xl font-bold">${totalValue.toLocaleString()}</div>
        </div>

        <div className="space-y-4">
          {tokenBalances.map((token, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">{token.symbol[0]}</span>
                  </div>
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-xs text-muted-foreground">{token.chain}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${token.value.toLocaleString()}</div>
                  {token.change && (
                    <div className={`text-xs ${
                      token.change.startsWith('+') ? 'text-green-500' :
                      token.change.startsWith('-') ? 'text-red-500' :
                      'text-muted-foreground'
                    }`}>
                      {token.change}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">Amount:</div>
                <div>{token.amount} {token.symbol}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-center text-muted-foreground">
          Connected to {chainName}
        </div>
      </div>
    </Card>
  )
}
