'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import { Button } from '@/components/ui/button'
import {
  setAddress,
  setConnected,
  setConnecting,
  setError,
  setChainId,
} from '@/store/slices/wallet'
import type { RootState } from '@/store'

export function ConnectButton() {
  const dispatch = useDispatch()
  const { isConnecting } = useSelector((state: RootState) => state.wallet)
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  // Sync wagmi state with Redux
  useEffect(() => {
    // @ts-expect-error - Redux action creators are properly typed
    dispatch(setAddress(address || null))
    // @ts-expect-error - Redux action creators are properly typed
    dispatch(setConnected(isConnected))
    // @ts-expect-error - Redux action creators are properly typed
    dispatch(setChainId(chainId || null))
  }, [address, isConnected, chainId, dispatch])

  const handleConnect = async () => {
    try {
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setConnecting(true))
      // For MVP, just use the first available connector (usually injected/metamask)
      const connector = connectors[0]
      if (connector) {
        await connect({ connector })
      } else {
        throw new Error('No wallet connector available')
      }
    } catch (error) {
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setError((error as Error).message))
    } finally {
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setConnecting(false))
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  if (isConnected) {
    return (
      <Button
        variant="outline"
        className="border-brand hover:border-brand-dark"
        onClick={handleDisconnect}
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </Button>
    )
  }

  return (
    <Button
      variant="default"
      className="bg-brand hover:bg-brand-dark"
      onClick={handleConnect}
      disabled={isPending || isConnecting}
    >
      {isPending || isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
} 