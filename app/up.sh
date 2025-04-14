#!/bin/bash

# Function to get local IP address
get_local_ip() {
    # This works on most Unix-like systems including macOS and Linux
    ip=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)
    echo $ip
}

# Get the local IP address
LOCAL_IP=$(get_local_ip)
LOCAL_IP="localhost"

# Start backend and frontend in parallel
(
    echo "Starting server..."
    echo $(pwd)
    cd app
    npm run dev -- -p 3000
) &

(
    echo "Starting resourcing jobs..."
    echo $(pwd)
    cd app/src/app/api/jobs
    echo $(pwd)
    tsc resource_job.ts
) &

# Wait for both processes
wait

echo "Both servers have been stopped."