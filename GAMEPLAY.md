# Existential Snake Game

A unique twist on the classic Snake game where the snake experiences existential dread and quotes philosophers. The game includes a food rotting mechanic, and the snake will comment when you eat rotten food.

## Features

- **Existential Snake**: The snake frequently experiences existential dread and shares philosophical thoughts.
- **Philosophical Quotes**: The snake quotes famous philosophers during gameplay.
- **Food Rotting Mechanic**: Food will rot after a certain amount of time, changing its appearance.
- **Rotten Food Commentary**: The snake will comment on your choices when you eat rotten food.
- **Fresh Food Thoughts**: Occasionally, the snake will share satisfied thoughts when eating fresh food.
- **Idle Contemplation**: If you stop moving for a few seconds, the snake will share its thoughts on stillness.
- **Win Condition**: Win by eating 10 pieces of food.
- **Multiple Endings**: Experience different endings based on how much rotten food you consume.
- **Enhanced UI**: Beautiful, modern UI with glowing effects, animations, and visual polish.
- **Side Panel**: Existential thoughts and game stats are displayed in a dedicated side panel.

## Launching the Game

### Quick Launch (Using Setup Scripts)

We've made some awesome scripts that do all the setup for you:

- **Linux/macOS**:
  ```
  chmod +x setup.sh
  ./setup.sh
  ```

- **Windows** (Run in PowerShell):
  ```
  .\setup.ps1
  ```

After running the script, just follow the instructions on screen.

### Manual Launch

#### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Activate the virtual environment:
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

3. Start the FastAPI server:
   ```
   uv run main.py
   ```

   The backend server will start running at `http://localhost:8000`.

#### Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Start the React development server:
   ```
   npm start
   ```

   The frontend will start at `http://localhost:3000`.

## Game Controls

- **Arrow Keys** or **WASD Keys**: Control the snake's direction
- **Spacebar**: Pause/Resume the game

## How to Play

1. Open your browser and go to `http://localhost:3000`.
2. Enter your name on the start screen and click "Begin Existence".
3. A 3-second countdown will appear before the game starts.
4. Use the arrow keys or WASD to control the snake and eat food.
5. Try to eat 10 pieces of food to win the game.
6. Be mindful of rotten food - if more than 50% of the food you eat is rotten, you'll get a bad ending.
7. The snake will frequently share existential thoughts or philosophical quotes in the side panel.
8. If you stop moving for a few seconds, the snake will contemplate its stillness.

## Game Mechanics

- **Fresh Food**: Worth 3 points.
- **Rotten Food**: Worth 1 point. Food becomes rotten after 10 seconds.
- **Existential Moments**: Every 12 seconds, the snake will share an existential thought or philosophical quote. These appear in a side panel and don't interrupt gameplay.
- **Fresh Food Thoughts**: Occasionally when eating fresh food, the snake will share satisfied thoughts.
- **Idle Thoughts**: If you don't move for 5 seconds, the snake will contemplate its stillness.
- **Rotten Food Commentary**: When eating rotten food, the snake will pause briefly to comment on your choices.
- **Win Condition**: Eat 10 pieces of food.
- **Game Over**: If the snake hits a wall or itself before eating 10 pieces of food.
- **Endings**:
  - **Victory - Good Ending**: Eat 10 pieces of food with less than 50% of food eaten being rotten.
  - **Victory - Bad Ending**: Eat 10 pieces of food with 50% or more of food eaten being rotten.

## Troubleshooting

- **Backend Connection Issues**: Make sure the FastAPI server is running at `http://localhost:8000`.
- **CORS Errors**: The backend is configured to allow requests from anywhere. If you hit CORS issues, check your browser's security settings.
- **Game Performance**: If the game is running slowly, try closing other browser tabs to free up resources.

## Credits

- Philosophical quotes sourced from famous philosophers throughout history.
- Game concept inspired by the classic Snake game with an existential twist. 