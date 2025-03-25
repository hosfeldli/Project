#!/bin/bash

# Define container names
FRONTEND_CONTAINER="frontend_app"
BACKEND_CONTAINER="backend_app"

# Function to stop and remove a container
stop_container() {
    local container_name=$1

    # Check if the container is running
    if [ "$(docker ps -q -f name=$container_name)" ]; then
        echo "Stopping container $container_name..."
        docker stop $container_name
        echo "Removing container $container_name..."
        docker rm $container_name
    else
        echo "Container $container_name is not running."
    fi
}

# Prompt user for which containers to stop
echo "Which container(s) would you like to stop?"
echo "1) Frontend"
echo "2) Backend"
echo "3) Both"
read -p "Enter your choice (1/2/3): " choice

case $choice in
    1)
        stop_container $FRONTEND_CONTAINER
        ;;
    2)
        stop_container $BACKEND_CONTAINER
        ;;
    3)
        stop_container $FRONTEND_CONTAINER
        stop_container $BACKEND_CONTAINER
        ;;
    *)
        echo "Invalid choice. Exiting."
        ;;
esac

echo "Selected containers have been stopped and removed."