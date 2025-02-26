# Existential Snake Game

A unique twist on the classic Snake game where the snake experiences existential dread and quotes philosophers. The game includes a food rotting mechanic, and the snake will comment when you eat rotten food.

> **For detailed gameplay information, features, and game mechanics, please see [GAMEPLAY.md](GAMEPLAY.md)**

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Why UV Instead of pip?](#why-uv-instead-of-pip)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Python](https://www.python.org/) (v3.8 or higher)
- [UV](https://github.com/astral-sh/uv) (Fast Python package installer)
- [Rust](https://www.rust-lang.org/tools/install) (Required for building pydantic-core)

> **Note**: If you don't want to install Rust, you can use the alternative requirements file `backend/requirements-no-rust.txt` which uses an older version of pydantic that doesn't require Rust compilation.

## Installation

### Installing Rust

Rust is required to build some Python packages. Install it using:

- **Windows/macOS/Linux**:
  ```
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```
  
  After installation, restart your terminal or run:
  ```
  source "$HOME/.cargo/env"
  ```

### Quick Setup (Recommended)

We've provided setup scripts that will automatically install UV (if not already installed), set up virtual environments, and install all dependencies:

- **Linux/macOS**:
  ```
  chmod +x setup.sh
  ./setup.sh
  ```

- **Windows** (Run in PowerShell):
  ```
  .\setup.ps1
  ```

After running the setup script, follow the instructions displayed to run the backend and frontend servers.

### Manual Setup

#### Installing UV

If you don't have UV installed yet, you can install it using the following commands:

- **Windows** (Run in PowerShell):
  ```
  curl -sSf https://astral.sh/uv/install.ps1 | powershell
  ```

- **macOS/Linux**:
  ```
  curl -sSf https://astral.sh/uv/install.sh | sh
  ```

#### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment using UV:
   ```
   uv venv
   ```

3. Activate the virtual environment:
   - On Windows (Command Prompt):
     ```
     .venv\Scripts\activate
     ```
   - On Windows (PowerShell):
     ```
     .\.venv\Scripts\Activate.ps1
     ```
   - On macOS/Linux:
     ```
     source .venv/bin/activate
     ```

4. Install the required dependencies using UV:
   
   **With Rust installed** (default):
   ```
   uv pip install -r requirements.txt
   ```
   
   **Without Rust** (uses older pydantic version):
   ```
   uv pip install -r requirements-no-rust.txt
   ```

5. Start the FastAPI server:
   ```
   uv run main.py
   ```

   The backend server will start running at `http://localhost:8000`.

#### Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

   The frontend application will start running at `http://localhost:3000`.

## Project Structure

```
existential-snake-game/
├── backend/
│   ├── main.py                      # FastAPI server
│   ├── requirements.txt             # Python dependencies (requires Rust)
│   ├── requirements-no-rust.txt     # Python dependencies (no Rust required)
│   └── data/                        # Directory for storing game data
├── frontend/
│   ├── public/                      # Static files
│   ├── src/                         # React source code
│   │   ├── components/              # React components
│   │   │   ├── SnakeGame.js         # Main game component
│   │   │   ├── StartScreen.js       # Start screen component
│   │   │   └── EndScreen.js         # End screen component
│   │   ├── App.js                   # Main App component
│   │   ├── App.css                  # App styles
│   │   └── index.js                 # Entry point
│   └── package.json                 # Node.js dependencies
├── setup.sh                         # Setup script for Linux/macOS
├── setup.ps1                        # Setup script for Windows
├── README.md                        # Installation and technical documentation
└── GAMEPLAY.md                      # Game information and mechanics
```

## Why UV Instead of pip?

UV is a modern Python package installer and resolver that offers several advantages over pip:

- **Speed**: UV is significantly faster (often 10-100x) than pip for package installation
- **Reliability**: More reliable dependency resolution
- **Compatibility**: Compatible with pip's command-line interface
- **Safety**: Written in Rust for performance and safety
- **Environment Management**: The `uv run` command ensures scripts run in the correct environment with all dependencies available, eliminating common "module not found" errors

## Troubleshooting

- **Backend Connection Issues**: Make sure the FastAPI server is running at `http://localhost:8000`.
- **CORS Errors**: The backend is configured to allow requests from any origin. If you encounter CORS issues, check your browser's security settings.
- **Game Performance**: If the game is running slowly, try closing other applications or tabs in your browser.
- **UV Issues**: If you encounter issues with UV, check the [official documentation](https://github.com/astral-sh/uv).
- **Virtual Environment Activation Issues**: 
  - On Windows, if you're using PowerShell, make sure to use `.\.venv\Scripts\Activate.ps1`
  - On Windows, if you're using Command Prompt, use `.venv\Scripts\activate`
  - On macOS/Linux, use `source .venv/bin/activate`
- **Pydantic-core Build Error**: 
  - If you see an error like `Failed to build pydantic-core` with `Cargo metadata failed`, you need to install Rust.
  - Install Rust using `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - After installing Rust, restart your terminal or run `source "$HOME/.cargo/env"` to update your PATH.
  - Then try installing the dependencies again.
  - **Alternative Solution**: Use the provided `requirements-no-rust.txt` file instead of `requirements.txt`

## License

This project is open source and available under the [MIT License](LICENSE).