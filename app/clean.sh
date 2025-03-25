#!/bin/bash

# Function to remove all Docker images
remove_images() {
    echo "Removing all Docker images..."
    docker rmi $(docker images -q)
}

# Function to remove all Docker containers
remove_containers() {
    echo "Removing all Docker containers..."
    docker rm $(docker ps -a -q)
}

# Prompt for confirmation
read -p "Are you sure you want to remove all Docker images and containers? (y/n): " confirm

if [[ $confirm == [yY] ]]; then
    remove_containers
    remove_images
    echo "All Docker images and containers have been removed."
else
    echo "Operation cancelled."
fi