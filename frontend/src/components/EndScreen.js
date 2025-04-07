import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const EndContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 0px;
  max-width: 550px;
  width: 90%;
  box-shadow: 0 0 30px rgba(139, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(139, 0, 0, 0.3);
  animation: fadeIn 0.8s ease, glowPulse 3s infinite alternate;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes glowPulse {
    from { box-shadow: 0 0 20px rgba(139, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.6); }
    to { box-shadow: 0 0 40px rgba(255, 0, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.6); }
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M20,20 Q40,80 80,30" stroke="rgba(139,0,0,0.1)" fill="none" stroke-width="1"/></svg>');
    background-size: 120px 120px;
    pointer-events: none;
    opacity: 0.3;
    z-index: -1;
  }
`;

const Title = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 1.2rem;
  color: ${props => {
    if (props.isGameOver) return '#ff0000';
    return props.isGoodEnding ? '#ff3333' : '#8B0000';
  }};
  text-shadow: 0 0 10px ${props => {
    if (props.isGameOver) return 'rgba(255, 0, 0, 0.7)';
    return props.isGoodEnding ? 'rgba(255, 0, 0, 0.7)' : 'rgba(139, 0, 0, 0.7)';
  }};
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 100%;
    height: 1px;
    background: ${props => {
      if (props.isGameOver) return 'linear-gradient(90deg, rgba(139, 0, 0, 0), rgba(255, 0, 0, 0.8), rgba(139, 0, 0, 0))';
      return props.isGoodEnding ? 
        'linear-gradient(90deg, rgba(139, 0, 0, 0), rgba(255, 51, 51, 0.8), rgba(139, 0, 0, 0))' : 
        'linear-gradient(90deg, rgba(139, 0, 0, 0), rgba(139, 0, 0, 0.8), rgba(139, 0, 0, 0))';
    }};
  }
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 1.5rem 0;
  background-color: rgba(20, 0, 0, 0.6);
  border-radius: 0px;
  padding: 1.5rem;
  border: 1px solid rgba(139, 0, 0, 0.3);
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.4);
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0.7rem 0;
  padding: 0.7rem;
  border-bottom: 1px solid rgba(139, 0, 0, 0.2);
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  font-weight: bold;
  color: #a05050;
`;

const StatValue = styled.span`
  color: #ff0000;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(139, 0, 0, 0.3);
  font-family: 'Courier New', monospace;
`;

const Message = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin: 1.2rem 0;
  line-height: 1.7;
  font-style: italic;
  color: ${props => props.isGoodEnding ? '#ff9999' : props.isGameOver ? '#a05050' : '#8B0000'};
  background-color: rgba(20, 0, 0, 0.4);
  padding: 1.2rem;
  border-radius: 0px;
  border: 1px solid rgba(139, 0, 0, 0.2);
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
`;

const Quote = styled.blockquote`
  font-style: italic;
  margin: 1.8rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid #8B0000;
  color: #d0d0d0;
  background-color: rgba(20, 0, 0, 0.5);
  border-radius: 0px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::before {
    content: '"';
    position: absolute;
    top: 0;
    left: 12px;
    font-size: 3rem;
    color: rgba(139, 0, 0, 0.2);
    line-height: 1;
  }
`;

const Author = styled.cite`
  display: block;
  text-align: right;
  margin-top: 0.8rem;
  font-size: 1rem;
  color: #a05050;
`;

const Button = styled.button`
  padding: 14px 28px;
  font-size: 1.2rem;
  margin-top: 1.5rem;
  background-color: rgba(139, 0, 0, 0.2);
  color: #ff0000;
  border: 2px solid #8B0000;
  border-radius: 0px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  box-shadow: 0 0 10px rgba(139, 0, 0, 0.3);
  font-family: 'Courier New', monospace;
  
  &:hover {
    background-color: rgba(139, 0, 0, 0.3);
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(255, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

function EndScreen({ stats, onRestart }) {
  const [quote, setQuote] = useState({ quote: "", author: "" });
  const isVictory = stats?.totalFoodEaten >= 10;
  const isGoodEnding = isVictory && stats?.rottenFoodEaten / stats?.totalFoodEaten < 0.5;
  
  useEffect(() => {
    // Save score to backend
    if (stats) {
      let gameResult = "incomplete";
      
      if (isVictory) {
        gameResult = isGoodEnding ? "good" : "bad";
      }
      
      axios.post(`${API_URL}/scores`, {
        player_name: stats.playerName,
        score: stats.score,
        food_eaten: stats.totalFoodEaten,
        rotten_food_eaten: stats.rottenFoodEaten,
        game_result: gameResult
      }).catch(err => console.error("Error saving score:", err));
      
      // Fetch a philosophical quote
      axios.get(`${API_URL}/quotes/philosophical`)
        .then(res => setQuote(res.data))
        .catch(err => console.error("Error fetching quote:", err));
    }
  }, [stats, isGoodEnding, isVictory]);

  if (!stats) return null;

  return (
    <EndContainer className="fade-in">
      <Title isGoodEnding={isGoodEnding} isGameOver={!isVictory}>
        {!isVictory 
          ? "Your Demise" 
          : isGoodEnding 
            ? "Blood Ascension" 
            : "Complete Corruption"
        }
      </Title>
      
      <Message isGoodEnding={isGoodEnding} isGameOver={!isVictory}>
        {!isVictory
          ? "Your journey ends in darkness. The abyss has claimed you."
          : isGoodEnding 
            ? "You've mastered the darkness within, becoming something beyond mortal understanding."
            : "The rot has consumed you entirely. Your soul is now a vessel of pure corruption."
        }
      </Message>
      
      <StatsContainer>
        <StatRow>
          <StatLabel>Player:</StatLabel>
          <StatValue>{stats.playerName}</StatValue>
        </StatRow>
        <StatRow>
          <StatLabel>Score:</StatLabel>
          <StatValue>{stats.score}</StatValue>
        </StatRow>
        <StatRow>
          <StatLabel>Food Eaten:</StatLabel>
          <StatValue>{stats.totalFoodEaten}/10</StatValue>
        </StatRow>
        <StatRow>
          <StatLabel>Rotten Food:</StatLabel>
          <StatValue>{stats.rottenFoodEaten}</StatValue>
        </StatRow>
        {stats.totalFoodEaten > 0 && (
          <StatRow>
            <StatLabel>Corruption Ratio:</StatLabel>
            <StatValue>
              {Math.round((stats.rottenFoodEaten / stats.totalFoodEaten) * 100)}%
            </StatValue>
          </StatRow>
        )}
      </StatsContainer>
      
      {quote.quote && (
        <Quote>
          {quote.quote}
          <Author>— {quote.author}</Author>
        </Quote>
      )}
      
      <Button onClick={onRestart}>
        Return to Darkness
      </Button>
    </EndContainer>
  );
}

export default EndScreen; 