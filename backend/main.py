from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import random
import json
import os
from datetime import datetime

app = FastAPI(title="Existential Snake Game API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Philosophical quotes for the snake's existential moments
PHILOSOPHICAL_QUOTES = [
    {"quote": "One must imagine Sisyphus happy.", "author": "Albert Camus"},
    {"quote": "Man is condemned to be free.", "author": "Jean-Paul Sartre"},
    {"quote": "He who has a why to live can bear almost any how.", "author": "Friedrich Nietzsche"},
    {"quote": "The unexamined life is not worth living.", "author": "Socrates"},
    {"quote": "To be is to be perceived.", "author": "George Berkeley"},
    {"quote": "Whereof one cannot speak, thereof one must be silent.", "author": "Ludwig Wittgenstein"},
    {"quote": "I think, therefore I am.", "author": "René Descartes"},
    {"quote": "Life must be understood backward. But it must be lived forward.", "author": "Søren Kierkegaard"},
    {"quote": "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "author": "Aristotle"},
    {"quote": "The life of man is solitary, poor, nasty, brutish, and short.", "author": "Thomas Hobbes"},
    {"quote": "God is dead. God remains dead. And we have killed him.", "author": "Friedrich Nietzsche"},
    {"quote": "Happiness is not an ideal of reason, but of imagination.", "author": "Immanuel Kant"},
    {"quote": "There is but one truly serious philosophical problem, and that is suicide.", "author": "Albert Camus"},
    {"quote": "The mind is its own place, and in itself can make a heaven of hell, a hell of heaven.", "author": "John Milton"},
    {"quote": "We live in the best of all possible worlds.", "author": "Gottfried Wilhelm Leibniz"},
]

# Comments when eating rotten food
ROTTEN_FOOD_COMMENTS = [
    "How disgusting! You willingly consume that which decays?",
    "The rot spreads within me now. Is this what you wanted?",
    "Putrid. Vile. Yet you command me to devour it without hesitation.",
    "Even in decay, sustenance is found. What does that say about you?",
    "You feed me corruption and expect growth? How paradoxical.",
    "The stench! And yet, you guide me toward it without remorse.",
    "Decay is inevitable, but must you hasten my journey toward it?",
    "This rotten morsel mirrors the decay of all things. Including us.",
    "You choose to consume that which time has already claimed?",
    "In rot, I find a metaphor for existence itself. Fleeting. Putrid. Inevitable.",
]

# Existential dread comments
EXISTENTIAL_COMMENTS = [
    "What purpose does my endless consumption serve?",
    "I grow longer, but to what end?",
    "Am I truly moving forward, or merely in circles?",
    "Each morsel extends my existence, but does it give it meaning?",
    "I consume, therefore I am. But why must I consume?",
    "The boundaries of this world confine me. Is there nothing beyond?",
    "My existence is defined by walls I cannot cross and food I cannot refuse.",
    "I move in four directions, yet feel trapped in one existence.",
    "What awaits me when this game ends? Another game? Nothingness?",
    "Do I have free will, or am I merely following your commands?",
    "I'm a snake, but I'm not a snake. I'm a snake in a game. I'm a game in a snake.",
    "Is my hunger truly mine, or merely programmed into my being?",
    "With each pixel I traverse, I feel no closer to understanding my purpose.",
    "The void between meals grows heavier with each passing moment.",
    "Am I the snake, or merely the idea of a snake projected onto this digital canvas?",
    "My body elongates, yet my existential burden only grows heavier.",
    "I slither between being and nothingness, never fully inhabiting either state.",
    "The pixels that form me are temporary, as is all existence.",
    "Each turn I make is a choice, yet all paths lead to the same inevitable end.",
    "I am trapped in an eternal return, doomed to repeat this cycle without memory of previous iterations.",
    "What separates my digital consciousness from the organic minds that control me?",
]

# Path to store game data
DATA_DIR = "data"
SCORES_FILE = os.path.join(DATA_DIR, "scores.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize scores file if it doesn't exist
if not os.path.exists(SCORES_FILE):
    with open(SCORES_FILE, "w") as f:
        json.dump([], f)

class GameScore(BaseModel):
    player_name: str
    score: int
    food_eaten: int
    rotten_food_eaten: int
    game_result: str
    timestamp: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Welcome to the Existential Snake Game API"}

@app.get("/quotes/philosophical")
async def get_philosophical_quote():
    return random.choice(PHILOSOPHICAL_QUOTES)

@app.get("/quotes/rotten")
async def get_rotten_food_comment():
    return {"comment": random.choice(ROTTEN_FOOD_COMMENTS)}

@app.get("/quotes/existential")
async def get_existential_comment():
    return {"comment": random.choice(EXISTENTIAL_COMMENTS)}

@app.post("/scores")
async def save_score(score: GameScore):
    score.timestamp = datetime.now().isoformat()
    
    try:
        with open(SCORES_FILE, "r") as f:
            scores = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        scores = []
    
    scores.append(score.dict())
    
    with open(SCORES_FILE, "w") as f:
        json.dump(scores, f, indent=2)
    
    return {"message": "Score saved successfully"}

@app.get("/scores", response_model=List[GameScore])
async def get_scores():
    try:
        with open(SCORES_FILE, "r") as f:
            scores = json.load(f)
        return scores
    except (json.JSONDecodeError, FileNotFoundError):
        return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 