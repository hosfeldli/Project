#!/bin/bash

# Define container names
FRONTEND_CONTAINER="frontend_app"
BACKEND_CONTAINER="backend_app"

# Define Docker images
FRONTEND_IMAGE="frontend_app_image"
BACKEND_IMAGE="backend_app_image"

# Define Dockerfile paths
FRONTEND_DOCKERFILE="./frontend/Dockerfile"
BACKEND_DOCKERFILE="./backend/Dockerfile"

# Function to build and run a container
run_container() {
    local container_name=$1
    local image_name=$2
    local dockerfile_path=$3

    # Check if the container is already running
    if [ "$(docker ps -q -f name=$container_name)" ]; then
        echo "Container $container_name is already running."
    else
        # Check if the container exists but is not running
        if [ "$(docker ps -aq -f status=exited -f name=$container_name)" ]; then
            echo "Starting existing container $container_name..."
            docker start $container_name
        else
            # Build and run the container
            echo "Building and running container $container_name..."
            docker build -t $image_name -f $dockerfile_path .
            docker run -d --name $container_name -p 3000:3000 $image_name
        fi
    fi
}

# Run containers for both React apps
run_container $FRONTEND_CONTAINER $FRONTEND_IMAGE $FRONTEND_DOCKERFILE
run_container $BACKEND_CONTAINER $BACKEND_IMAGE $BACKEND_DOCKERFILE

echo "Both React app containers are up and running."