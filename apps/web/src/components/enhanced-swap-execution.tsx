'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAccount, useWalletClient } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { setError } from '@/store/slices/swap'
import type { RootState } from '@/store'
import { scamsquatchApi } from '@/lib/scamsquatchApi'

interface SimulationData {
  simulation: {
    success: boolean
    gasUsed: string
    gasLimit: string
    gasPrice: string
    totalCost: string
    error?: string
  }
  approval: {
    required: boolean
    currentAllowance: string
    requiredAllowance: string
    approvalGas: string
    approvalCost: string
  }
  security: {
    tokenDrainRisk: boolean
    suspiciousPatterns: string[]
    warnings: string[]
    recommendations: string[]
  }
  preview: {
    inputAmount: string
    outputAmount: string
    priceImpact: number
    slippage: number
    fees: {
      protocol: string
      gas: string
      total: string
    }
  }
}

export function EnhancedSwapExecution() {
  const dispatch = useDispatch()
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { selectedRouteId, routes } = useSelector((state: RootState) => state.swap)
  
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null)
  const [showSimulation, setShowSimulation] = useState(false)

  const selectedRoute = routes.find(route => route.id === selectedRouteId)

  // Simulate transaction when route changes
  useEffect(() => {
    if (selectedRoute && address) {
      handleSimulateTransaction()
    }
  }, [selectedRoute, address])

  const handleSimulateTransaction = async () => {
    if (!selectedRoute || !address) return

    try {
      setIsSimulating(true)
      
      const response = await scamsquatchApi.simulateTransaction({
        routeId: selectedRoute.id,
        userAddress: address,
        fromAmount: selectedRoute.fromAmount,
        toAmount: selectedRoute.toAmount,
        slippage: 0.5
      })

      if (response?.success && response.data) {
        setSimulationData(response.data)
        setShowSimulation(true)
      } else {
        console.error('Simulation failed:', response?.error)
      }
    } catch (error) {
      console.error('Error simulating transaction:', error)
    } finally {
      setIsSimulating(false)
    }
  }

  const handleExecuteSwap = async () => {
    if (!selectedRoute || !address || !walletClient) {
      return
    }

    try {
      setIsExecuting(true)
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setError(null))

      // For MVP, we'll simulate the swap execution
      // In production, this would:
      // 1. Get the swap transaction from 1inch
      // 2. Sign it with the wallet
      // 3. Submit it to the network
      // 4. Monitor the transaction

      console.log('Executing swap:', {
        route: selectedRoute,
        userAddress: address,
      })

      // Simulate transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`
      setTxHash(mockTxHash)

      // In real implementation:
      // const swapTx = await oneInchAPI.executeSwap({
      //   routeId: selectedRoute.route.id,
      //   userAddress: address,
      //   signature: await walletClient.signMessage(...)
      // })

    } catch (error) {
      // @ts-expect-error - Redux action creators are properly typed
      dispatch(setError((error as Error).message))
    } finally {
      setIsExecuting(false)
    }
  }

  const formatAmount = (amount: string, decimals: number) => {
    const num = parseFloat(amount) / Math.pow(10, decimals)
    return num.toFixed(6)
  }

  const formatGas = (gas: string) => {
    const num = parseFloat(gas)
    return num > 1000000 ? `${(num / 1000000).toFixed(2)}M` : num.toLocaleString()
  }

  const formatCost = (cost: string) => {
    const num = parseFloat(cost) / Math.pow(10, 18) // Convert from wei to ETH
    return num.toFixed(6)
  }

  if (!selectedRoute) {
    return (
      <Card className="p-4 bg-dark border-border/40">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Execute Swap</h3>
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-4">🔒</div>
            <p>Select tokens and find routes to see swap execution options</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-dark border-border/40">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Execute Swap</h3>
        
        {/* Swap Summary */}
        <div className="space-y-3 p-3 bg-dark-accent rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You Pay:</span>
            <span className="font-medium">
              {formatAmount(selectedRoute.fromAmount, selectedRoute.fromToken.decimals)} {selectedRoute.fromToken.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You Receive:</span>
            <span className="font-medium">
              {formatAmount(selectedRoute.toAmount, selectedRoute.toToken.decimals)} {selectedRoute.toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price Impact:</span>
            <span className={`font-medium ${
              selectedRoute.priceImpact > 5 ? 'text-orange-500' : 'text-green-500'
            }`}>
              {selectedRoute.priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Gas:</span>
            <span className="font-medium">
              {formatGas(selectedRoute.estimatedGas)}
            </span>
          </div>
        </div>

        {/* Simulation Results */}
        {isSimulating && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
            <div className="text-sm text-blue-500">
              🔍 Simulating transaction...
            </div>
          </div>
        )}

        {simulationData && showSimulation && (
          <div className="space-y-4">
            {/* Approval Status */}
            {simulationData.approval.required && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <div className="text-sm text-yellow-500 font-medium mb-2">
                  ⚠️ Approval Required
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Current Allowance: {formatAmount(simulationData.approval.currentAllowance, 18)}</div>
                  <div>Required Allowance: {formatAmount(simulationData.approval.requiredAllowance, 18)}</div>
                  <div>Approval Gas: {formatGas(simulationData.approval.approvalGas)}</div>
                  <div>Approval Cost: {formatCost(simulationData.approval.approvalCost)} ETH</div>
                </div>
              </div>
            )}

            {/* Security Warnings */}
            {simulationData.security.tokenDrainRisk && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <div className="text-sm text-red-500 font-medium mb-2">
                  🚨 Security Warnings
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  {simulationData.security.warnings.map((warning, index) => (
                    <div key={index}>• {warning}</div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-blue-500">
                  <div className="font-medium">Recommendations:</div>
                  {simulationData.security.recommendations.map((rec, index) => (
                    <div key={index}>• {rec}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Gas Estimation */}
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <div className="text-sm text-green-500 font-medium mb-2">
                ⛽ Gas Estimation
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Gas Used: {formatGas(simulationData.simulation.gasUsed)}</div>
                <div>Gas Limit: {formatGas(simulationData.simulation.gasLimit)}</div>
                <div>Gas Price: {formatCost(simulationData.simulation.gasPrice)} ETH</div>
                <div>Total Cost: {formatCost(simulationData.simulation.totalCost)} ETH</div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="p-3 bg-dark-accent rounded-md">
              <div className="text-sm font-medium mb-2">💰 Fee Breakdown</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Protocol Fee:</span>
                  <span>{formatCost(simulationData.preview.fees.protocol)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Gas Fee:</span>
                  <span>{formatCost(simulationData.preview.fees.gas)} ETH</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Fee:</span>
                  <span>{formatCost(simulationData.preview.fees.total)} ETH</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {txHash && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
            <div className="text-sm text-green-500">
              Transaction submitted! Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSimulating}
            onClick={handleSimulateTransaction}
          >
            {isSimulating ? 'Simulating...' : '🔍 Simulate Transaction'}
          </Button>

          <Button
            className="w-full bg-brand hover:bg-brand-dark"
            disabled={isExecuting || (simulationData?.security.tokenDrainRisk && !showSimulation)}
            onClick={handleExecuteSwap}
          >
            {isExecuting ? 'Executing Swap...' : 'Execute Swap'}
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground text-center">
          By executing this swap, you agree to the terms and acknowledge that cryptocurrency transactions are irreversible.
        </div>
      </div>
    </Card>
  )
} 