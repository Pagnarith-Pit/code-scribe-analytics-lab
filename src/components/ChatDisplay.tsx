import React from 'react';

interface ChatDisplayProps {
  messages: string[];
}

export const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex-grow flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4">AI Assistant</h2>
      <div className="prose prose-sm max-w-none flex-grow overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500">The AI's responses will appear here...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} dangerouslySetInnerHTML={{ __html: msg }} />
          ))
        )}
      </div>
    </div>
  );
};