'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { setFromToken, setToToken } from '@/store/slices/swap'
import { oneInchAPI, type TokenInfo } from '@/lib/api/1inch'
import { chains } from '@/config/wagmi'
import type { RootState } from '@/store'

interface TokenSelectorProps {
  type: 'from' | 'to'
  onClose: () => void
}

export function TokenSelector({ type, onClose }: TokenSelectorProps) {
  const dispatch = useDispatch()
  const { chainId } = useSelector((state: RootState) => state.wallet)
  const { fromToken, toToken } = useSelector((state: RootState) => state.swap)
  
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [filteredTokens, setFilteredTokens] = useState<TokenInfo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load tokens for current chain
  useEffect(() => {
    if (chainId) {
      loadTokens(chainId)
    }
  }, [chainId])

  // Filter tokens based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = tokens.filter(
        (token) =>
          token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTokens(filtered)
    } else {
      setFilteredTokens(tokens)
    }
  }, [searchTerm, tokens])

  const loadTokens = async (chainId: number) => {
    try {
      setIsLoading(true)
      const tokenList = await oneInchAPI.getTokens(chainId)
      setTokens(tokenList)
      setFilteredTokens(tokenList)
    } catch (error) {
      console.error('Failed to load tokens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTokenSelect = (token: TokenInfo) => {
    if (type === 'from') {
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setFromToken(token))
    } else {
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setToToken(token))
    }
    onClose()
  }

  const getChainName = (chainId: number) => {
    return chains.find((chain) => chain.id === chainId)?.name || `Chain ${chainId}`
  }

  const isTokenSelected = (token: TokenInfo) => {
    if (type === 'from') {
      return fromToken?.address === token.address && fromToken?.chainId === token.chainId
    } else {
      return toToken?.address === token.address && toToken?.chainId === token.chainId
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6 bg-dark border-border/40">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Select {type === 'from' ? 'From' : 'To'} Token
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          </div>

          {/* Chain Info */}
          {chainId && (
            <div className="text-sm text-muted-foreground">
              Network: {getChainName(chainId)}
            </div>
          )}

          {/* Search */}
          <Input
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-dark-accent border-border/40"
          />

          {/* Token List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading tokens...
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tokens found
              </div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={`${token.chainId}-${token.address}`}
                  onClick={() => handleTokenSelect(token)}
                  disabled={isTokenSelected(token)}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    isTokenSelected(token)
                      ? 'bg-brand/20 border-brand text-brand'
                      : 'bg-dark-accent border-border/40 hover:bg-dark-accent/80 hover:border-border/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Token Icon Placeholder */}
                      <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-xs font-medium">
                        {token.symbol.slice(0, 2).toUpperCase()}
                      </div>
                      
                      <div className="text-left">
                        <div className="font-medium text-foreground">
                          {token.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {token.name}
                        </div>
                      </div>
                    </div>
                    
                    {isTokenSelected(token) && (
                      <div className="text-brand">✓</div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Popular Tokens */}
          {!searchTerm && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Popular Tokens
              </h4>
              <div className="flex flex-wrap gap-2">
                {tokens.slice(0, 6).map((token) => (
                  <Button
                    key={`popular-${token.chainId}-${token.address}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTokenSelect(token)}
                    disabled={isTokenSelected(token)}
                    className={`${
                      isTokenSelected(token)
                        ? 'bg-brand/20 border-brand text-brand'
                        : 'border-border/40 hover:bg-dark-accent'
                    }`}
                  >
                    {token.symbol}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
} 