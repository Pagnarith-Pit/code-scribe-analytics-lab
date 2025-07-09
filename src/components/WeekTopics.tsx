import React from 'react';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: number;
}

interface WeekTopicsProps {
  weekNumber: string;
  messages: Message[];
  loading: boolean;
  problemState: {
    currentProblemIndex: number;
    currentSubproblemIndex: number;
    isComplete: boolean;
  };
}

export const WeekTopics: React.FC<WeekTopicsProps> = ({ 
  weekNumber, 
  messages, 
  loading, 
  problemState 
}) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Loading Week {weekNumber}...</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // rounded-lg shadow-md border border-gray-200
  return (
    <div className="bg-gay-50 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Welcome to Week {weekNumber}!</h2>
        <div className="text-sm text-gray-500">
          Problem {problemState.currentProblemIndex + 1}.{problemState.currentSubproblemIndex + 1}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            // This is the message border. 
            // className={`p-4 rounded-lg ${
            //   message.type === 'ai' 
            //     ? 'bg-blue-50 border-l-4 border-blue-400' 
            //     : 'bg-gray-50 border-l-4 border-gray-400'
            // }`}
          >
            <div className="whitespace-pre-wrap text-gray-800">
              {message.content}
            </div>
            
            {/* This is a chat timestamp */}
            {/* <div className="text-xs text-gray-500 mt-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div> */}
          </div>
        ))}
      </div>
      
      {problemState.isComplete && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800 font-semibold">
            🎉 Week {weekNumber} Complete!
          </div>
        </div>
      )}
    </div>
  );
};