// components/ros2-connector.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ConnectionData } from "@/types/ros2-types"
import { Checkbox } from "@/components/ui/checkbox"
import {
  fetchConnections,
  callGetGraphService,
  addConnection,
  resetConnections
} from "@/services/ros2-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ROS2ConnectorProps {
  onConnectionUpdate: (connected: boolean) => void
  onNewConnection: (connection: ConnectionData) => void
}

export function ROS2Connector({ onConnectionUpdate, onNewConnection }: ROS2ConnectorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [serviceName, setServiceName] = useState("/get_graph")
  const [manualStart, setManualStart] = useState("")
  const [manualEnd, setManualEnd] = useState("")
  const [commandInterface, setCommandInterface] = useState(false)
  const [stateInterface, setStateInterface] = useState(false)
  const [isHardware, setIsHardware] = useState(false)
  const [metadata, setMetadata] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Clear error message after 5 seconds
  const showError = (message: string) => {
    setErrorMessage(message)
    setTimeout(() => setErrorMessage(null), 5000)
  }

  // Connect to ROS 2 bridge
  const connectToROS = async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      console.log("Connecting to ROS 2 bridge...")

      // Test connection by fetching current connections
      const connections = await fetchConnections()

      setIsConnected(true)
      onConnectionUpdate(true)

      // Load initial connections
      connections.forEach(connection => {
        onNewConnection(connection)
      })

      console.log("Connected to ROS 2 bridge")
    } catch (error) {
      console.error("Failed to connect to ROS 2 bridge:", error)
      showError("Failed to connect to ROS 2 bridge. Is the server running?")
      setIsConnected(false)
      onConnectionUpdate(false)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectFromROS = async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      // Reset connections on disconnect
      await resetConnections()
      setIsConnected(false)
      onConnectionUpdate(false)
      console.log("Disconnected from ROS 2 bridge")
    } catch (error) {
      console.error("Error during disconnect:", error)
      showError("Error during disconnect from ROS 2 bridge")
    } finally {
      setIsLoading(false)
    }
  }

  const callService = async () => {
    if (!isConnected) return

    try {
      setIsLoading(true)
      setErrorMessage(null)
      console.log(`Calling service: ${serviceName}`)

      const connections = await callGetGraphService()

      if (connections && connections.length > 0) {
        connections.forEach(connection => {
          onNewConnection(connection)
        })
        console.log(`Received ${connections.length} connections from service`)
      } else {
        console.log("No connections received from service")
      }
    } catch (error) {
      console.error("Error calling service:", error)
      showError(`Error calling ${serviceName} service`)
    } finally {
      setIsLoading(false)
    }
  }

  const addManualConnection = async () => {
    if (!isConnected || !manualStart || !manualEnd) return

    try {
      setIsLoading(true)
      setErrorMessage(null)
      const newConnection: ConnectionData = {
        start: manualStart,
        end: manualEnd,
        commandInterface,
        stateInterface,
        isHardware,
        metadata: metadata || "User-defined connection",
      }

      const success = await addConnection(newConnection)

      if (success) {
        onNewConnection(newConnection)

        // Reset form
        setManualStart("")
        setManualEnd("")
        setCommandInterface(false)
        setStateInterface(false)
        setIsHardware(false)
        setMetadata("")
      } else {
        showError("Failed to add connection")
      }
    } catch (error) {
      console.error("Error adding manual connection:", error)
      showError("Error adding manual connection")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="service-name">Service Name</Label>
        <Input
          id="service-name"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          disabled={isConnected || isLoading}
        />
      </div>

      <Button
        className="w-full"
        onClick={isConnected ? disconnectFromROS : connectToROS}
        variant={isConnected ? "destructive" : "default"}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : isConnected ? "Disconnect" : "Connect to ROS 2"}
      </Button>

      {isConnected && (
        <>
          <Button
            className="w-full mt-2"
            onClick={callService}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Call Service"}
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
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 mt-2">
              <Label htmlFor="end-node">End Node</Label>
              <Input
                id="end-node"
                value={manualEnd}
                onChange={(e) => setManualEnd(e.target.value)}
                placeholder="e.g., joint_state_broadcaster"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="command-interface"
                checked={commandInterface}
                onCheckedChange={(checked) => setCommandInterface(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="command-interface">Command Interface</Label>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="state-interface"
                checked={stateInterface}
                onCheckedChange={(checked) => setStateInterface(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="state-interface">State Interface</Label>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="is-hardware"
                checked={isHardware}
                onCheckedChange={(checked) => setIsHardware(checked as boolean)}
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <Button
              className="w-full mt-4"
              onClick={addManualConnection}
              disabled={!manualStart || !manualEnd || isLoading}
            >
              Add Connection
            </Button>
          </div>
        </>
      )}
    </div>
  )
}