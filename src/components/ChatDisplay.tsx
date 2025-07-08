import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export const ChatDisplay: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-l font-bold text-gray-800 mb-2 text-center">AI-Powered Chatbox</h2>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI a question..."
          className="w-full px-5 py-3 pr-14 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-2 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-full transition-colors focus:outline-none"
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