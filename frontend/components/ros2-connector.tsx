"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ConnectionData } from "@/types/ros2-types"
import { Checkbox } from "@/components/ui/checkbox"

interface ROS2ConnectorProps {
  onConnectionUpdate: (connected: boolean) => void
  onNewConnection: (connection: ConnectionData) => void
}

export function ROS2Connector({ onConnectionUpdate, onNewConnection }: ROS2ConnectorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [topicName, setTopicName] = useState("/graph_connections")
  const [serviceName, setServiceName] = useState("/get_graph")
  const [manualStart, setManualStart] = useState("")
  const [manualEnd, setManualEnd] = useState("")
  const [commandInterface, setCommandInterface] = useState(false)
  const [stateInterface, setStateInterface] = useState(false)
  const [isHardware, setIsHardware] = useState(false)
  const [metadata, setMetadata] = useState("")

  // Simulate connecting to ROS 2
  const connectToROS = async () => {
    try {
      // In a real implementation, this would use rclnodejs to connect to ROS 2
      console.log("Connecting to ROS 2...")

      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsConnected(true)
      onConnectionUpdate(true)

      // Start simulated subscription
      startSimulatedSubscription()

      console.log("Connected to ROS 2")
    } catch (error) {
      console.error("Failed to connect to ROS 2:", error)
      setIsConnected(false)
      onConnectionUpdate(false)
    }
  }

  const disconnectFromROS = () => {
    setIsConnected(false)
    onConnectionUpdate(false)
    console.log("Disconnected from ROS 2")
  }

  const startSimulatedSubscription = () => {
    // In a real implementation, this would subscribe to the actual ROS 2 topic
    console.log(`Subscribing to topic: ${topicName}`)
  }

  const callService = async () => {
    // In a real implementation, this would call a ROS 2 service
    console.log(`Calling service: ${serviceName}`)

    // Simulate service response delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simulate receiving graph data from service
    const sampleConnections: ConnectionData[] = [
      {
        start: "controller_manager",
        end: "joint_state_broadcaster",
        commandInterface: true,
        stateInterface: false,
        isHardware: false,
        metadata: "Controller Manager Connection",
      },
      {
        start: "joint_state_broadcaster",
        end: "hardware_interface",
        commandInterface: false,
        stateInterface: true,
        isHardware: true,
        metadata: "Hardware Interface Connection",
      },
      {
        start: "controller_manager",
        end: "position_controllers",
        commandInterface: true,
        stateInterface: false,
        isHardware: false,
        metadata: "Position Controller Connection",
      },
    ]

    sampleConnections.forEach((connection) => {
      onNewConnection(connection)
    })
  }

  const addManualConnection = () => {
    if (manualStart && manualEnd) {
      const newConnection: ConnectionData = {
        start: manualStart,
        end: manualEnd,
        commandInterface,
        stateInterface,
        isHardware,
        metadata: metadata || "User-defined connection",
      }

      onNewConnection(newConnection)

      // Reset form
      setManualStart("")
      setManualEnd("")
      setCommandInterface(false)
      setStateInterface(false)
      setIsHardware(false)
      setMetadata("")
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="topic-name">Topic Name</Label>
        <Input
          id="topic-name"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          disabled={isConnected}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-name">Service Name</Label>
        <Input
          id="service-name"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          disabled={isConnected}
        />
      </div>

      <Button
        className="w-full"
        onClick={isConnected ? disconnectFromROS : connectToROS}
        variant={isConnected ? "destructive" : "default"}
      >
        {isConnected ? "Disconnect" : "Connect to ROS 2"}
      </Button>

      {isConnected && (
        <>
          <Button className="w-full mt-2" onClick={callService} variant="outline">
            Call Service
          </Button>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium mb-2">Add Manual Connection</h3>

            <div className="space-y-2">
              <Label htmlFor="start-node">Start Node</Label>
              <Input
                id="start-node"
                value={manualStart}
                onChange={(e) => setManualStart(e.target.value)}
                placeholder="e.g., controller_manager"
              />
            </div>

            <div className="space-y-2 mt-2">
              <Label htmlFor="end-node">End Node</Label>
              <Input
                id="end-node"
                value={manualEnd}
                onChange={(e) => setManualEnd(e.target.value)}
                placeholder="e.g., joint_state_broadcaster"
              />
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="command-interface"
                checked={commandInterface}
                onCheckedChange={(checked) => setCommandInterface(checked as boolean)}
              />
              <Label htmlFor="command-interface">Command Interface</Label>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="state-interface"
                checked={stateInterface}
                onCheckedChange={(checked) => setStateInterface(checked as boolean)}
              />
              <Label htmlFor="state-interface">State Interface</Label>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="is-hardware"
                checked={isHardware}
                onCheckedChange={(checked) => setIsHardware(checked as boolean)}
              />
              <Label htmlFor="is-hardware">Is Hardware</Label>
            </div>

            <div className="space-y-2 mt-2">
              <Label htmlFor="metadata">Metadata</Label>
              <Input
                id="metadata"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                placeholder="Additional information"
              />
            </div>

            <Button className="w-full mt-4" onClick={addManualConnection} disabled={!manualStart || !manualEnd}>
              Add Connection
            </Button>
          </div>
        </>
      )}
    </div>
  )
}


