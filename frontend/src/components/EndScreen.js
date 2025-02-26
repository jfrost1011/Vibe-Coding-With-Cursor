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
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  max-width: 550px;
  width: 90%;
  box-shadow: 0 0 30px rgba(97, 218, 251, 0.4);
  border: 1px solid rgba(97, 218, 251, 0.2);
  animation: fadeIn 0.8s ease, glowPulse 3s infinite alternate;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes glowPulse {
    from { box-shadow: 0 0 20px rgba(97, 218, 251, 0.3); }
    to { box-shadow: 0 0 40px rgba(97, 218, 251, 0.5); }
  }
`;

const Title = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 1.2rem;
  color: ${props => {
    if (props.isGameOver) return '#ff6b6b';
    return props.isGoodEnding ? '#61dafb' : '#ff6b6b';
  }};
  text-shadow: 0 0 10px ${props => {
    if (props.isGameOver) return 'rgba(255, 107, 107, 0.7)';
    return props.isGoodEnding ? 'rgba(97, 218, 251, 0.7)' : 'rgba(255, 107, 107, 0.7)';
  }};
  letter-spacing: 1px;
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 1.5rem 0;
  background-color: rgba(30, 33, 39, 0.6);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(97, 218, 251, 0.2);
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0.7rem 0;
  padding: 0.7rem;
  border-bottom: 1px solid rgba(97, 218, 251, 0.2);
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  font-weight: bold;
  color: #a0a0a0;
`;

const StatValue = styled.span`
  color: #61dafb;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(97, 218, 251, 0.3);
`;

const Message = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin: 1.2rem 0;
  line-height: 1.7;
  font-style: italic;
  color: ${props => props.isGoodEnding ? '#a0e8af' : props.isGameOver ? '#a0a0a0' : '#ff9999'};
  background-color: rgba(30, 33, 39, 0.4);
  padding: 1.2rem;
  border-radius: 8px;
  border: 1px solid rgba(97, 218, 251, 0.1);
`;

const Quote = styled.blockquote`
  font-style: italic;
  margin: 1.8rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid #61dafb;
  color: #d0d0d0;
  background-color: rgba(30, 33, 39, 0.5);
  border-radius: 0 8px 8px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::before {
    content: '"';
    position: absolute;
    top: 0;
    left: 12px;
    font-size: 3rem;
    color: rgba(97, 218, 251, 0.2);
    line-height: 1;
  }
`;

const Author = styled.cite`
  display: block;
  text-align: right;
  margin-top: 0.8rem;
  font-size: 1rem;
  color: #61dafb;
`;

const Button = styled.button`
  padding: 14px 28px;
  font-size: 1.2rem;
  margin-top: 1.5rem;
  background-color: rgba(97, 218, 251, 0.2);
  color: #61dafb;
  border: 2px solid #61dafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  box-shadow: 0 0 10px rgba(97, 218, 251, 0.3);
  
  &:hover {
    background-color: rgba(97, 218, 251, 0.3);
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(97, 218, 251, 0.4);
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
          ? "Game Over" 
          : isGoodEnding 
            ? "Transcendence Achieved" 
            : "Corrupted Existence"
        }
      </Title>
      
      <Message isGoodEnding={isGoodEnding} isGameOver={!isVictory}>
        {!isVictory
          ? "Your journey ended prematurely. The existential quest remains unfulfilled."
          : isGoodEnding 
            ? "You have navigated the existential maze with wisdom, choosing sustenance over decay."
            : "Your choices have led you down a path of corruption. The rot has consumed you from within."
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
        Begin Anew
      </Button>
    </EndContainer>
  );
}

export default EndScreen; 