'use client'

import { Chain } from 'viem'
import { Button } from '@/components/ui/button'
import { chains } from '@/config/wagmi'
import { useDispatch, useSelector } from 'react-redux'
import { setChain } from '@/store/slices/swap'
import type { RootState } from '@/store'

interface ChainSelectorProps {
  type: 'from' | 'to'
}

export function ChainSelector({ type }: ChainSelectorProps) {
  const dispatch = useDispatch()
  const { fromChain, toChain } = useSelector((state: RootState) => state.swap)

  const handleChainSelect = (chain: Chain) => {
    (dispatch as any)(setChain({ type, chain }))
  }

  return (
    <div className="flex flex-row gap-2 items-center">
      {chains.map((chain) => (
        <Button
          key={chain.id}
          variant={
            (type === 'from' && fromChain?.id === chain.id) || 
            (type === 'to' && toChain?.id === chain.id)
              ? 'default'
              : 'outline'
          }
          size="sm"
          className="flex items-center gap-2 h-8 px-3 border-border/40 hover:bg-dark-accent"
          onClick={() => handleChainSelect(chain)}
        >
          {chain.name}
        </Button>
      ))}
    </div>
  )
}
