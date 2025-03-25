# Use the official Node.js image as the base image
FROM node:20

# Set the working directory
WORKDIR /.

# Copy package.json and package-lock.json (if available)
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend files
COPY backend/ ./

# Expose the port the app runs on
EXPOSE 3000

# Start the frontend (use `start` instead of `dev` for production)
CMD ["npm", "run", "dev", "--host", "3000"]
