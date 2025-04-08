#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from example_interfaces.srv import AddTwoInts
import sys

class TopicServiceClient(Node):
    def __init__(self):
        super().__init__('topic_service_client')
        
        # Create a subscription to a topic
        self.subscription = self.create_subscription(
            String,
            'input_topic',
            self.topic_callback,
            10  # QoS profile depth
        )
        self.get_logger().info('Subscribed to topic: input_topic')
        
        # Create a client for the service
        self.client = self.create_client(AddTwoInts, 'add_two_ints')
        
        # Wait for the service to be available
        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting...')
        
        self.get_logger().info('Connected to service: add_two_ints')
        self.get_logger().info('Node initialized and ready')

    def topic_callback(self, msg):
        """Callback function for the subscription."""
        self.get_logger().info(f'Received message: {msg.data}')
        
        # Parse the message (assuming it contains two integers separated by a space)
        try:
            a, b = map(int, msg.data.split())
            self.send_service_request(a, b)
        except ValueError:
            self.get_logger().error('Invalid message format. Expected "int int"')

    def send_service_request(self, a, b):
        """Send a service request with the given integers."""
        request = AddTwoInts.Request()
        request.a = a
        request.b = b
        
        self.get_logger().info(f'Sending service request: {a} + {b}')
        
        # Send the request asynchronously
        future = self.client.call_async(request)
        # Add a callback to be executed when the future is complete
        future.add_done_callback(self.service_response_callback)

    def service_response_callback(self, future):
        """Callback function for the service response."""
        try:
            response = future.result()
            self.get_logger().info(f'Service response: {response.sum}')
        except Exception as e:
            self.get_logger().error(f'Service call failed: {e}')

def main(args=None):
    rclpy.init(args=args)
    node = TopicServiceClient()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
