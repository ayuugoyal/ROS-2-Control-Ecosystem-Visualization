from setuptools import setup

package_name = 'graph_publisher'

setup(
    name=package_name,
    version='0.0.1',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Ayush Goyal',
    maintainer_email='ayushgoyal8178@gmail.com',
    description='ROS 2 Graph Publisher for Visualization',
    license='Apache License 2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'graph_node = graph_publisher.graph_node:main',
        ],
    },
)