<p align = "center" draggable="false" ><img src="https://github.com/AI-Maker-Space/LLM-Dev-101/assets/37101144/d1343317-fa2f-41e1-8af1-1dbb18399719" 
     width="200px"
     height="auto"/>
</p>

# 🚀 Setting Up Cursor and UV

This guide will help you set up Cursor (an AI-powered code editor) and UV (a fast Python package installer) for your development environment.

> **Want to play the game?** Check out [GAMEPLAY.md](GAMEPLAY.md) for all the details! 🎮

## 📋 Table of Contents

- [Prerequisites](#prerequisites) 🛠️
- [Installation Guide](#installation) 🚀
- [Project Structure](#project-structure) 🏗️
- [Why Use UV Instead of pip](#why-uv) ⚡
- [Troubleshooting](#troubleshooting) 🔧
- [License](#license) 📜

## 🛠️ Prerequisites <a name="prerequisites"></a>

Before you begin, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Python](https://www.python.org/) (v3.8 or higher)

## 🚀 Installation Guide <a name="installation"></a>

### ⚡ Quick Setup

We've created scripts that automate the setup process:

- **Linux/macOS**:
  ```
  chmod +x setup.sh
  ./setup.sh
  ```

- **Windows** (Run in PowerShell):
  ```
  .\setup.ps1
  ```

After running the script, follow the on-screen instructions.

### 🔧 Manual Setup

#### Installing UV

If you don't have UV yet, install it with these commands:

- **Windows** (Run in PowerShell):
  ```
  curl -sSf https://astral.sh/uv/install.ps1 | powershell
  ```

- **macOS/Linux**:
  ```
  curl -sSf https://astral.sh/uv/install.sh | sh
  ```

#### Installing Cursor

1. Visit [cursor.sh](https://cursor.sh/) and download the installer for your OS
2. Run the installer and follow the prompts
3. Launch Cursor and open your project folder
4. Enjoy the power of AI-assisted coding! ✨

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
   ```
   uv pip install -r requirements.txt
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

   The frontend will start at `http://localhost:3000`.

## 🏗️ Project Structure <a name="project-structure"></a>

```
project/
├── backend/                         # Backend code
│   ├── main.py                      # FastAPI server
│   ├── requirements.txt             # Python dependencies
│   └── data/                        # Data files
├── frontend/                        # Frontend code
│   ├── public/                      # Static files
│   ├── src/                         # React source code
│   │   ├── components/              # React components
│   │   ├── App.js                   # Main App component
│   │   ├── App.css                  # Styles
│   │   └── index.js                 # Entry point
│   └── package.json                 # Node.js dependencies
├── setup.sh                         # Setup script for Linux/macOS
├── setup.ps1                        # Setup script for Windows
├── README.md                        # This file
└── GAMEPLAY.md                      # Game details
```

## ⚡ Why Use UV Instead of pip <a name="why-uv"></a>

UV offers several advantages over traditional pip:

- **Speed**: UV is 10-100x faster than pip
- **Reliability**: Better dependency resolution
- **Compatibility**: Works with pip's commands
- **Safety**: Written in a safe language
- **Environment Management**: The `uv run` command ensures everything runs in the correct environment

## 🔧 Troubleshooting <a name="troubleshooting"></a>

- **Backend Connection Issues**: Make sure the FastAPI server is running at `http://localhost:8000`
- **CORS Errors**: Check your browser's security settings
- **Performance Issues**: Close unnecessary browser tabs to free up resources
- **UV Issues**: Refer to the [official UV documentation](https://github.com/astral-sh/uv)
- **Virtual Environment Activation Issues**: 
  - On Windows PowerShell: use `.\.venv\Scripts\Activate.ps1`
  - On Windows Command Prompt: use `.venv\Scripts\activate`
  - On macOS/Linux: use `source .venv/bin/activate`

## 📜 License <a name="license"></a>

This project is open source and available under the [MIT License](LICENSE).

---

Happy coding! 💻✨
