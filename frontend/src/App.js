import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SnakeGame from './components/SnakeGame';
import StartScreen from './components/StartScreen';
import EndScreen from './components/EndScreen';
import './App.css';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #111111;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(139, 0, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 90% 80%, rgba(139, 0, 0, 0.1) 0%, transparent 50%);
  color: white;
  font-family: 'Courier New', monospace;
  position: relative;
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><path d="M30,30 Q50,20 80,50 T150,80 T220,50 T280,90" stroke="rgba(139,0,0,0.05)" fill="none" stroke-width="1"/></svg>');
    background-size: 300px 300px;
    pointer-events: none;
    opacity: 0.5;
    z-index: 0;
  }
`;

const GameTitle = styled.h1`
  font-size: 3rem;
  color: #ff0000;
  margin-bottom: 2rem;
  text-shadow: 0 0 15px rgba(139, 0, 0, 0.7);
  letter-spacing: 3px;
  animation: bloodGlow 3s infinite alternate;
  position: relative;
  z-index: 1;
  
  @keyframes bloodGlow {
    from { text-shadow: 0 0 10px rgba(139, 0, 0, 0.5); }
    to { text-shadow: 0 0 20px rgba(255, 0, 0, 0.8), 0 0 30px rgba(139, 0, 0, 0.6); }
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 1px;
    background: linear-gradient(90deg, rgba(139, 0, 0, 0), rgba(255, 0, 0, 0.7), rgba(139, 0, 0, 0));
  }
`;

const BackgroundParticle = styled.div`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: rgba(139, 0, 0, 0.1);
  border-radius: 50%;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  animation: float ${props => props.duration}s infinite ease-in-out alternate;
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.3);
  z-index: 0;
  
  @keyframes float {
    from { transform: translateY(0) rotate(0deg); }
    to { transform: translateY(20px) rotate(360deg); }
  }
`;

const CountdownOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(3px);
`;

const CountdownNumber = styled.div`
  font-size: 7rem;
  color: #ff0000;
  text-shadow: 0 0 30px rgba(255, 0, 0, 0.7);
  animation: pulse 1s infinite;
  font-family: 'Courier New', monospace;
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.9; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

// Generate background particles but make them more blood-like 
function generateParticles(count) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      size: Math.random() * 4 + 2, // Smaller particles
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 10 + 10, // Slower movement
    });
  }
  return particles;
}

const particles = generateParticles(15);

function App() {
  const [gameState, setGameState] = useState('start'); // start, playing, end
  const [playerName, setPlayerName] = useState('');
  const [gameStats, setGameStats] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const handleStartGame = (name) => {
    setPlayerName(name);
    setCountdown(3);
    
    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setGameState('playing');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGameOver = (stats) => {
    setGameStats({
      ...stats,
      playerName
    });
    setGameState('end');
  };

  const handleRestart = () => {
    setGameState('start');
    setGameStats(null);
  };

  return (
    <AppContainer>
      {particles.map(particle => (
        <BackgroundParticle 
          key={particle.id}
          size={particle.size}
          top={particle.top}
          left={particle.left}
          duration={particle.duration}
        />
      ))}
      
      {gameState === 'start' && (
        <>
          <GameTitle>Existential Snake</GameTitle>
          <StartScreen onStart={handleStartGame} />
        </>
      )}
      
      {countdown !== null && (
        <CountdownOverlay>
          <CountdownNumber>{countdown}</CountdownNumber>
        </CountdownOverlay>
      )}
      
      {gameState === 'playing' && countdown === null && (
        <SnakeGame onGameOver={handleGameOver} />
      )}
      
      {gameState === 'end' && (
        <EndScreen stats={gameStats} onRestart={handleRestart} />
      )}
    </AppContainer>
  );
}

export default App; 