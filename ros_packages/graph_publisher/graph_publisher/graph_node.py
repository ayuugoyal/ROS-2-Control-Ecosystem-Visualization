#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from graph_interfaces.msg import GraphConnection
from graph_interfaces.srv import GetGraph
import time
import random

class GraphPublisherNode(Node):
    def __init__(self):
        super().__init__('graph_publisher_node')
        
        # Store graph connections
        self.connections = []
        
        # Create a publisher for graph connections
        self.publisher = self.create_publisher(
            GraphConnection, 
            '/graph_connections', 
            10
        )
        
        # Create a service for getting the complete graph
        self.service = self.create_service(
            GetGraph,
            '/get_graph',
            self.get_graph_callback
        )
        
        # Initialize with some example connections
        self._initialize_example_connections()
        
        # Timer to publish random new connections every 10 seconds
        self.create_timer(10.0, self.publish_random_connection)
        
        self.get_logger().info('Graph publisher node is running')
    
    def _initialize_example_connections(self):
        """Initialize with some standard ROS 2 control connections"""
        connections = [
            {
                'start': 'controller_manager',
                'end': 'joint_state_broadcaster',
                'command_interface': True,
                'state_interface': False,
                'is_hardware': False,
                'metadata': 'Controller Manager Connection'
            },
            {
                'start': 'joint_state_broadcaster',
                'end': 'hardware_interface',
                'command_interface': False,
                'state_interface': True,
                'is_hardware': True,
                'metadata': 'Hardware Interface Connection'
            },
            {
                'start': 'controller_manager',
                'end': 'position_controllers',
                'command_interface': True, 
                'state_interface': False,
                'is_hardware': False,
                'metadata': 'Position Controller Connection'
            },
            {
                'start': 'position_controllers',
                'end': 'hardware_interface',
                'command_interface': True,
                'state_interface': True, 
                'is_hardware': True,
                'metadata': 'Hardware Control Interface'
            }
        ]
        
        for conn in connections:
            self.add_connection(conn)
    
    def add_connection(self, conn_data):
        """Add a new connection and publish it"""
        msg = GraphConnection()
        msg.start = conn_data['start']
        msg.end = conn_data['end']
        msg.command_interface = conn_data['command_interface']
        msg.state_interface = conn_data['state_interface']
        msg.is_hardware = conn_data['is_hardware']
        msg.metadata = conn_data['metadata']
        
        self.connections.append(msg)
        self.publisher.publish(msg)
        self.get_logger().info(f'Published connection: {msg.start} -> {msg.end}')
    
    def publish_random_connection(self):
        """Publish a random new connection occasionally"""
        node_names = [
            'controller_manager', 'joint_state_broadcaster', 'position_controllers',
            'hardware_interface', 'velocity_controllers', 'effort_controllers',
            'robot_state_publisher', 'rviz', 'parameter_server'
        ]
        
        start = random.choice(node_names)
        end = random.choice([n for n in node_names if n != start])
        
        connection = {
            'start': start,
            'end': end,
            'command_interface': random.choice([True, False]),
            'state_interface': random.choice([True, False]),
            'is_hardware': 'hardware' in start or 'hardware' in end,
            'metadata': f'Random connection {time.time()}'
        }
        
        self.add_connection(connection)
    
    def get_graph_callback(self, request, response):
        """Service callback to return all connections"""
        response.connections = self.connections
        self.get_logger().info('Graph requested')
        self.get_logger().info(f'Graph has {len(self.connections)} connections')
        return response

def main(args=None):
    rclpy.init(args=args)
    node = GraphPublisherNode()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()