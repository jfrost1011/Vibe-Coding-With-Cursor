import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const StartContainer = styled.div`
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

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #61dafb;
  text-shadow: 0 0 15px rgba(97, 218, 251, 0.5);
  letter-spacing: 2px;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, rgba(97, 218, 251, 0), rgba(97, 218, 251, 1), rgba(97, 218, 251, 0));
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin: 1.2rem 0;
  line-height: 1.7;
  color: #a0a0a0;
  max-width: 90%;
  font-style: italic;
  background-color: rgba(30, 33, 39, 0.4);
  padding: 1.2rem;
  border-radius: 8px;
  border: 1px solid rgba(97, 218, 251, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 1.5rem 0;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  width: 100%;
`;

const Label = styled.label`
  position: absolute;
  top: -10px;
  left: 15px;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 0 8px;
  font-size: 0.9rem;
  color: #61dafb;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  font-size: 1.1rem;
  background-color: rgba(30, 33, 39, 0.6);
  border: 2px solid rgba(97, 218, 251, 0.3);
  border-radius: 8px;
  color: white;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #61dafb;
    box-shadow: 0 0 10px rgba(97, 218, 251, 0.5);
  }
  
  &::placeholder {
    color: rgba(160, 160, 160, 0.6);
  }
`;

const Button = styled.button`
  padding: 15px 30px;
  font-size: 1.2rem;
  margin-top: 1rem;
  background-color: rgba(97, 218, 251, 0.2);
  color: #61dafb;
  border: 2px solid #61dafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  box-shadow: 0 0 10px rgba(97, 218, 251, 0.3);
  align-self: center;
  
  &:hover {
    background-color: rgba(97, 218, 251, 0.3);
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(97, 218, 251, 0.4);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
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

function StartScreen({ onStart }) {
  const [playerName, setPlayerName] = useState('');
  const [quote, setQuote] = useState({ quote: "", author: "" });
  
  useEffect(() => {
    // Fetch a philosophical quote
    axios.get(`${API_URL}/quotes/philosophical`)
      .then(res => setQuote(res.data))
      .catch(err => console.error("Error fetching quote:", err));
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      onStart(playerName.trim());
    }
  };
  
  return (
    <StartContainer>
      <Title>Existential Snake</Title>
      
      <Subtitle>
        Navigate the maze of existence as a snake questioning its purpose. 
        Consume to grow, but beware of rotten sustenance that corrupts your being.
      </Subtitle>
      
      {quote.quote && (
        <Quote>
          {quote.quote}
          <Author>— {quote.author}</Author>
        </Quote>
      )}
      
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="playerName">Your Name</Label>
          <Input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </InputGroup>
        
        <Button type="submit" disabled={!playerName.trim()}>
          Begin Existence
        </Button>
      </Form>
    </StartContainer>
  );
}

export default StartScreen; 