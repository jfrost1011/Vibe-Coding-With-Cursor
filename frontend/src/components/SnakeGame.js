import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Use relative path for API in production, fallback to localhost for development
const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';

// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 150;
const FOOD_FRESH_DURATION = 10000; // 10 seconds before food starts rotting
const EXISTENTIAL_DREAD_INTERVAL = 12000; // Reduced from 20000 to 12000 ms to make snake chattier

// Directions
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const GameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  margin: 0 auto;
  gap: 20px;
  max-width: 1200px;
  padding: 20px;
  width: 100%;
  height: ${GRID_SIZE * CELL_SIZE + 40}px; /* Add fixed height based on game board + padding */
`;

const GameBoard = styled.div`
  position: relative;
  width: ${GRID_SIZE * CELL_SIZE}px;
  height: ${GRID_SIZE * CELL_SIZE}px;
  border: 2px solid #61dafb;
  background-color: #1e2127;
  box-shadow: 0 0 20px rgba(97, 218, 251, 0.3);
  border-radius: 4px;
  overflow: hidden;
`;

const Cell = styled.div`
  position: absolute;
  width: ${CELL_SIZE - 1}px;
  height: ${CELL_SIZE - 1}px;
  left: ${props => props.x * CELL_SIZE}px;
  top: ${props => props.y * CELL_SIZE}px;
  background-color: ${props => props.color};
  border-radius: ${props => props.isHead ? '4px' : '0'};
  box-shadow: ${props => props.isHead ? '0 0 5px rgba(97, 218, 251, 0.8)' : 'none'};
  transition: background-color 0.1s ease;
`;

const FoodCell = styled(Cell)`
  background-color: ${props => props.isRotten ? '#8B4513' : '#4CAF50'};
  border-radius: 50%;
  animation: ${props => props.isRotten ? 'pulse 1s infinite' : 'glow 2s infinite'};
  
  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 0 5px rgba(139, 69, 19, 0.6); }
    50% { transform: scale(1.1); box-shadow: 0 0 10px rgba(139, 69, 19, 0.8); }
    100% { transform: scale(1); box-shadow: 0 0 5px rgba(139, 69, 19, 0.6); }
  }
  
  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.6); }
    50% { box-shadow: 0 0 10px rgba(76, 175, 80, 0.8); }
    100% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.6); }
  }
`;

const SidePanel = styled.div`
  width: 300px;
  height: ${GRID_SIZE * CELL_SIZE}px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 15px rgba(97, 218, 251, 0.2);
  border: 1px solid rgba(97, 218, 251, 0.1);
  overflow: hidden;
`;

const GameStatsContainer = styled.div`
  background-color: rgba(30, 33, 39, 0.6);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(97, 218, 251, 0.2);
`;

const GameInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  margin-top: 0.5rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  
  span {
    color: #61dafb;
    margin-left: 5px;
    font-weight: bold;
  }
`;

const QuoteContainer = styled.div`
  margin-bottom: 1.2rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid rgba(97, 218, 251, 0.2);
  animation: fadeIn 0.5s;
  background-color: rgba(30, 33, 39, 0.4);
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
`;

const QuoteTitle = styled.h3`
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #61dafb;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #61dafb;
    border-radius: 50%;
    margin-right: 8px;
  }
`;

const QuoteText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: ${props => props.color || 'white'};
  font-style: italic;
  line-height: 1.5;
  letter-spacing: 0.3px;
`;

const QuoteAuthor = styled.span`
  display: block;
  margin-top: 0.6rem;
  font-size: 0.85rem;
  text-align: right;
  color: #a0a0a0;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #61dafb;
  text-shadow: 0 0 5px rgba(97, 218, 251, 0.3);
  letter-spacing: 1px;
`;

// Keep the MessageBox for rotten food comments only
const MessageBox = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.85);
  padding: 1.2rem;
  border-radius: 8px;
  max-width: 80%;
  text-align: center;
  z-index: 10;
  animation: fadeIn 0.5s;
  border: 1px solid rgba(255, 107, 107, 0.4);
  box-shadow: 0 0 15px rgba(255, 107, 107, 0.3);
`;

const Message = styled.p`
  margin: 0;
  font-size: 1.1rem;
  color: ${props => props.color || 'white'};
  font-style: italic;
  line-height: 1.4;
`;

const Author = styled.span`
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  text-align: right;
  color: #a0a0a0;
`;

const PauseOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  backdrop-filter: blur(2px);
`;

const PauseText = styled.p`
  font-size: 1.8rem;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 1rem 2rem;
  border-radius: 8px;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(97, 218, 251, 0.5);
  border: 1px solid rgba(97, 218, 251, 0.3);
`;

const EmptyQuoteMessage = styled.div`
  color: #666;
  font-style: italic;
  padding: 1rem;
  text-align: center;
  background-color: rgba(30, 33, 39, 0.4);
  border-radius: 6px;
  border: 1px dashed rgba(97, 218, 251, 0.2);
`;

const ControlsInfo = styled.div`
  margin-top: auto;
  padding-top: 1.5rem;
  font-size: 0.9rem;
  color: #a0a0a0;
  
  p {
    margin: 0.5rem 0;
  }
  
  span {
    color: #61dafb;
    font-weight: bold;
  }
`;

const QuotesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(30, 33, 39, 0.4);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(97, 218, 251, 0.4);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(97, 218, 251, 0.6);
  }
`;

function SnakeGame({ onGameOver }) {
  // Game state
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5, createdAt: Date.now() });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState(null);
  const [foodEaten, setFoodEaten] = useState(0);
  const [rottenFoodEaten, setRottenFoodEaten] = useState(0);
  const [quotes, setQuotes] = useState([]);
  const [idleTime, setIdleTime] = useState(0);
  
  // Refs to store the current state values for use in event listeners
  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);
  const scoreRef = useRef(score);
  const foodEatenRef = useRef(foodEaten);
  const rottenFoodEatenRef = useRef(rottenFoodEaten);
  const idleTimeRef = useRef(idleTime);
  
  // Update refs when state changes
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { foodEatenRef.current = foodEaten; }, [foodEaten]);
  useEffect(() => { rottenFoodEatenRef.current = rottenFoodEaten; }, [rottenFoodEaten]);
  useEffect(() => { idleTimeRef.current = idleTime; }, [idleTime]);

  // Check if food is rotten
  const isFoodRotten = useCallback(() => {
    return Date.now() - food.createdAt > FOOD_FRESH_DURATION;
  }, [food.createdAt]);

  // Generate new food at random position
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      createdAt: Date.now()
    };
    
    // Make sure food doesn't spawn on snake
    const isOnSnake = snakeRef.current.some(
      segment => segment.x === newFood.x && segment.y === newFood.y
    );
    
    if (isOnSnake) {
      return generateFood();
    }
    
    return newFood;
  }, []);

  // Add a quote to the side panel
  const addQuote = useCallback((text, author = null, color = null, type = "Philosophical") => {
    setQuotes(prev => {
      // Keep only the last 4 quotes (increased from 3)
      const newQuotes = [...prev, { text, author, color, type, id: Date.now() }];
      if (newQuotes.length > 4) {
        return newQuotes.slice(newQuotes.length - 4);
      }
      return newQuotes;
    });
    
    // Reset idle time when a quote is added
    setIdleTime(0);
  }, []);

  // Show a message for rotten food (this still pauses the game)
  const showMessage = useCallback((text, author = null, color = null, duration = 3000) => {
    setMessage({ text, author, color });
    setIsPaused(true); // Pause the game when showing a message
    
    setTimeout(() => {
      setMessage(null);
      // Only unpause if this was the last message (to handle multiple messages)
      if (!gameOverRef.current) {
        setIsPaused(false);
      }
    }, duration);
  }, []);

  // Show existential dread message
  const showExistentialDread = useCallback(async () => {
    if (gameOverRef.current || isPausedRef.current) return;
    
    try {
      const response = await axios.get(`${API_URL}/quotes/existential`);
      addQuote(response.data.comment, null, '#61dafb', "Existential Thought");
    } catch (error) {
      console.error("Error fetching existential comment:", error);
    }
  }, [addQuote]);

  // Show philosophical quote
  const showPhilosophicalQuote = useCallback(async () => {
    if (gameOverRef.current || isPausedRef.current) return;
    
    try {
      const response = await axios.get(`${API_URL}/quotes/philosophical`);
      const quote = response.data;
      addQuote(quote.quote, quote.author, '#a0a0a0', "Philosophical Quote");
    } catch (error) {
      console.error("Error fetching philosophical quote:", error);
    }
  }, [addQuote]);

  // Show rotten food comment
  const showRottenFoodComment = useCallback(async () => {
    if (gameOverRef.current) return;
    
    try {
      const response = await axios.get(`${API_URL}/quotes/rotten`);
      showMessage(response.data.comment, null, '#ff6b6b', 3000);
    } catch (error) {
      console.error("Error fetching rotten food comment:", error);
    }
  }, [showMessage]);

  // Show idle thoughts when player hasn't moved for a while
  const showIdleThought = useCallback(() => {
    const idleThoughts = [
      "Are you still there? Or have you abandoned me to my solitary existence?",
      "This stillness... is it peace or merely the absence of purpose?",
      "In this moment of inaction, I contemplate the nature of free will.",
      "Perhaps movement is overrated. Maybe true wisdom comes from stillness.",
      "I wait, suspended between action and inaction, like Schrödinger's snake."
    ];
    
    const randomThought = idleThoughts[Math.floor(Math.random() * idleThoughts.length)];
    addQuote(randomThought, null, '#ffd700', "Idle Thought");
  }, [addQuote]);

  // Handle key presses for snake movement
  const handleKeyDown = useCallback((e) => {
    if (gameOverRef.current) return;
    
    // Prevent arrow keys and WASD from scrolling the page
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', ' '].includes(e.key)) {
      e.preventDefault();
    }
    
    // Pause/resume game with spacebar
    if (e.key === ' ') {
      setIsPaused(prev => !prev);
      return;
    }
    
    // Don't change direction if game is paused
    if (isPausedRef.current) return;
    
    const currentDirection = directionRef.current;
    let directionChanged = false;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (currentDirection !== DIRECTIONS.DOWN) {
          setDirection(DIRECTIONS.UP);
          directionChanged = true;
        }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (currentDirection !== DIRECTIONS.UP) {
          setDirection(DIRECTIONS.DOWN);
          directionChanged = true;
        }
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (currentDirection !== DIRECTIONS.RIGHT) {
          setDirection(DIRECTIONS.LEFT);
          directionChanged = true;
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (currentDirection !== DIRECTIONS.LEFT) {
          setDirection(DIRECTIONS.RIGHT);
          directionChanged = true;
        }
        break;
      default:
        break;
    }
    
    // Reset idle time when direction changes
    if (directionChanged) {
      setIdleTime(0);
    }
  }, []);

  // Set up key event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Set up existential dread interval
  useEffect(() => {
    const existentialInterval = setInterval(() => {
      if (!gameOverRef.current && !isPausedRef.current) {
        // 60% chance of existential dread, 40% chance of philosophical quote
        const rand = Math.random();
        if (rand < 0.6) {
          showExistentialDread();
        } else {
          showPhilosophicalQuote();
        }
      }
    }, EXISTENTIAL_DREAD_INTERVAL);
    
    return () => clearInterval(existentialInterval);
  }, [showExistentialDread, showPhilosophicalQuote]);

  // Track idle time and show thoughts when player hasn't moved for a while
  useEffect(() => {
    if (gameOver || isPaused) return;
    
    const idleInterval = setInterval(() => {
      if (!gameOverRef.current && !isPausedRef.current) {
        setIdleTime(prev => prev + 1);
        
        // Show idle thought after 5 seconds of no movement
        if (idleTimeRef.current === 5) {
          showIdleThought();
        }
      }
    }, 1000);
    
    return () => clearInterval(idleInterval);
  }, [gameOver, isPaused, showIdleThought]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;
    
    const moveSnake = () => {
      // Don't move if game is over or paused
      if (gameOverRef.current || isPausedRef.current) return;
      
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDirection = directionRef.current;
        
        // Calculate new head position
        head.x += currentDirection.x;
        head.y += currentDirection.y;
        
        // Check for collision with walls
        if (
          head.x < 0 || 
          head.x >= GRID_SIZE || 
          head.y < 0 || 
          head.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }
        
        // Check for collision with self
        if (prevSnake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }
        
        // Check for collision with food
        const currentFood = foodRef.current;
        if (head.x === currentFood.x && head.y === currentFood.y) {
          // Increase score
          const isRotten = Date.now() - currentFood.createdAt > FOOD_FRESH_DURATION;
          const pointsGained = isRotten ? 1 : 3;
          setScore(prev => prev + pointsGained);
          
          // Track food eaten - this is where the double counting was happening
          // We're using the current value directly instead of using the ref
          const newFoodEaten = foodEaten + 1;
          setFoodEaten(newFoodEaten);
          
          if (isRotten) {
            setRottenFoodEaten(prev => prev + 1);
            showRottenFoodComment();
          } else {
            // Add a happy thought when eating fresh food (25% chance)
            if (Math.random() < 0.25) {
              const freshFoodThoughts = [
                "Ah, sustenance in its purest form. How satisfying.",
                "This nourishment brings clarity to my serpentine existence.",
                "With each morsel, I grow stronger, yet no less confused about my purpose.",
                "Fresh food, fresh thoughts. Yet the cycle of consumption continues.",
                "Delicious. Though I wonder - am I eating to live, or living to eat?"
              ];
              const randomThought = freshFoodThoughts[Math.floor(Math.random() * freshFoodThoughts.length)];
              addQuote(randomThought, null, '#4CAF50', "Satisfied Thought");
            }
          }
          
          // Generate new food
          setFood(generateFood());
          
          // Check win condition (10 food eaten)
          if (newFoodEaten >= 10) {
            setGameOver(true);
          }
          
          // Don't remove tail when eating food (snake grows)
          return [head, ...prevSnake];
        }
        
        // Move snake (remove tail)
        return [head, ...prevSnake.slice(0, -1)];
      });
    };
    
    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    
    return () => clearInterval(gameInterval);
  }, [gameOver, generateFood, showRottenFoodComment, foodEaten, addQuote]);

  // Handle game over
  useEffect(() => {
    if (gameOver) {
      onGameOver({
        score,
        totalFoodEaten: foodEaten,
        rottenFoodEaten,
      });
    }
  }, [gameOver, onGameOver, score, foodEaten, rottenFoodEaten]);

  return (
    <GameContainer>
      <GameBoard>
        {/* Render snake */}
        {snake.map((segment, index) => (
          <Cell
            key={`snake-${index}`}
            x={segment.x}
            y={segment.y}
            color={index === 0 ? '#61dafb' : '#4a90e2'}
            isHead={index === 0}
          />
        ))}
        
        {/* Render food */}
        <FoodCell
          x={food.x}
          y={food.y}
          isRotten={isFoodRotten()}
        />
        
        {/* Message box for rotten food comments only */}
        {message && (
          <MessageBox>
            <Message color={message.color}>{message.text}</Message>
            {message.author && <Author>— {message.author}</Author>}
          </MessageBox>
        )}
        
        {/* Pause overlay */}
        {isPaused && !message && (
          <PauseOverlay>
            <PauseText>PAUSED</PauseText>
          </PauseOverlay>
        )}
      </GameBoard>
      
      <SidePanel>
        <SectionTitle>Game Stats</SectionTitle>
        <GameStatsContainer>
          <GameInfo>
            <StatItem>Score: <span>{score}</span></StatItem>
            <StatItem>Food: <span>{foodEaten}/10</span></StatItem>
            <StatItem>Rotten: <span>{rottenFoodEaten}</span></StatItem>
          </GameInfo>
        </GameStatsContainer>
        
        <SectionTitle>Existential Moments</SectionTitle>
        <QuotesContainer>
          {quotes.length === 0 ? (
            <EmptyQuoteMessage>
              The snake's mind is clear for now...
            </EmptyQuoteMessage>
          ) : (
            quotes.map(quote => (
              <QuoteContainer key={quote.id}>
                <QuoteTitle>{quote.type}</QuoteTitle>
                <QuoteText color={quote.color}>{quote.text}</QuoteText>
                {quote.author && <QuoteAuthor>— {quote.author}</QuoteAuthor>}
              </QuoteContainer>
            ))
          )}
        </QuotesContainer>
        
        <ControlsInfo>
          <p>Controls:</p>
          <p><span>Arrow Keys/WASD</span> - Move Snake</p>
          <p><span>Spacebar</span> - Pause Game</p>
        </ControlsInfo>
      </SidePanel>
    </GameContainer>
  );
}

export default SnakeGame; 