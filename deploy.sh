#!/bin/bash

# Make script executable
chmod +x deploy.sh

# Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --confirm

echo "Deployment complete! Your Existential Snake Game is now slithering in the cloud! 🐍✨" 