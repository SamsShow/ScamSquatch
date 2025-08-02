'use client'

import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Tooltip } from '@/components/ui/tooltip-new'
import { InfoIcon, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface Transaction {
  id: string
  type: 'swap' | 'bridge'
  status: 'completed' | 'pending' | 'failed'
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  timestamp: number
  riskScore: number
}

export function TransactionHistory() {
  // In MVP, we'll use mock data. Later this will come from API
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'swap',
      status: 'completed',
      fromToken: 'ETH',
      toToken: 'USDC',
      fromAmount: '1.5',
      toAmount: '2850.75',
      timestamp: Date.now() - 3600000,
      riskScore: 25
    },
    {
      id: '2',
      type: 'bridge',
      status: 'pending',
      fromToken: 'USDC',
      toToken: 'USDC',
      fromAmount: '1000',
      toAmount: '998',
      timestamp: Date.now() - 7200000,
      riskScore: 35
    }
  ])

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const formatTime = (timestamp: number) => {
    const hours = Math.floor((Date.now() - timestamp) / 3600000)
    if (hours < 1) return 'Just now'
    if (hours === 1) return '1 hour ago'
    if (hours < 24) return `${hours} hours ago`
    return `${Math.floor(hours / 24)} days ago`
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Recent Transactions</h2>
        <Tooltip content="Your recent cross-chain transactions and their risk scores">
          <InfoIcon className="w-5 h-5 text-muted-foreground" />
        </Tooltip>
      </div>

      <div className="space-y-4">
        {transactions.map(tx => (
          <div
            key={tx.id}
            className="p-4 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getStatusIcon(tx.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {tx.type === 'bridge' ? 'Bridge Transfer' : 'Token Swap'}
                    </span>
                    <div className={`px-2 py-0.5 rounded text-xs ${
                      tx.riskScore < 30 ? 'bg-green-500/20 text-green-500' :
                      tx.riskScore < 60 ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      Risk Score: {tx.riskScore}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(tx.timestamp)}
                  </span>
                </div>
              </div>
              <Tooltip content={`Transaction ${tx.status}`}>
                <div className={`px-2 py-1 rounded text-xs ${
                  tx.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                  tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </div>
              </Tooltip>
            </div>              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">From</div>
                  <div className="font-medium">{tx.fromAmount} {tx.fromToken}</div>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="space-y-1 text-right">
                  <div className="text-muted-foreground text-xs">To</div>
                  <div className="font-medium">{tx.toAmount} {tx.toToken}</div>
                </div>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet
          </div>
        )}
      </div>
    </Card>
  )
}
