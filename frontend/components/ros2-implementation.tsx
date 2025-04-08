"use client"

import { useEffect, useState, useRef } from "react"
import { ConnectionData } from "@/types/ros2-types"

export function useROS2() {
  const [isConnected, setIsConnected] = useState(false)
  const [connections, setConnections] = useState<ConnectionData[]>([])
  const nodeRef = useRef<any>(null)
  const rclnodejsRef = useRef<any>(null)
  
  // Initialize ROS 2 connection
  const initialize = async () => {
    try {
      const rclnodejs = await import('rclnodejs')
      rclnodejsRef.current = rclnodejs
      
      await rclnodejs.init()
      const node = rclnodejs.createNode('graph_visualizer_node')
      nodeRef.current = node
      
      console.log("Initialized ROS 2 connection")
      setIsConnected(true)
      return true
    } catch (error) {
      console.error("Failed to initialize ROS 2:", error)
      setIsConnected(false)
      return false
    }
  }
  
  // Subscribe to a topic
  const subscribeToTopic = (topicName: string) => {
    if (!isConnected || !nodeRef.current) {
      console.error("Cannot subscribe: ROS 2 not connected")
      return false
    }
    
    try {
      const subscription = nodeRef.current.createSubscription(
        'graph_interfaces/msg/GraphConnection',
        topicName,
        (msg: any) => {
          const newConnection: ConnectionData = {
            start: msg.start,
            end: msg.end,
            commandInterface: msg.command_interface,
            stateInterface: msg.state_interface,
            isHardware: msg.is_hardware,
            metadata: msg.metadata
          }
          setConnections(prev => [...prev, newConnection])
          console.log(`Received new connection: ${newConnection.start} -> ${newConnection.end}`)
        }
      )
      
      console.log(`Subscribed to topic: ${topicName}`)
      return true
    } catch (error) {
      console.error(`Failed to subscribe to topic ${topicName}:`, error)
      return false
    }
  }
  
  // Call a service
  const callService = async (serviceName: string) => {
    if (!isConnected || !nodeRef.current) {
      console.error("Cannot call service: ROS 2 not connected")
      return null
    }
    
    try {
      const client = nodeRef.current.createClient(
        'graph_interfaces/srv/GetGraph',
        serviceName
      )
      
      // Wait for service to be available
      console.log(`Waiting for service: ${serviceName}`)
      await new Promise<void>((resolve) => {
        const checkService = () => {
          if (client.isServiceServerAvailable()) {
            resolve()
          } else {
            setTimeout(checkService, 1000)
          }
        }
        checkService()
      })
      
      console.log(`Calling service: ${serviceName}`)
      const response = await client.sendRequest({})
      
      if (response && response.connections) {
        const receivedConnections: ConnectionData[] = response.connections.map((conn: any) => ({
          start: conn.start,
          end: conn.end,
          commandInterface: conn.command_interface,
          stateInterface: conn.state_interface,
          isHardware: conn.is_hardware,
          metadata: conn.metadata
        }))
        
        setConnections(receivedConnections)
        return receivedConnections
      }
      
      return null
    } catch (error) {
      console.error(`Failed to call service ${serviceName}:`, error)
      return null
    }
  }
  
  // Shutdown ROS 2 connection
  const shutdown = async () => {
    if (!isConnected || !rclnodejsRef.current) {
      return true
    }
    
    try {
      await rclnodejsRef.current.shutdown()
      nodeRef.current = null
      
      console.log("Shut down ROS 2 connection")
      setIsConnected(false)
      return true
    } catch (error) {
      console.error("Failed to shut down ROS 2:", error)
      return false
    }
  }
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (isConnected && rclnodejsRef.current) {
        rclnodejsRef.current.shutdown()
          .catch((err: any) => console.error("Error shutting down ROS 2:", err))
      }
    }
  }, [isConnected])
  
  return {
    isConnected,
    connections,
    initialize,
    subscribeToTopic,
    callService,
    shutdown
  }
}
