#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from graph_interfaces.msg import GraphConnection
from graph_interfaces.srv import GetGraph
import time

class GraphPublisher(Node):
    def __init__(self):
        super().__init__('graph_publisher')
        self.publisher = self.create_publisher(GraphConnection, '/graph_connections', 10)
        self.srv = self.create_service(GetGraph, '/get_graph', self.get_graph_callback)
        self.timer = self.create_timer(5.0, self.publish_connection)
        self.get_logger().info('Graph publisher node started')
        
        # Store some sample connections
        self.connections = [
            self.create_connection("controller_manager", "joint_state_broadcaster", True, False, False, "Controller Manager Connection"),
            self.create_connection("joint_state_broadcaster", "hardware_interface", False, True, True, "Hardware Interface Connection"),
            self.create_connection("controller_manager", "position_controllers", True, False, False, "Position Controller Connection"),
            self.create_connection("position_controllers", "hardware_interface", True, True, True, "Hardware Position Interface")
        ]
    
    def create_connection(self, start, end, cmd_if, state_if, is_hw, metadata):
        conn = GraphConnection()
        conn.start = start
        conn.end = end
        conn.command_interface = cmd_if
        conn.state_interface = state_if
        conn.is_hardware = is_hw
        conn.metadata = metadata
        return conn
    
    def publish_connection(self):
        # Publish a random connection from our list
        import random
        conn = random.choice(self.connections)
        self.publisher.publish(conn)
        self.get_logger().info(f'Published connection: {conn.start} -> {conn.end}')
    
    def get_graph_callback(self, request, response):
        self.get_logger().info('Received request for graph data')
        response.connections = self.connections
        return response

def main(args=None):
    rclpy.init(args=args)
    node = GraphPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
