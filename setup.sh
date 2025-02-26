#!/bin/bash

# Exit on error
set -e

echo "=== Existential Snake Game Setup ==="
echo "This script will set up both the backend and frontend components."
echo ""

# Check if UV is installed
if ! command -v uv &> /dev/null; then
    echo "UV is not installed. Installing UV..."
    curl -sSf https://astral.sh/uv/install.sh | sh
    
    # Reload shell configuration to make UV available
    if [[ -f "$HOME/.bashrc" ]]; then
        source "$HOME/.bashrc"
    elif [[ -f "$HOME/.zshrc" ]]; then
        source "$HOME/.zshrc"
    fi
    
    # Check if UV is now available
    if ! command -v uv &> /dev/null; then
        echo "WARNING: UV installation may have succeeded, but the 'uv' command is not available in the current shell."
        echo "You may need to open a new terminal or manually add UV to your PATH."
        echo "Please check the UV installation guide: https://github.com/astral-sh/uv"
        exit 1
    fi
    
    echo "UV installed successfully!"
else
    echo "UV is already installed."
fi

# Check if Rust/Cargo is installed (needed for pydantic-core)
if ! command -v cargo &> /dev/null; then
    echo "WARNING: Rust/Cargo is not installed. This is required to build pydantic-core."
    echo "Would you like to install Rust now? (y/n)"
    read -r install_rust
    
    if [[ "$install_rust" =~ ^[Yy]$ ]]; then
        echo "Installing Rust..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        
        # Source cargo environment
        source "$HOME/.cargo/env"
        
        echo "Rust installed successfully!"
    else
        echo "Continuing without Rust. Note that the installation might fail when building pydantic-core."
        echo "Alternative: You can modify backend/requirements.txt to use pydantic==1.10.8 instead of 2.4.2"
    fi
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "ERROR: Python is not installed or not in PATH."
    echo "Please install Python 3.8 or higher: https://www.python.org/downloads/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH."
    echo "Please install Node.js 14 or higher: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH."
    echo "Please install npm (usually comes with Node.js): https://nodejs.org/"
    exit 1
fi

# Setup backend
echo ""
echo "=== Setting up backend ==="
if [ ! -d "backend" ]; then
    echo "ERROR: 'backend' directory not found. Make sure you're running this script from the project root."
    exit 1
fi

cd backend

# Create virtual environment
echo "Creating virtual environment..."
uv venv

# Activate virtual environment
echo "Activating virtual environment..."
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
else
    echo "ERROR: Virtual environment activation script not found."
    echo "The virtual environment may not have been created correctly."
    exit 1
fi

# Install dependencies
echo "Installing backend dependencies..."
if [ -f "requirements.txt" ]; then
    # Try to install dependencies, but don't exit on error
    if ! uv pip install -r requirements.txt; then
        echo ""
        echo "WARNING: There was an error installing dependencies."
        echo "If the error is related to building pydantic-core, you need to install Rust."
        echo "You can install Rust with: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        echo ""
        echo "Alternatively, you can modify requirements.txt to use pydantic==1.10.8 instead of 2.4.2"
        echo "Would you like to use the older version of pydantic that doesn't require Rust? (y/n)"
        read -r use_older_pydantic
        
        if [[ "$use_older_pydantic" =~ ^[Yy]$ ]]; then
            echo "Updating requirements.txt to use pydantic==1.10.8..."
            sed -i 's/pydantic==2.4.2/pydantic==1.10.8/g' requirements.txt
            
            echo "Installing dependencies with older pydantic version..."
            uv pip install -r requirements.txt
        else
            echo "Please install Rust and try again."
            exit 1
        fi
    fi
else
    echo "ERROR: requirements.txt not found in the backend directory."
    exit 1
fi

# Return to root directory
cd ..

# Setup frontend
echo ""
echo "=== Setting up frontend ==="
if [ ! -d "frontend" ]; then
    echo "ERROR: 'frontend' directory not found. Make sure you're running this script from the project root."
    exit 1
fi

cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
if [ -f "package.json" ]; then
    npm install
else
    echo "ERROR: package.json not found in the frontend directory."
    exit 1
fi

# Return to root directory
cd ..

echo ""
echo "=== Setup completed successfully! ==="
echo ""
echo "To run the backend:"
echo "  cd backend"
echo "  source .venv/bin/activate"
echo "  uv run main.py"
echo ""
echo "To run the frontend (in a new terminal):"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Then open your browser and navigate to http://localhost:3000" 