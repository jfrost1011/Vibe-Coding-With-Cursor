<p align = "center" draggable="false" ><img src="https://github.com/AI-Maker-Space/LLM-Dev-101/assets/37101144/d1343317-fa2f-41e1-8af1-1dbb18399719" 
     width="200px"
     height="auto"/>
</p>

# 🚀 Setting Up Cursor and UV

This guide will help you set up Cursor (an AI-powered code editor) and UV (a fast Python package installer) for your development environment.

## 📋 Table of Contents

- [Prerequisites](#prerequisites) 🛠️
- [Installing Cursor](#cursor) 🧠
- [Installing UV](#uv) ⚡
- [Why Use UV Instead of pip](#why-uv) 🔍
- [UV Commands Reference](#commands) 📝
- [Troubleshooting](#troubleshooting) 🔧

## 🛠️ Prerequisites <a name="prerequisites"></a>

Before you begin, make sure you have the following installed:
- [Python](https://www.python.org/) (v3.8 or higher)

## 🧠 Installing Cursor <a name="cursor"></a>

Cursor is an AI-powered code editor that enhances your coding experience with intelligent features.

1. Visit [cursor.sh](https://cursor.sh/) and download the installer for your OS
2. Run the installer and follow the prompts
3. Launch Cursor and open your project folder
4. Enjoy the power of AI-assisted coding! ✨

### Key Cursor Features

- **AI Code Completion**: Get intelligent code suggestions as you type
- **Natural Language Commands**: Ask for code changes in plain English
- **Context-Aware Assistance**: The AI understands your codebase
- **Integrated Chat**: Ask questions about your code directly in the editor

## ⚡ Installing UV <a name="uv"></a>

UV is a fast, reliable Python package installer and resolver.

### Installation Commands

- **Windows** (Run in PowerShell):
  ```
  curl -sSf https://astral.sh/uv/install.ps1 | powershell
  ```

- **macOS/Linux**:
  ```
  curl -sSf https://astral.sh/uv/install.sh | sh
  ```

After installation, you may need to restart your terminal or add UV to your PATH.

## 🔍 Why Use UV Instead of pip <a name="why-uv"></a>

UV offers several advantages over traditional pip:

- **Speed**: UV is 10-100x faster than pip
- **Reliability**: Better dependency resolution
- **Compatibility**: Works with pip's commands
- **Safety**: Written in a safe language
- **Environment Management**: The `uv run` command ensures everything runs in the correct environment

## 📝 UV Commands Reference <a name="commands"></a>

Here are some common UV commands to get you started:

### Virtual Environment Management

Create a new virtual environment:
```
uv venv
```

Activate the virtual environment:
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

### Package Management

Install packages:
```
uv pip install <package-name>
```

Install from requirements file:
```
uv pip install -r requirements.txt
```

### Running Python Scripts

Run a Python script in the virtual environment:
```
uv run script.py
```

## 🔧 Troubleshooting <a name="troubleshooting"></a>

### Cursor Issues

- **Performance**: If Cursor is running slowly, try closing other applications
- **AI Features Not Working**: Check your internet connection
- **Editor Crashes**: Make sure you have the latest version installed

### UV Issues

- **Installation Fails**: Make sure you have the necessary permissions
- **Command Not Found**: Ensure UV is in your PATH
- **Virtual Environment Issues**: 
  - On Windows PowerShell: use `.\.venv\Scripts\Activate.ps1`
  - On Windows Command Prompt: use `.venv\Scripts\activate`
  - On macOS/Linux: use `source .venv/bin/activate`

For more help with UV, refer to the [official UV documentation](https://github.com/astral-sh/uv).

---

Happy coding! 💻✨
