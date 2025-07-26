'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import {
  setAddress,
  setConnected,
  setConnecting,
  setError,
} from '@/store/slices/wallet'
import type { RootState } from '@/store'

export function ConnectButton() {
  const dispatch = useDispatch()
  const { isConnecting } = useSelector((state: RootState) => state.wallet)
  const { connect, connectors, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()

  // Sync wagmi state with Redux
  useEffect(() => {
    if (address) {
      dispatch(setAddress(address))
      dispatch(setConnected(true))
    } else {
      dispatch(setAddress(null))
      dispatch(setConnected(false))
    }
  }, [address, dispatch])

  const handleConnect = async () => {
    try {
      dispatch(setConnecting(true))
      // For MVP, just use the first available connector (usually injected/metamask)
      const connector = connectors[0]
      if (connector) {
        await connect({ connector })
      } else {
        throw new Error('No wallet connector available')
      }
    } catch (error) {
      dispatch(setError((error as Error).message))
    } finally {
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
      disabled={isLoading || isConnecting}
    >
      {isLoading || isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
} 