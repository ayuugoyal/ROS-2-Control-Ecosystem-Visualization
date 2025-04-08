"use client"

import { useState } from "react"
import { ROS2Connector } from "@/components/ros2-connector"
import { GraphVisualizer } from "@/components/graph-visualizer"
import type { ConnectionData } from "@/types/ros2-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [connections, setConnections] = useState<ConnectionData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [statusMessage, setStatusMessage] = useState("Not connected to ROS 2")

  const handleConnectionUpdate = (connected: boolean) => {
    setIsConnected(connected)
    setStatusMessage(connected ? "Connected to ROS 2" : "Not connected to ROS 2")
  }

  const handleNewConnection = (connection: ConnectionData) => {
    setConnections((prev) => [...prev, connection])
  }

  const handleClearGraph = () => {
    setConnections([])
  }

  return (
    <main className="flex min-h-screen flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">ROS 2 Graph Visualizer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>ROS 2 Connection</CardTitle>
            <CardDescription>Connect to ROS 2 and subscribe to topics</CardDescription>
          </CardHeader>
          <CardContent>
            <ROS2Connector onConnectionUpdate={handleConnectionUpdate} onNewConnection={handleNewConnection} />
            <div className="mt-4">
              <p className={`text-sm ${isConnected ? "text-green-600" : "text-red-600"}`}>Status: {statusMessage}</p>
            </div>
            <Button variant="outline" className="mt-4 w-full" onClick={handleClearGraph}>
              Clear Graph
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Directed Acyclic Graph</CardTitle>
            <CardDescription>Visualization of ROS 2 connections</CardDescription>
          </CardHeader>
          <CardContent className="h-[600px]">
            <GraphVisualizer connections={connections} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

