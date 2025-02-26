# Check if Vercel CLI is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI..."
    npm install -g vercel
}

# Build the frontend
Write-Host "Building frontend..."
Set-Location -Path frontend
npm install
npm run build
Set-Location -Path ..

# Deploy to Vercel
Write-Host "Deploying to Vercel..."
vercel --confirm

Write-Host "Deployment complete! Your Existential Snake Game is now slithering in the cloud! 🐍✨" 