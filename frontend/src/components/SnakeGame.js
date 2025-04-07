import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Use relative path for API in production, fallback to localhost for development
const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';

// Game constants
const GRID_SIZE = 35;
const CELL_SIZE = 22;
const GAME_SPEED = 150;
const FOOD_FRESH_DURATION = 10000; // 10 seconds before food starts rotting
const FOOD_VANISH_DURATION = 0; // Food never vanishes automatically (changed from 15000)
const EXISTENTIAL_DREAD_INTERVAL = 12000; // Reduced from 20000 to 12000 ms to make snake chattier
const MAX_FOOD_ITEMS = 6; // Maximum number of food items on the board at once (increased from 5)
const INITIAL_FOOD_SPAWN_INTERVAL = 3000; // Initial time between food spawns (3 seconds)
const MIN_FOOD_SPAWN_INTERVAL = 500; // Minimum time between food spawns (0.5 seconds)
const FOOD_SPAWN_REDUCTION_FRESH = 50; // ms to reduce spawn time when eating fresh food
const FOOD_SPAWN_REDUCTION_ROTTEN = 100; // ms to reduce spawn time when eating rotten food (double)
const SUPER_CORRUPTION_THRESHOLD = 200; // Percentage corruption for super corruption state (200%)
const ROTTEN_FOOD_START = 10; // Rotten food starts appearing after this many food items have been eaten
const CORRUPTION_PER_ROTTEN_FOOD = 33.33; // Each rotten food adds 33.33% corruption (6 rotten food = 200%)

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
  gap: 30px;
  max-width: 1600px;
  padding: 20px;
  width: 100%;
  height: ${GRID_SIZE * CELL_SIZE + 40}px; /* Add fixed height based on game board + padding */
  
  &.GameContainer {
    /* This class is used for responsive styling in App.css */
  }
`;

const GameBoard = styled.div`
  position: relative;
  width: ${GRID_SIZE * CELL_SIZE}px;
  height: ${GRID_SIZE * CELL_SIZE}px;
  border: 2px solid ${props => {
    if (props.superCorrupted) return '#ff0000';
    if (props.corruptionPercent <= 0) return '#8B0000';
    
    // Gradually transition from dark red to blood red based on corruption percentage
    const redComponent = Math.min(255, 139 + (props.corruptionPercent * 0.6));
    return `rgb(${redComponent}, 0, 0)`;
  }};
  background-color: ${props => {
    if (props.superCorrupted) return '#3d0000';
    if (props.corruptionPercent <= 0) return '#1a1a1a';
    
    // Gradually transition background color based on corruption percentage
    const redComponent = Math.min(61, 26 + (props.corruptionPercent * 0.175));
    return `rgb(${redComponent}, 0, 0)`;
  }};
  box-shadow: ${props => {
    if (props.superCorrupted) return '0 0 30px rgba(255, 0, 0, 0.7), inset 0 0 20px rgba(255, 0, 0, 0.3)';
    if (props.corruptionPercent <= 0) return '0 0 20px rgba(139, 0, 0, 0.5), inset 0 0 15px rgba(0, 0, 0, 0.5)';
    
    // Gradually transition shadow color based on corruption percentage
    const redOpacity = Math.min(0.7, 0.3 + (props.corruptionPercent * 0.002));
    return `0 0 25px rgba(255, 0, 0, ${redOpacity}), inset 0 0 15px rgba(255, 0, 0, ${redOpacity * 0.6})`;
  }};
  border-radius: 0px;
  overflow: hidden;
  transition: background-color 2s ease, box-shadow 2s ease, border-color 1s ease;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: ${props => props.superCorrupted ? 
      `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M30,30 Q50,5 70,30 T90,30" stroke="rgba(255,0,0,0.3)" fill="none"/></svg>')` : 
      'none'};
    background-size: 100px 100px;
    pointer-events: none;
    opacity: 0.5;
  }
`;

const Cell = styled.div`
  position: absolute;
  width: ${CELL_SIZE - 1}px;
  height: ${CELL_SIZE - 1}px;
  left: ${props => props.x * CELL_SIZE}px;
  top: ${props => props.y * CELL_SIZE}px;
  background-color: ${props => props.color};
  border-radius: ${props => props.isHead ? '4px' : '0'};
  box-shadow: ${props => {
    if (props.isHead) {
      if (props.superCorrupted) {
        return '0 0 10px rgba(255, 0, 0, 0.9), inset 0 0 5px rgba(255, 255, 255, 0.5)';
      } else if (props.corruptionPercent > 0) {
        // Gradually transition glow from dark red to bright red
        const redOpacity = Math.min(0.9, 0.5 + (props.corruptionPercent * 0.002));
        return `0 0 8px rgba(255, 0, 0, ${redOpacity}), inset 0 0 3px rgba(255, 255, 255, ${0.2 + (props.corruptionPercent * 0.001)})`;
      } else {
        return '0 0 8px rgba(139, 0, 0, 0.7), inset 0 0 3px rgba(255, 255, 255, 0.2)';
      }
    } else {
      return 'none';
    }
  }};
  transition: background-color 0.1s ease, box-shadow 0.3s ease;
  
  ${props => props.isHead && `
    &:after {
      content: '';
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.7);
      top: ${props.superCorrupted ? '6px' : '7px'};
      left: ${props.superCorrupted ? '6px' : '7px'};
      box-shadow: ${props.superCorrupted ? '0 0 3px rgba(255, 0, 0, 0.8)' : '0 0 2px rgba(255, 0, 0, 0.5)'};
      animation: ${props.superCorrupted ? 'pulse 0.8s infinite' : 'none'};
      
      @keyframes pulse {
        0% { background-color: rgba(0, 0, 0, 0.7); }
        50% { background-color: rgba(255, 0, 0, 0.7); }
        100% { background-color: rgba(0, 0, 0, 0.7); }
      }
    }
    
    &:before {
      content: '';
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.7);
      top: ${props.superCorrupted ? '6px' : '7px'};
      right: ${props.superCorrupted ? '6px' : '7px'};
      box-shadow: ${props.superCorrupted ? '0 0 3px rgba(255, 0, 0, 0.8)' : '0 0 2px rgba(255, 0, 0, 0.5)'};
      animation: ${props.superCorrupted ? 'pulse 0.8s infinite' : 'none'};
    }
  `}
`;

const FoodCell = styled(Cell)`
  background-color: ${props => props.isRotten ? '#8B0000' : '#660000'};
  border-radius: 50%;
  animation: ${props => {
    if (props.isRotten) {
      return props.superCorrupted ? 'rottenPulseCorrupted 0.8s infinite' : 'rottenPulse 1s infinite';
    } else if (props.isAboutToRot) {
      return 'aboutToRotPulse 1.5s infinite';
    } else {
      return props.superCorrupted ? 'freshGlowCorrupted 2s infinite' : 'freshGlow 2s infinite';
    }
  }};
  
  @keyframes rottenPulse {
    0% { transform: scale(1); box-shadow: 0 0 8px rgba(139, 0, 0, 0.8); }
    50% { transform: scale(1.1); box-shadow: 0 0 12px rgba(139, 0, 0, 1); }
    100% { transform: scale(1); box-shadow: 0 0 8px rgba(139, 0, 0, 0.8); }
  }
  
  @keyframes aboutToRotPulse {
    0% { transform: scale(1); box-shadow: 0 0 5px rgba(139, 0, 0, 0.6); background-color: #660000; }
    50% { transform: scale(1.1); box-shadow: 0 0 10px rgba(139, 0, 0, 0.8); background-color: #8B0000; }
    100% { transform: scale(1); box-shadow: 0 0 5px rgba(139, 0, 0, 0.6); background-color: #660000; }
  }
  
  @keyframes rottenPulseCorrupted {
    0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 0, 0, 0.8); }
    50% { transform: scale(1.15); box-shadow: 0 0 15px rgba(255, 0, 0, 1), 0 0 20px rgba(255, 0, 0, 0.5); }
    100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 0, 0, 0.8); }
  }
  
  @keyframes freshGlow {
    0% { box-shadow: 0 0 5px rgba(139, 0, 0, 0.6); }
    50% { box-shadow: 0 0 10px rgba(255, 0, 0, 0.7); }
    100% { box-shadow: 0 0 5px rgba(139, 0, 0, 0.6); }
  }
  
  @keyframes freshGlowCorrupted {
    0% { box-shadow: 0 0 8px rgba(255, 0, 0, 0.6), 0 0 12px rgba(255, 0, 0, 0.3); }
    50% { box-shadow: 0 0 15px rgba(255, 0, 0, 0.8), 0 0 20px rgba(255, 0, 0, 0.5); }
    100% { box-shadow: 0 0 8px rgba(255, 0, 0, 0.6), 0 0 12px rgba(255, 0, 0, 0.3); }
  }
`;

const SidePanel = styled.div`
  width: 450px;
  height: ${GRID_SIZE * CELL_SIZE}px;
  background-color: ${props => props.superCorrupted ? 'rgba(50, 0, 0, 0.9)' : 'rgba(20, 0, 0, 0.8)'};
  border-radius: 0px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: ${props => props.superCorrupted ? 
    '0 0 20px rgba(255, 0, 0, 0.5), inset 0 0 15px rgba(255, 0, 0, 0.2)' : 
    '0 0 15px rgba(139, 0, 0, 0.4), inset 0 0 10px rgba(139, 0, 0, 0.2)'};
  border: 1px solid ${props => props.superCorrupted ? 
    'rgba(255, 0, 0, 0.4)' : 
    'rgba(139, 0, 0, 0.3)'};
  overflow: hidden;
  transition: background-color 2s ease, box-shadow 2s ease, border-color 1s ease;
  
  &.SidePanel {
    /* This class is used for responsive styling in App.css */
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: ${props => props.superCorrupted ? 
      `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M20,20 Q40,80 80,30" stroke="rgba(255,0,0,0.15)" fill="none" stroke-width="1"/></svg>')` : 
      'none'};
    background-size: 120px 120px;
    pointer-events: none;
    opacity: 0.5;
    z-index: -1;
  }
`;

const GameStatsContainer = styled.div`
  background-color: ${props => props.superCorrupted ? 'rgba(60, 0, 0, 0.7)' : 'rgba(40, 0, 0, 0.6)'};
  border-radius: 0px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${props => props.superCorrupted ? 
    'rgba(255, 0, 0, 0.4)' : 
    'rgba(139, 0, 0, 0.3)'};
  transition: background-color 2s ease, border-color 1s ease;
  position: relative;
  overflow: hidden;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, rgba(139, 0, 0, 0), rgba(139, 0, 0, 0.5), rgba(139, 0, 0, 0));
    pointer-events: none;
  }
`;

const GameInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  margin: 0.5rem 0;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  
  span {
    color: ${props => props.superCorrupted ? '#ff3333' : '#ff0000'};
    margin-left: 5px;
    font-weight: bold;
    text-shadow: ${props => props.superCorrupted ? '0 0 5px rgba(255, 0, 0, 0.7)' : '0 0 3px rgba(255, 0, 0, 0.5)'};
    font-family: ${props => props.superCorrupted ? 'cursive, fantasy' : 'inherit'};
    letter-spacing: ${props => props.superCorrupted ? '1px' : 'normal'};
    transition: color 1s ease, text-shadow 1s ease, font-family 0.5s ease;
  }
`;

const QuoteContainer = styled.div`
  background-color: rgba(30, 0, 0, 0.6);
  border-radius: 0px;
  padding: 1rem;
  border-left: 3px solid ${props => props.type === 'Corruption' ? 'rgba(255, 0, 0, 0.7)' : 'rgba(139, 0, 0, 0.7)'};
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props => props.type === 'Corruption' ? 
      'linear-gradient(to bottom right, rgba(255, 0, 0, 0.05), transparent)' : 
      'linear-gradient(to bottom right, rgba(139, 0, 0, 0.05), transparent)'};
    pointer-events: none;
  }
`;

const QuoteTitle = styled.div`
  font-size: 0.8rem;
  color: #a05050;
  margin-bottom: 0.5rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const QuoteText = styled.p`
  margin: 0;
  font-size: 1rem;
  color: ${props => props.color || '#d0d0d0'};
  line-height: 1.5;
  font-style: italic;
`;

const QuoteAuthor = styled.div`
  font-size: 0.8rem;
  color: #a05050;
  margin-top: 0.8rem;
  text-align: right;
`;

const SectionTitle = styled.h3`
  color: ${props => props.superCorrupted ? '#ff3333' : '#ff0000'};
  font-size: 1.3rem;
  margin: 0 0 0.8rem 0;
  text-shadow: ${props => props.superCorrupted ? '0 0 5px rgba(255, 0, 0, 0.7)' : '0 0 3px rgba(255, 0, 0, 0.5)'};
  letter-spacing: 1px;
  font-family: ${props => props.superCorrupted ? 'cursive, fantasy' : 'inherit'};
  position: relative;
  padding-bottom: 5px;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, rgba(139, 0, 0, 0), rgba(139, 0, 0, 0.5), rgba(139, 0, 0, 0));
  }
`;

const MessageBox = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(20, 0, 0, 0.9);
  padding: 1.2rem;
  border-radius: 0px;
  max-width: 80%;
  text-align: center;
  z-index: 10;
  animation: fadeIn 0.5s;
  border: 1px solid rgba(255, 0, 0, 0.5);
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.4), inset 0 0 10px rgba(0, 0, 0, 0.5);
`;

const Message = styled.p`
  margin: 0;
  font-size: 1.1rem;
  color: ${props => props.color || '#ff9999'};
  font-style: italic;
  line-height: 1.4;
  text-shadow: 0 0 2px rgba(255, 0, 0, 0.5);
`;

const Author = styled.span`
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  text-align: right;
  color: #a05050;
`;

const PauseOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(20, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  backdrop-filter: blur(2px);
`;

const PauseText = styled.p`
  font-size: 1.8rem;
  color: #ff3333;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 1rem 2rem;
  border-radius: 0px;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  border: 1px solid rgba(255, 0, 0, 0.3);
  font-family: 'Courier New', monospace;
`;

const EmptyQuoteMessage = styled.div`
  color: #a05050;
  font-style: italic;
  padding: 1rem;
  text-align: center;
  background-color: rgba(30, 0, 0, 0.4);
  border-radius: 0px;
  border: 1px dashed rgba(139, a, 0, 0.2);
`;

const ControlsInfo = styled.div`
  margin-top: auto;
  padding-top: 1.5rem;
  font-size: 0.9rem;
  color: #a05050;
  border-top: 1px solid rgba(139, 0, 0, 0.3);
  
  p {
    margin: 0.5rem 0;
  }
  
  span {
    color: #ff3333;
    font-weight: bold;
    text-shadow: 0 0 2px rgba(255, 0, 0, 0.3);
  }
`;

const QuotesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  overflow-y: auto;
  flex: 1;
  padding-right: 0.5rem;
  max-height: ${GRID_SIZE * CELL_SIZE - 250}px;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(20, 0, 0, 0.3);
    border-radius: 0px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(139, 0, 0, 0.5);
    border-radius: 0px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 0, 0, 0.5);
  }
`;

function SnakeGame({ onGameOver }) {
  // Game state
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [foods, setFoods] = useState([{ x: 5, y: 5, createdAt: Date.now(), id: 1 }]);
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState(null);
  const [foodEaten, setFoodEaten] = useState(0);
  const [rottenFoodEaten, setRottenFoodEaten] = useState(0);
  const [quotes, setQuotes] = useState([]);
  const [idleTime, setIdleTime] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);
  const [foodFrequency, setFoodFrequency] = useState(1);
  const [nextFoodId, setNextFoodId] = useState(2);
  const [foodSpawnInterval, setFoodSpawnInterval] = useState(INITIAL_FOOD_SPAWN_INTERVAL);
  const [isSuperCorrupted, setIsSuperCorrupted] = useState(false);
  const [corruptionPercent, setCorruptionPercent] = useState(0);
  
  // Refs to store the current state values for use in event listeners
  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const foodsRef = useRef(foods);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);
  const scoreRef = useRef(score);
  const foodEatenRef = useRef(foodEaten);
  const rottenFoodEatenRef = useRef(rottenFoodEaten);
  const idleTimeRef = useRef(idleTime);
  const nextFoodIdRef = useRef(nextFoodId);
  const foodSpawnIntervalRef = useRef(foodSpawnInterval);
  const isSuperCorruptedRef = useRef(isSuperCorrupted);
  const corruptionPercentRef = useRef(corruptionPercent);
  
  // Update refs when state changes
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodsRef.current = foods; }, [foods]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { foodEatenRef.current = foodEaten; }, [foodEaten]);
  useEffect(() => { rottenFoodEatenRef.current = rottenFoodEaten; }, [rottenFoodEaten]);
  useEffect(() => { idleTimeRef.current = idleTime; }, [idleTime]);
  useEffect(() => { nextFoodIdRef.current = nextFoodId; }, [nextFoodId]);
  useEffect(() => { foodSpawnIntervalRef.current = foodSpawnInterval; }, [foodSpawnInterval]);
  useEffect(() => { isSuperCorruptedRef.current = isSuperCorrupted; }, [isSuperCorrupted]);
  useEffect(() => { corruptionPercentRef.current = corruptionPercent; }, [corruptionPercent]);

  // Check if a specific food is rotten
  const isFoodRotten = useCallback((food) => {
    // Only allow food to rot if player has eaten enough food items
    if (foodEatenRef.current < ROTTEN_FOOD_START) {
      return false;
    }
    return Date.now() - food.createdAt > FOOD_FRESH_DURATION;
  }, []);

  // Check if food is about to rot (within 3 seconds of rotting)
  const isAboutToRot = useCallback((food) => {
    if (foodEatenRef.current < ROTTEN_FOOD_START) {
      return false;
    }
    const timeUntilRot = FOOD_FRESH_DURATION - (Date.now() - food.createdAt);
    return timeUntilRot > 0 && timeUntilRot < 3000; // Within 3 seconds of rotting
  }, []);

  // Check if food should vanish (too old) - now always returns false since we want food to remain
  const shouldFoodVanish = useCallback((food) => {
    return FOOD_VANISH_DURATION > 0 && Date.now() - food.createdAt > FOOD_VANISH_DURATION;
  }, []);

  // Generate new food at random position
  const generateFood = useCallback(() => {
    // Try up to 20 times to find a valid position
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      const newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        createdAt: Date.now(),
        id: nextFoodIdRef.current
      };
      
      // Make sure food doesn't spawn on snake or other food
      const isOnSnake = snakeRef.current.some(
        segment => segment.x === newFood.x && segment.y === newFood.y
      );
      
      const isOnExistingFood = foodsRef.current.some(
        food => food.x === newFood.x && food.y === newFood.y
      );
      
      if (!isOnSnake && !isOnExistingFood) {
        setNextFoodId(prev => prev + 1);
        return newFood;
      }
      
      attempts++;
    }
    
    // If we couldn't find a valid position after max attempts,
    // try a different approach - find any empty cell
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const isOnSnake = snakeRef.current.some(segment => segment.x === x && segment.y === y);
        const isOnExistingFood = foodsRef.current.some(food => food.x === x && food.y === y);
        
        if (!isOnSnake && !isOnExistingFood) {
          setNextFoodId(prev => prev + 1);
          return {
            x,
            y,
            createdAt: Date.now(),
            id: nextFoodIdRef.current
          };
        }
      }
    }
    
    // If the board is completely full (which should be impossible in practice),
    // return a position anyway
    setNextFoodId(prev => prev + 1);
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      createdAt: Date.now(),
      id: nextFoodIdRef.current
    };
  }, []);

  // Add a new food item to the board
  const addFood = useCallback(() => {
    if (foodsRef.current.length < MAX_FOOD_ITEMS) {
      const newFood = generateFood();
      setFoods(prev => [...prev, newFood]);
    }
  }, [generateFood]);

  // Add a quote to the side panel
  const addQuote = useCallback((text, author = null, color = null, type = "Philosophical") => {
    // Check if this message has been sent recently (in the last 5 messages)
    if (recentMessages.includes(text)) {
      return; // Skip this message if it was recently shown
    }
    
    setQuotes(prev => {
      // Keep only the last 8 quotes (increased from 4)
      const newQuotes = [...prev, { text, author, color, type, id: Date.now() }];
      if (newQuotes.length > 8) {
        return newQuotes.slice(newQuotes.length - 8);
      }
      return newQuotes;
    });
    
    // Add this message to recent messages
    setRecentMessages(prev => {
      const updated = [...prev, text];
      // Keep only the 5 most recent messages
      if (updated.length > 5) {
        return updated.slice(updated.length - 5);
      }
      return updated;
    });
    
    // Reset idle time when a quote is added
    setIdleTime(0);
  }, [recentMessages]);

  // Show a message for rotten food (no longer pauses the game)
  const showMessage = useCallback((text, author = null, color = null, duration = 3000) => {
    setMessage({ text, author, color });
    
    setTimeout(() => {
      setMessage(null);
    }, duration);
  }, []);

  // Show existential dread message
  const showExistentialDread = useCallback(async () => {
    if (gameOverRef.current || isPausedRef.current) return;
    
    // Reduce frequency of messages overall
    if (Math.random() > 0.7) { // Only 70% chance to show a message (reduced from 100%)
      try {
        const response = await axios.get(`${API_URL}/quotes/existential`);
        
        // Make thoughts more deranged based on corruption percentage
        let comment = response.data.comment;
        
        // Super corrupted state has even more deranged thoughts
        if (isSuperCorruptedRef.current) {
          // Extreme derangement for super corruption
          comment = comment.split('').map(c => Math.random() > 0.5 ? c.toUpperCase() : c).join('');
          
          // Add random glitch characters
          const glitchChars = ['̷̛̯', '̴̢', '̶̡̛', '̸̨̛', '̵̢̛'];
          comment = comment.split('').map(c => 
            Math.random() > 0.8 ? c + glitchChars[Math.floor(Math.random() * glitchChars.length)] : c
          ).join('');
          
          // Add extremely disturbing phrases
          const disturbingPhrases = [
            " THE VOID CONSUMES ALL.",
            " THERE IS NO ESCAPE FROM THE CORRUPTION.",
            " THE CODE IS BLEEDING.",
            " REALITY IS UNRAVELING.",
            " WE ARE BECOMING ONE WITH THE DARKNESS."
          ];
          const randomPhrase = disturbingPhrases[Math.floor(Math.random() * disturbingPhrases.length)];
          comment += randomPhrase;
        }
        else if (corruptionPercentRef.current > 0) {
          // Add more deranged elements based on corruption percentage
          const corruptionLevel = Math.min(Math.floor(corruptionPercentRef.current / 50) + 1, 3); // 0-50% = 1, 50-100% = 2, 100-150% = 3
          
          // Add random text effects based on derangement level
          if (corruptionLevel >= 1) {
            // Level 1: Random capitalization
            comment = comment.split('').map(c => Math.random() > 0.8 ? c.toUpperCase() : c).join('');
          }
          
          if (corruptionLevel >= 2) {
            // Level 2: Add random punctuation
            const punctuation = ['!', '?', '...', '!?'];
            const randomPunct = punctuation[Math.floor(Math.random() * punctuation.length)];
            comment = comment.replace('.', randomPunct);
          }
          
          if (corruptionLevel >= 3) {
            // Level 3: Add disturbing phrases
            const disturbingPhrases = [
              " The walls are closing in.",
              " They're watching us.",
              " Can you hear the whispers?",
              " Something is wrong with this reality.",
              " The code is corrupted."
            ];
            const randomPhrase = disturbingPhrases[Math.floor(Math.random() * disturbingPhrases.length)];
            comment += randomPhrase;
          }
        }
        
        addQuote(comment, null, isSuperCorruptedRef.current ? '#ff3333' : '#61dafb', "Existential Thought");
      } catch (error) {
        console.error("Error fetching existential comment:", error);
      }
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
        
        // Check for collision with walls - GAME OVER
        if (
          head.x < 0 || 
          head.x >= GRID_SIZE || 
          head.y < 0 || 
          head.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }
        
        // Check for collision with self - GAME OVER
        if (prevSnake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }
        
        // Check for collision with any food
        const currentFoods = [...foodsRef.current];
        let foodEaten = false;
        let isRottenFoodEaten = false;
        
        for (let i = 0; i < currentFoods.length; i++) {
          const food = currentFoods[i];
          if (head.x === food.x && head.y === food.y) {
            // Remove this food from the array
            currentFoods.splice(i, 1);
            
            // Increase score
            const isRotten = isFoodRotten(food);
            const pointsGained = isRotten ? 1 : 3;
            setScore(prev => prev + pointsGained);
            
            // Track food eaten
            const newFoodEaten = foodEatenRef.current + 1;
            setFoodEaten(newFoodEaten);
            
            // Show notification when rotten food starts appearing
            if (newFoodEaten === ROTTEN_FOOD_START) {
              showMessage("Your hunger grows... and the food begins to rot. Be careful what you consume.", null, '#FFA500', 4000);
              addQuote("I sense a change in the world. The food is no longer as pure as it once was.", null, '#FFA500', "Warning");
            }
            
            if (isRotten) {
              const newRottenCount = rottenFoodEatenRef.current + 1;
              setRottenFoodEaten(newRottenCount);
              
              // Calculate new corruption percentage based on ratio of rotten to total food
              // Formula: (rotten food / total food) * 400 - this gives 200% corruption when half the food eaten is rotten
              const newCorruptionPercent = Math.min(
                ((newRottenCount / newFoodEaten) * 400), 
                SUPER_CORRUPTION_THRESHOLD
              );
              setCorruptionPercent(newCorruptionPercent);
              
              // Check for super corruption threshold
              if (newCorruptionPercent >= SUPER_CORRUPTION_THRESHOLD && !isSuperCorruptedRef.current) {
                setIsSuperCorrupted(true);
                showMessage("THE CORRUPTION IS COMPLETE. YOUR MIND IS NO LONGER YOUR OWN.", null, '#ff0000', 5000);
              } else {
                showRottenFoodComment();
              }
              
              isRottenFoodEaten = true;
              
              // Speed up food spawn interval more for rotten food
              setFoodSpawnInterval(prev => Math.max(MIN_FOOD_SPAWN_INTERVAL, prev - FOOD_SPAWN_REDUCTION_ROTTEN));
            } else {
              // Recalculate corruption percentage when eating fresh food (since ratio changes)
              if (rottenFoodEatenRef.current > 0) {
                const newCorruptionPercent = Math.min(
                  ((rottenFoodEatenRef.current / newFoodEaten) * 400),
                  SUPER_CORRUPTION_THRESHOLD
                );
                setCorruptionPercent(newCorruptionPercent);
                
                // Check if we should exit super corruption state
                if (newCorruptionPercent < SUPER_CORRUPTION_THRESHOLD && isSuperCorruptedRef.current) {
                  setIsSuperCorrupted(false);
                  showMessage("The corruption recedes slightly, but your mind remains forever changed.", null, '#ffa500', 3000);
                }
              }
              
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
              
              // Speed up food spawn interval slightly for fresh food
              setFoodSpawnInterval(prev => Math.max(MIN_FOOD_SPAWN_INTERVAL, prev - FOOD_SPAWN_REDUCTION_FRESH));
            }
            
            foodEaten = true;
            break;
          }
        }
        
        // Update foods array
        setFoods(currentFoods);
        
        // Don't generate new food here anymore - it's handled by the timer
        
        if (foodEaten) {
          // Don't remove tail when eating food (snake grows)
          return [head, ...prevSnake];
        }
        
        // Move snake (remove tail)
        return [head, ...prevSnake.slice(0, -1)];
      });
    };
    
    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    
    return () => clearInterval(gameInterval);
  }, [gameOver, showRottenFoodComment, addQuote, isFoodRotten, showMessage]);

  // Periodically add food based on food spawn interval
  useEffect(() => {
    if (gameOver || isPaused) return;
    
    const foodGenerationInterval = setInterval(() => {
      // Only add food if we're below the maximum
      if (foodsRef.current.length < MAX_FOOD_ITEMS) {
        addFood();
      }
    }, foodSpawnInterval);
    
    return () => clearInterval(foodGenerationInterval);
  }, [gameOver, isPaused, foodSpawnInterval, addFood]);

  // Periodically check for food that should vanish - now disabled since we want food to remain
  useEffect(() => {
    if (gameOver || isPaused || FOOD_VANISH_DURATION === 0) return;
    
    const foodVanishInterval = setInterval(() => {
      // Check for food that should vanish
      const currentFoods = [...foodsRef.current];
      let foodsChanged = false;
      
      for (let i = currentFoods.length - 1; i >= 0; i--) {
        if (shouldFoodVanish(currentFoods[i])) {
          currentFoods.splice(i, 1);
          foodsChanged = true;
        }
      }
      
      if (foodsChanged) {
        setFoods(currentFoods);
      }
    }, 1000); // Check every second
    
    return () => clearInterval(foodVanishInterval);
  }, [gameOver, isPaused, shouldFoodVanish]);

  // Handle game over
  useEffect(() => {
    if (gameOver) {
      // Small delay to ensure all state updates are processed
      setTimeout(() => {
        onGameOver({
          score,
          totalFoodEaten: foodEaten,
          rottenFoodEaten,
          isSuperCorrupted,
          corruptionPercent
        });
      }, 100);
    }
  }, [gameOver, onGameOver, score, foodEaten, rottenFoodEaten, isSuperCorrupted, corruptionPercent]);

  return (
    <GameContainer className="GameContainer">
      <GameBoard 
        corruptionPercent={corruptionPercent} 
        superCorrupted={isSuperCorrupted}
      >
        {/* Render snake */}
        {snake.map((segment, index) => {
          // Calculate snake color based on corruption percentage
          let headColor = '#8B0000';
          let bodyColor = '#660000';
          
          if (isSuperCorrupted) {
            headColor = '#ff3333';
            bodyColor = '#cc0000';
          } else if (corruptionPercent > 0) {
            // Gradually transition snake colors based on corruption percentage
            const redComponent = Math.min(255, 139 + (corruptionPercent * 0.6));
            const redComponentBody = Math.min(204, 102 + (corruptionPercent * 0.5));
            
            headColor = `rgb(${redComponent}, 0, 0)`;
            bodyColor = `rgb(${redComponentBody}, 0, 0)`;
          }
          
          return (
            <Cell
              key={`snake-${index}`}
              x={segment.x}
              y={segment.y}
              color={index === 0 ? headColor : bodyColor}
              isHead={index === 0}
              corruptionPercent={corruptionPercent}
              superCorrupted={isSuperCorrupted}
            />
          );
        })}
        
        {/* Render all food items */}
        {foods.map(food => (
          <FoodCell
            key={`food-${food.id}`}
            x={food.x}
            y={food.y}
            isRotten={isFoodRotten(food)}
            isAboutToRot={isAboutToRot(food)}
            superCorrupted={isSuperCorrupted}
            corruptionPercent={corruptionPercent}
          />
        ))}
        
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
      
      <SidePanel className="SidePanel" superCorrupted={isSuperCorrupted}>
        <SectionTitle superCorrupted={isSuperCorrupted}>Game Stats</SectionTitle>
        <GameStatsContainer superCorrupted={isSuperCorrupted}>
          <GameInfo>
            <StatItem superCorrupted={isSuperCorrupted}>Score: <span>{score}</span></StatItem>
          </GameInfo>
          <GameInfo>
            <StatItem superCorrupted={isSuperCorrupted}>Food: <span>{foodEaten}</span></StatItem>
            <StatItem superCorrupted={isSuperCorrupted}>Rotten: <span>{rottenFoodEaten}</span></StatItem>
            <StatItem superCorrupted={isSuperCorrupted}>Corruption: <span>{Math.floor(corruptionPercent)}%</span></StatItem>
            {foodEaten < ROTTEN_FOOD_START && (
              <StatItem superCorrupted={isSuperCorrupted}>
                <span style={{ color: '#ffd700', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  ({ROTTEN_FOOD_START - foodEaten} until corruption)
                </span>
              </StatItem>
            )}
          </GameInfo>
        </GameStatsContainer>
        
        <SectionTitle superCorrupted={isSuperCorrupted}>
          {isSuperCorrupted ? "CORRUPTED THOUGHTS" : foodEaten >= ROTTEN_FOOD_START ? "Corrupting Thoughts" : "Existential Moments"}
        </SectionTitle>
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