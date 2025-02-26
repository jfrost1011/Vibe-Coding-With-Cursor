<p align = "center" draggable="false" ><img src="https://github.com/AI-Maker-Space/LLM-Dev-101/assets/37101144/d1343317-fa2f-41e1-8af1-1dbb18399719" 
     width="200px"
     height="auto"/>
</p>

# 🐍 Existential Snake Game: Where Snakes Get Deep! 🧠

Yo! Welcome to the **coolest** twist on the classic Snake game ever! This ain't your grandma's Snake game - our snake is having a full-on existential crisis while dropping philosophical quotes that'll blow your mind! 🤯 Plus, food gets all nasty and rotten if you wait too long (just like that forgotten burrito in your fridge), and your snake will totally judge your life choices when you eat the gross stuff!

> **Want the full gameplay deets?** Check out [GAMEPLAY.md](GAMEPLAY.md) for all the juicy features and mechanics! 🎮

## 📋 What's Inside This Repo

- [What You Need](#prerequisites) 🛠️
- [Getting This Bad Boy Running](#installation) 🚀
- [How This Thing's Built](#project-structure) 🏗️
- [Why UV Is Cooler Than pip](#why-uv-instead-of-pip) ⚡
- [When Stuff Breaks](#troubleshooting) 🔧
- [Legal Boring Stuff](#license) 📜

## 🛠️ What You Need

Before you dive into the existential abyss, make sure you've got:
- [Node.js](https://nodejs.org/) (v14 or higher) - JavaScript runtime that's actually cool
- [npm](https://www.npmjs.com/) (comes with Node.js) - for all those sweet packages
- [Python](https://www.python.org/) (v3.8 or higher) - because snakes 🐍 and Python, get it?
- [UV](https://github.com/astral-sh/uv) - the lightning-fast package installer that makes pip look like a turtle 🐢
- [Rust](https://www.rust-lang.org/tools/install) - for building pydantic-core (and feeling like a hardcore dev)

> **Pro Tip**: 💡 Don't wanna mess with Rust? No worries! Use `backend/requirements-no-rust.txt` instead and skip the Rust party. It's like taking the easy path in a video game - we won't judge!

## 🚀 Getting This Bad Boy Running

### 🦀 Installing Rust

Rust is needed for some Python packages. Install it with this magic spell:

- **Windows/macOS/Linux**:
  ```
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```
  
  After installation, restart your terminal or run:
  ```
  source "$HOME/.cargo/env"
  ```

### ⚡ Quick Setup (The Lazy Way - We Approve!)

We've made some awesome scripts that do all the boring stuff for you:

- **Linux/macOS**:
  ```
  chmod +x setup.sh
  ./setup.sh
  ```

- **Windows** (Run in PowerShell):
  ```
  .\setup.ps1
  ```

After running the script, just follow the instructions on screen. It's so easy, even a non-existential snake could do it! 🐍

### 🔧 Manual Setup (For Control Freaks)

#### Installing UV

If you don't have UV yet, get it with:

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
   
   **With Rust installed** (for speed demons 🏎️):
   ```
   uv pip install -r requirements.txt
   ```
   
   **Without Rust** (for the patient types 🧘):
   ```
   uv pip install -r requirements-no-rust.txt
   ```

5. Start the FastAPI server:
   ```
   uv run main.py
   ```

   The backend server will start running at `http://localhost:8000`. Magic! ✨

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

   The frontend will fire up at `http://localhost:3000`. Look at you, web dev wizard! 🧙‍♂️

## 🏗️ How This Thing's Built

```
existential-snake-game/
├── backend/                         # Where the snake's brain lives
│   ├── main.py                      # FastAPI server (the puppet master)
│   ├── requirements.txt             # Python dependencies (with Rust)
│   ├── requirements-no-rust.txt     # Python dependencies (Rust-free)
│   └── data/                        # Where we store all the deep thoughts
├── frontend/                        # The pretty face of our existential crisis
│   ├── public/                      # Static files (boring but necessary)
│   ├── src/                         # Where the React magic happens
│   │   ├── components/              # Building blocks of our UI
│   │   │   ├── SnakeGame.js         # The star of the show! 🌟
│   │   │   ├── StartScreen.js       # First impressions matter
│   │   │   └── EndScreen.js         # For when existence ends
│   │   ├── App.js                   # The glue holding it all together
│   │   ├── App.css                  # Making things pretty
│   │   └── index.js                 # The entry point
│   └── package.json                 # Node.js dependencies (the shopping list)
├── setup.sh                         # Setup script for Linux/macOS
├── setup.ps1                        # Setup script for Windows
├── README.md                        # You're reading this right now! 👀
└── GAMEPLAY.md                      # All the juicy game details
```

## ⚡ Why UV Is Cooler Than pip

UV is the sports car 🏎️ of Python package installers:

- **Speed**: UV smokes pip by being 10-100x faster! Zoom zoom! 🏁
- **Reliability**: Dependency resolution that actually works (shocking, we know)
- **Compatibility**: Works with pip's commands, so no new tricks to learn
- **Safety**: Written in Rust, so it's basically wearing a helmet and knee pads
- **Environment Management**: The `uv run` command makes sure everything runs in the right place, so you can say goodbye to those annoying "module not found" errors that make you want to throw your computer out the window 🪟

## 🔧 When Stuff Breaks

- **Backend Connection Issues**: Make sure the FastAPI server is running at `http://localhost:8000`. No server = sad snake 😢
- **CORS Errors**: The backend is configured to allow requests from anywhere. If you hit CORS issues, check your browser's security settings (they're being overprotective).
- **Game Performance**: If the game is crawling slower than an actual snake, try closing those 50 other browser tabs you have open. We see you! 👀
- **UV Issues**: If UV is acting up, check the [official docs](https://github.com/astral-sh/uv). They know their stuff!
- **Virtual Environment Activation Issues**: 
  - On Windows PowerShell: use `.\.venv\Scripts\Activate.ps1`
  - On Windows Command Prompt: use `.venv\Scripts\activate`
  - On macOS/Linux: use `source .venv/bin/activate`
- **Pydantic-core Build Error**: 
  - If you see `Failed to build pydantic-core` with `Cargo metadata failed`, you need Rust in your life.
  - Install Rust with `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - After installing, restart your terminal or run `source "$HOME/.cargo/env"` to update your PATH.
  - Then try again! Persistence is key! 🔑
  - **Too Much Work?**: Just use `requirements-no-rust.txt` instead. Work smarter, not harder! 😎

## 📜 Legal Boring Stuff

This project is open source and available under the [MIT License](LICENSE). That means you can do pretty much whatever you want with it - go wild! Just don't blame us if your snake has an existential crisis. That's between you two. 🐍💭

---

Now go forth and contemplate existence while eating digital fruit! 🍎 Remember: the unexamined snake game is not worth playing. - Socrates (probably)
