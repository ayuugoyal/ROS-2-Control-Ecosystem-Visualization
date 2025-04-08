#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class ServiceProvider(Node):
    def __init__(self):
        super().__init__('service_provider')
        self.srv = self.create_service(
            AddTwoInts, 
            'add_two_ints', 
            self.add_two_ints_callback
        )
        self.get_logger().info('Service provider node started, service: add_two_ints')

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Received request: {request.a} + {request.b} = {response.sum}')
        return response

def main(args=None):
    rclpy.init(args=args)
    service_provider = ServiceProvider()
    
    try:
        rclpy.spin(service_provider)
    except KeyboardInterrupt:
        pass
    finally:
        service_provider.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
