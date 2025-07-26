'use client'

import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { setFromAmount } from '@/store/slices/swap'
import type { RootState } from '@/store'

export function SwapForm() {
  const dispatch = useDispatch()
  const { isConnected } = useSelector((state: RootState) => state.wallet)
  const { fromAmount, isLoading } = useSelector((state: RootState) => state.swap)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFromAmount(e.target.value))
  }

  return (
    <Card className="w-full p-4 bg-dark border-border/40">
      <div className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">From</span>
            <span className="text-sm text-muted-foreground">
              Balance: 0.00 ETH
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="border-border/40 hover:bg-dark-accent"
            >
              Select Token
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

        {/* Swap Button */}
        <Button
          className="w-full bg-brand hover:bg-brand-dark"
          disabled={!isConnected || isLoading}
        >
          {!isConnected
            ? 'Connect Wallet'
            : isLoading
            ? 'Finding Routes...'
            : 'Find Secure Routes'}
        </Button>
      </div>
    </Card>
  )
} 