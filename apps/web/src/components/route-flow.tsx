'use client'

import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  EdgeTypes,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { riskScoringService, type RiskAssessment } from '@/lib/services/risk-scoring'
import { DetailedRiskBreakdown } from '@/components/detailed-risk-breakdown'
import type { RouteInfo } from '@/lib/api/1inch'

interface RouteFlowProps {
  route: RouteInfo
  riskAssessment: RiskAssessment
  onSafeAlternative?: () => void
}

// Custom node types
const RouteNode = ({ data }: { data: any }) => (
  <div className={`px-4 py-2 rounded-lg border-2 ${data.nodeType === 'token' ? 'bg-blue-500/20 border-blue-500' : 'bg-green-500/20 border-green-500'}`}>
    <div className="text-sm font-medium">{data.label}</div>
    {data.subtitle && <div className="text-xs text-muted-foreground">{data.subtitle}</div>}
  </div>
)

const ProtocolNode = ({ data }: { data: any }) => (
  <div className={`px-3 py-2 rounded-lg border-2 ${data.riskLevel === 'LOW' ? 'bg-green-500/20 border-green-500' : data.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 border-yellow-500' : data.riskLevel === 'HIGH' ? 'bg-orange-500/20 border-orange-500' : 'bg-red-500/20 border-red-500'}`}>
    <div className="text-sm font-medium">{data.label}</div>
    <div className="text-xs text-muted-foreground">{data.subtitle}</div>
  </div>
)

const RiskNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 rounded-lg border-2 bg-red-500/20 border-red-500">
    <div className="text-sm font-medium text-red-500">{data.label}</div>
    <div className="text-xs text-red-400">{data.subtitle}</div>
  </div>
)

export function RouteFlow({ route, riskAssessment, onSafeAlternative }: RouteFlowProps) {
  const [showDetailedRisk, setShowDetailedRisk] = useState(false)
  
  const nodeTypes: NodeTypes = useMemo(() => ({
    routeNode: RouteNode,
    protocolNode: ProtocolNode,
    riskNode: RiskNode,
  }), [])

  // Create nodes for the flow
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = []
    let nodeId = 0

    // Start token node
    nodes.push({
      id: `node-${nodeId++}`,
      type: 'routeNode',
      position: { x: 0, y: 100 },
      data: {
        label: route.fromToken.symbol,
        subtitle: `${route.fromToken.name} (${route.fromToken.chainId})`,
        nodeType: 'token',
      },
    })

    // Protocol nodes
    route.protocols.forEach((protocol, index) => {
      const isTrusted = riskScoringService.isProtocolTrusted(protocol)
      const riskLevel = isTrusted ? 'LOW' : 'HIGH'
      
      nodes.push({
        id: `node-${nodeId++}`,
        type: 'protocolNode',
        position: { x: 200 + (index * 150), y: 100 },
        data: {
          label: protocol,
          subtitle: isTrusted ? 'Trusted' : 'Untrusted',
          riskLevel,
        },
      })
    })

    // End token node
    nodes.push({
      id: `node-${nodeId++}`,
      type: 'routeNode',
      position: { x: 200 + (route.protocols.length * 150), y: 100 },
      data: {
        label: route.toToken.symbol,
        subtitle: `${route.toToken.name} (${route.toToken.chainId})`,
        nodeType: 'token',
      },
    })

    // Risk assessment nodes (positioned below the main flow)
    riskAssessment.factors.forEach((factor, index) => {
      nodes.push({
        id: `risk-${index}`,
        type: 'riskNode',
        position: { x: 50 + (index * 200), y: 250 },
        data: {
          label: factor,
          subtitle: 'Risk Factor',
        },
      })
    })

    return nodes
  }, [route, riskAssessment])

  // Create edges for the flow
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = []
    let nodeId = 0

    // Connect start token to first protocol
    edges.push({
      id: `edge-${nodeId++}`,
      source: `node-0`,
      target: `node-1`,
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    })

    // Connect protocols in sequence
    for (let i = 1; i < route.protocols.length; i++) {
      edges.push({
        id: `edge-${nodeId++}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
        type: 'smoothstep',
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      })
    }

    // Connect last protocol to end token
    edges.push({
      id: `edge-${nodeId++}`,
      source: `node-${route.protocols.length}`,
      target: `node-${route.protocols.length + 1}`,
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    })

    return edges
  }, [route])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Route Flow Visualization</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetailedRisk(!showDetailedRisk)}
          >
            {showDetailedRisk ? 'Hide' : 'Show'} Detailed Risk
          </Button>
          {onSafeAlternative && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSafeAlternative}
              className="text-green-500 border-green-500 hover:bg-green-500/10"
            >
              Suggest Safe Alternative
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4 bg-dark border-border/40">
        <div className="h-96 w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <Background color="#374151" gap={16} />
          </ReactFlow>
        </div>
      </Card>

      {/* Risk Breakdown */}
      <Card className="p-4 bg-dark border-border/40">
        <h4 className="text-md font-semibold mb-3">Risk Breakdown</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Risk Score:</span>
            <span className={`font-medium ${riskScoringService.getRiskLevelColor(riskAssessment.level)}`}>
              {riskAssessment.score.toFixed(0)}/100 ({riskAssessment.level})
            </span>
          </div>
          
          {riskAssessment.warnings.length > 0 && (
            <div className="mt-3">
              <h5 className="text-sm font-medium mb-2">Warnings:</h5>
              <div className="space-y-1">
                {riskAssessment.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-red-400 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Detailed Risk Breakdown */}
      {showDetailedRisk && (
        <DetailedRiskBreakdown route={route} riskAssessment={riskAssessment} />
      )}
    </div>
  )
} 