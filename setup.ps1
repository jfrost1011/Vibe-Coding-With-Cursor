# Existential Snake Game Setup Script for Windows
# This script sets up both the backend and frontend components

Write-Host "=== Existential Snake Game Setup ===" -ForegroundColor Cyan
Write-Host "This script will set up both the backend and frontend components."
Write-Host ""

# Check if UV is installed
$uvInstalled = $null
try {
    $uvInstalled = Get-Command uv -ErrorAction Stop
} catch {
    $uvInstalled = $null
}

if ($null -eq $uvInstalled) {
    Write-Host "UV is not installed. Installing UV..." -ForegroundColor Yellow
    try {
        Invoke-Expression "& { $(Invoke-RestMethod https://astral.sh/uv/install.ps1) }"
        
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")
        
        # Verify installation
        try {
            $uvInstalled = Get-Command uv -ErrorAction Stop
            Write-Host "UV installed successfully!" -ForegroundColor Green
        } catch {
            Write-Host "WARNING: UV installation may have succeeded, but the 'uv' command is not available in the current shell." -ForegroundColor Red
            Write-Host "You may need to open a new PowerShell window or manually add UV to your PATH."
            Write-Host "Please check the UV installation guide: https://github.com/astral-sh/uv"
            exit 1
        }
    } catch {
        Write-Host "ERROR: Failed to install UV. Please install it manually." -ForegroundColor Red
        Write-Host "Visit: https://github.com/astral-sh/uv"
        exit 1
    }
} else {
    Write-Host "UV is already installed." -ForegroundColor Green
}

# Check if Rust/Cargo is installed (needed for pydantic-core)
$cargoInstalled = $null
try {
    $cargoInstalled = Get-Command cargo -ErrorAction Stop
    Write-Host "Rust/Cargo is already installed." -ForegroundColor Green
} catch {
    Write-Host "WARNING: Rust/Cargo is not installed. This is required to build pydantic-core." -ForegroundColor Yellow
    $installRust = Read-Host "Would you like to install Rust now? (y/n)"
    
    if ($installRust -eq "y" -or $installRust -eq "Y") {
        Write-Host "Installing Rust..." -ForegroundColor Yellow
        try {
            Invoke-WebRequest -Uri https://win.rustup.rs/x86_64 -OutFile rustup-init.exe
            Start-Process -FilePath .\rustup-init.exe -ArgumentList "-y" -Wait
            Remove-Item -Path .\rustup-init.exe
            
            # Refresh PATH to include Rust
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")
            
            Write-Host "Rust installed successfully!" -ForegroundColor Green
        } catch {
            Write-Host "ERROR: Failed to install Rust. Please install it manually from https://rustup.rs/" -ForegroundColor Red
            Write-Host "Continuing without Rust. Note that the installation might fail when building pydantic-core."
        }
    } else {
        Write-Host "Continuing without Rust. Note that the installation might fail when building pydantic-core." -ForegroundColor Yellow
        Write-Host "Alternative: You can modify backend/requirements.txt to use pydantic==1.10.8 instead of 2.4.2"
    }
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Found Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Python 3.8 or higher: https://www.python.org/downloads/"
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Found Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js 14 or higher: https://nodejs.org/"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "Found npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install npm (usually comes with Node.js): https://nodejs.org/"
    exit 1
}

# Setup backend
Write-Host ""
Write-Host "=== Setting up backend ===" -ForegroundColor Cyan

if (-not (Test-Path -Path "backend")) {
    Write-Host "ERROR: 'backend' directory not found. Make sure you're running this script from the project root." -ForegroundColor Red
    exit 1
}

Set-Location -Path "backend"

# Create virtual environment
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
try {
    uv venv
} catch {
    Write-Host "ERROR: Failed to create virtual environment." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
if (Test-Path -Path ".\.venv\Scripts\Activate.ps1") {
    try {
        & ".\.venv\Scripts\Activate.ps1"
    } catch {
        Write-Host "ERROR: Failed to activate virtual environment." -ForegroundColor Red
        Write-Host $_.Exception.Message
        exit 1
    }
} else {
    Write-Host "ERROR: Virtual environment activation script not found." -ForegroundColor Red
    Write-Host "The virtual environment may not have been created correctly."
    exit 1
}

# Install dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
if (Test-Path -Path "requirements.txt") {
    try {
        uv pip install -r requirements.txt
    } catch {
        Write-Host "" 
        Write-Host "WARNING: There was an error installing dependencies." -ForegroundColor Yellow
        Write-Host "If the error is related to building pydantic-core, you need to install Rust."
        Write-Host "You can install Rust from: https://rustup.rs/"
        Write-Host ""
        Write-Host "Alternatively, you can modify requirements.txt to use pydantic==1.10.8 instead of 2.4.2"
        $useOlderPydantic = Read-Host "Would you like to use the older version of pydantic that doesn't require Rust? (y/n)"
        
        if ($useOlderPydantic -eq "y" -or $useOlderPydantic -eq "Y") {
            Write-Host "Updating requirements.txt to use pydantic==1.10.8..." -ForegroundColor Yellow
            (Get-Content -Path "requirements.txt") -replace "pydantic==2.4.2", "pydantic==1.10.8" | Set-Content -Path "requirements.txt"
            
            Write-Host "Installing dependencies with older pydantic version..." -ForegroundColor Yellow
            uv pip install -r requirements.txt
        } else {
            Write-Host "Please install Rust and try again." -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "ERROR: requirements.txt not found in the backend directory." -ForegroundColor Red
    exit 1
}

# Return to root directory
Set-Location -Path ".."

# Setup frontend
Write-Host ""
Write-Host "=== Setting up frontend ===" -ForegroundColor Cyan

if (-not (Test-Path -Path "frontend")) {
    Write-Host "ERROR: 'frontend' directory not found. Make sure you're running this script from the project root." -ForegroundColor Red
    exit 1
}

Set-Location -Path "frontend"

# Install dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
if (Test-Path -Path "package.json") {
    try {
        npm install
    } catch {
        Write-Host "ERROR: Failed to install frontend dependencies." -ForegroundColor Red
        Write-Host $_.Exception.Message
        exit 1
    }
} else {
    Write-Host "ERROR: package.json not found in the frontend directory." -ForegroundColor Red
    exit 1
}

# Return to root directory
Set-Location -Path ".."

Write-Host ""
Write-Host "=== Setup completed successfully! ===" -ForegroundColor Green
Write-Host ""
Write-Host "To run the backend:" -ForegroundColor Cyan
Write-Host "  cd backend"
Write-Host "  .\.venv\Scripts\Activate.ps1"
Write-Host "  uv run main.py"
Write-Host ""
Write-Host "To run the frontend (in a new terminal):" -ForegroundColor Cyan
Write-Host "  cd frontend"
Write-Host "  npm start"
Write-Host ""
Write-Host "Then open your browser and navigate to http://localhost:3000" 