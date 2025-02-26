# AIM Guide to Getting Started with Cursor and UV

This guide will help you install and set up [Cursor](https://cursor.com) (an AI-powered code editor) and [UV](https://github.com/astral-sh/uv) (a fast Python package installer).

## Table of Contents
- [What is Cursor?](#what-is-cursor)
- [Installing Cursor](#installing-cursor)
  - [Windows](#installing-cursor-on-windows)
  - [macOS](#installing-cursor-on-macos)
  - [Linux](#installing-cursor-on-linux)
- [What is UV?](#what-is-uv)
- [Installing UV](#installing-uv)
  - [Windows](#installing-uv-on-windows)
  - [macOS](#installing-uv-on-macos)
  - [Linux](#installing-uv-on-linux)
- [Using UV with Cursor](#using-uv-with-cursor)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## What is Cursor?

Cursor is an AI-powered code editor built on top of VS Code. It integrates powerful AI capabilities to help you write, understand, and debug code more efficiently. Cursor features include:

- AI chat assistant for coding help
- Code generation and completion
- Code explanation and documentation
- Refactoring suggestions
- Built on VS Code, maintaining compatibility with VS Code extensions

## Installing Cursor

### Installing Cursor on Windows

1. Visit the [Cursor page](https://cursor.com)
2. Click on the "Download for Windows" button
3. Once the installer is downloaded, run the `.exe` file
4. Follow the installation wizard instructions
5. After installation, Cursor will launch automatically

### Installing Cursor on macOS

1. Visit the [Cursor download page](https://cursor.com)
2. Click on the "Download for Mac" button
3. Once the `.dmg` file is downloaded, open it
4. Drag the Cursor app to your Applications folder
5. Open Cursor from your Applications folder
6. If you encounter a security warning, go to System Preferences > Security & Privacy and click "Open Anyway"

### Installing Cursor on Linux

1. Visit the [Cursor download page](https://cursor.com)
2. Click on the "Download for Linux" button
3. Download the appropriate package for your distribution (`.deb` for Debian/Ubuntu, `.rpm` for Fedora/RHEL, or `.AppImage`)
4. For `.deb` packages:
   ```bash
   sudo dpkg -i cursor_*.deb
   sudo apt-get install -f  # Install dependencies if needed
   ```
5. For `.rpm` packages:
   ```bash
   sudo rpm -i cursor_*.rpm
   ```
6. For `.AppImage`:
   ```bash
   chmod +x Cursor-*.AppImage
   ./Cursor-*.AppImage
   ```

## What is UV?

UV (pronounced "you-vee") is a modern Python package installer and resolver developed by Astral. It's designed to be a faster, more reliable alternative to pip and other Python package managers. Key features include:

- Extremely fast package installation (often 10-100x faster than pip)
- Reliable dependency resolution
- Compatible with pip's command-line interface
- Support for virtual environments
- Written in Rust for performance and safety

## Installing UV

### Installing UV on Windows

1. Open Command Prompt or PowerShell
2. Install UV using the official installer:
   ```powershell
   curl -sSf https://astral.sh/uv/install.ps1 | powershell
   ```
3. Restart your terminal or run:
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")
   ```
4. Verify the installation:
   ```powershell
   uv --version
   ```

### Installing UV on macOS

1. Open Terminal
2. Install UV using the official installer:
   ```bash
   curl -sSf https://astral.sh/uv/install.sh | sh
   ```
3. Restart your terminal or run:
   ```bash
   source ~/.bashrc  # or source ~/.zshrc if using zsh
   ```
4. Verify the installation:
   ```bash
   uv --version
   ```

### Installing UV on Linux

1. Open Terminal
2. Install UV using the official installer:
   ```bash
   curl -sSf https://astral.sh/uv/install.sh | sh
   ```
3. Restart your terminal or run:
   ```bash
   source ~/.bashrc  # or source ~/.zshrc if using zsh
   ```
4. Verify the installation:
   ```bash
   uv --version
   ```

## Using UV with Cursor

UV can be used as a drop-in replacement for pip in most cases. Here's how to use it with Cursor:

1. Open Cursor
2. Open a terminal in Cursor (Terminal > New Terminal)
3. Create a virtual environment (optional but recommended):
   ```bash
   uv venv  # Creates a .venv in the current directory
   ```
4. Activate the virtual environment:
   - Windows: `.venv\Scripts\activate`
   - macOS/Linux: `source .venv/bin/activate`
5. Install packages:
   ```bash
   uv pip install package-name
   ```
6. Install packages from a requirements file:
   ```bash
   uv pip install -r requirements.txt
   ```

## Troubleshooting

### Cursor Issues

- **Cursor won't start**: Try reinstalling or check if your system meets the minimum requirements
- **AI features not working**: Ensure you're connected to the internet and have set up an account
- **Extensions not working**: Try reinstalling the extension or check for compatibility issues

### UV Issues

- **Command not found**: Make sure UV is properly installed and added to your PATH
- **Permission errors**: Try running the command with administrator privileges
- **Package installation failures**: Check your internet connection and try using the `--verbose` flag for more information

## Additional Resources

### Cursor Resources
- [Cursor Official Website](https://cursor.com)
- [Cursor Documentation](https://docs.cursor.com/)

### UV Resources
- [UV GitHub Repository](https://github.com/astral-sh/uv)
- [UV Documentation](https://github.com/astral-sh/uv/blob/main/README.md)
- [Astral Website](https://astral.sh)

---