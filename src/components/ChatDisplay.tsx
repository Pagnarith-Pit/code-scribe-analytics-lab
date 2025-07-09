import React, { useState } from 'react';

interface ChatDisplayProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const AnimatedSparkles = () => (
  <div className="relative inline-block">
    <div className="relative w-6 h-6">
      <div className="absolute inset-0 animate-pulse">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e879f9" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path 
            d="M50 5 L65 35 L95 50 L65 65 L50 95 L35 65 L5 50 L35 35 Z" 
            fill="url(#animatedGradient)"
            className="drop-shadow-lg"
          />
        </svg>
      </div>
      
      <div className="absolute -bottom-1 -left-1 w-3 h-3 animate-pulse [animation-delay:-0.5s]">
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 transform rotate-45 rounded-sm"></div>
      </div>
    </div>
  </div>
);

export const ChatDisplay: React.FC<ChatDisplayProps> = ({ onSendMessage, disabled = false }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-l font-bold text-gray-800 mb-2 text-center">
        <AnimatedSparkles/>
        AI-Powered Chatbox
      </h2>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? "Complete current problem to continue..." : "Ask the AI a question..."}
          disabled={disabled}
          className={`w-full px-5 py-3 pr-14 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className={`absolute right-2 font-bold p-2 rounded-full transition-colors focus:outline-none ${
            disabled || !input.trim()
              ? 'bg-gray-400 cursor-not-allowed text-gray-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
    </div>
  );
};