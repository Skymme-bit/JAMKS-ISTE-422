#!/bin/bash

echo "========================"
echo "Starting Deployment Script"
echo "========================"

# Step 1: Install Dependencies
echo "Installing npm dependencies..."
npm install

# Step 2: Lint Code
echo "Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
  echo "Linting failed. Deployment aborted."
  exit 1
fi

# Step 3: Run Tests
echo "Running unit tests..."
npm run test
if [ $? -ne 0 ]; then
  echo "Tests failed. Deployment aborted."
  exit 1
fi

# Step 4: Build Project
echo "Building the project..."
npm run build
if [ $? -ne 0 ]; then
  echo "Build failed. Deployment aborted."
  exit 1
fi

# Step 5: Start Server
echo "Starting server..."
node dist/server.js &

# Step 6: Health Check
echo "Waiting for server to start..."
sleep 5

echo "Checking server root URL..."
curl --fail http://localhost:3001/health || {
    echo "Health check failed. Deployment aborted."
    exit 1
}

echo "========================"
echo "Deployment Successful!"
echo "========================"