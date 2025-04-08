"use client"

import { useCallback, useEffect, useState } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type NodeTypes,
  Panel,
  type NodeMouseHandler,
  type NodeProps,
} from "reactflow"
import "reactflow/dist/style.css"
import type { ConnectionData } from "@/types/ros2-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Custom node component to display metadata
function MetadataNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`px-4 py-2 rounded-md shadow-md border-2 ${selected ? "border-blue-500" : "border-gray-200"} ${data.isHardware ? "bg-amber-50" : "bg-white"}`}
    >
      <div className="font-bold">{data.label}</div>
      {data.isHardware && <div className="text-xs mt-1 text-amber-700 font-medium">Hardware Node</div>}
    </div>
  )
}

const nodeTypes: NodeTypes = {
  metadata: MetadataNode,
}

interface GraphVisualizerProps {
  connections: ConnectionData[]
}

export function GraphVisualizer({ connections }: GraphVisualizerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  // Process connections into nodes and edges
  useEffect(() => {
    if (connections.length === 0) {
      setNodes([])
      setEdges([])
      setSelectedNode(null)
      return
    }

    // Create a map of unique nodes
    const nodeMap = new Map<string, Node>()

    // Process all connections to extract nodes
    connections.forEach((connection) => {
      if (!nodeMap.has(connection.start)) {
        nodeMap.set(connection.start, {
          id: connection.start,
          type: "metadata",
          data: {
            label: connection.start,
            isHardware: connection.isHardware && connection.start.includes("hardware"),
          },
          position: {
            x: Math.random() * 400,
            y: Math.random() * 400,
          },
        })
      }

      if (!nodeMap.has(connection.end)) {
        nodeMap.set(connection.end, {
          id: connection.end,
          type: "metadata",
          data: {
            label: connection.end,
            isHardware: connection.isHardware,
          },
          position: {
            x: Math.random() * 400 + 200,
            y: Math.random() * 400 + 100,
          },
        })
      }
    })

    // Create edges from connections
    const newEdges: Edge[] = connections.map((connection, index) => {
      let edgeStyle = {}

      // Style edges based on interface type
      if (connection.commandInterface && !connection.stateInterface) {
        edgeStyle = { stroke: "#3b82f6", strokeWidth: 2 } // Blue for command interface
      } else if (!connection.commandInterface && connection.stateInterface) {
        edgeStyle = { stroke: "#10b981", strokeWidth: 2 } // Green for state interface
      } else if (connection.commandInterface && connection.stateInterface) {
        edgeStyle = { stroke: "#8b5cf6", strokeWidth: 2 } // Purple for both
      }

      return {
        id: `edge-${index}`,
        source: connection.start,
        target: connection.end,
        label: connection.metadata ? undefined : undefined,
        data: { metadata: connection.metadata },
        style: edgeStyle,
        animated: connection.commandInterface,
        type: "default",
      }
    })

    setNodes(Array.from(nodeMap.values()))
    setEdges(newEdges)
  }, [connections, setNodes, setEdges])

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />

        <Panel position="top-right">
          <div className="flex gap-2 mb-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-1"></div>
              <span className="text-xs">Command Interface</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-1"></div>
              <span className="text-xs">State Interface</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded-full mr-1"></div>
              <span className="text-xs">Both Interfaces</span>
            </div>
          </div>
        </Panel>

        {selectedNode && (
          <Panel position="bottom-center">
            <Card className="w-80">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Node Details: {selectedNode.data.label}</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-xs space-y-1">
                  <p>
                    <strong>ID:</strong> {selectedNode.id}
                  </p>
                  {selectedNode.data.isHardware && (
                    <p>
                      <strong>Type:</strong> Hardware Node
                    </p>
                  )}

                  <div className="mt-2">
                    <strong>Connections:</strong>
                    <ul className="list-disc pl-4 mt-1">
                      {edges
                        .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
                        .map((edge, index) => (
                          <li key={index} className="text-xs">
                            {edge.source === selectedNode.id ? `To: ${edge.target}` : `From: ${edge.source}`}
                            {edge.data?.metadata && ` - ${edge.data.metadata}`}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}

