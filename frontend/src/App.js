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
  background-color: #282c34;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(97, 218, 251, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 90% 80%, rgba(97, 218, 251, 0.05) 0%, transparent 50%);
  color: white;
  font-family: 'Courier New', monospace;
  position: relative;
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
`;

const GameTitle = styled.h1`
  font-size: 3rem;
  color: #61dafb;
  margin-bottom: 2rem;
  text-shadow: 0 0 15px rgba(97, 218, 251, 0.5);
  letter-spacing: 3px;
  animation: glow 3s infinite alternate;
  
  @keyframes glow {
    from { text-shadow: 0 0 10px rgba(97, 218, 251, 0.5); }
    to { text-shadow: 0 0 20px rgba(97, 218, 251, 0.8), 0 0 30px rgba(97, 218, 251, 0.6); }
  }
`;

const BackgroundParticle = styled.div`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: rgba(97, 218, 251, 0.1);
  border-radius: 50%;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  animation: float ${props => props.duration}s infinite ease-in-out alternate;
  
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(3px);
`;

const CountdownNumber = styled.div`
  font-size: 8rem;
  color: #61dafb;
  text-shadow: 0 0 20px rgba(97, 218, 251, 0.8);
  animation: pulse 1s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

// Generate background particles
const generateParticles = (count) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      size: Math.random() * 10 + 5,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 10 + 10
    });
  }
  return particles;
};

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