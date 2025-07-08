import { useState, useRef, useEffect } from 'react';

interface AIResponsePanelProps {
  className?: string;
}

export const AIResponsePanel = ({ className }: AIResponsePanelProps) => {
  const [responses, setResponses] = useState<string[]>([
    "Welcome to the Python Learning IDE! I'm here to help you with your coding journey.",
    "For this week's exercise, focus on understanding how to iterate through text and count occurrences.",
    "Remember to handle edge cases like empty strings and punctuation removal."
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [responses]);

  // Simulate AI response (you can replace this with actual AI integration)
  const simulateAIResponse = () => {
    setIsTyping(true);
    setTimeout(() => {
      const sampleResponses = [
        "Great progress! Consider using Python's built-in string methods for text processing.",
        "Try using the .split() method to break text into individual words.",
        "Don't forget to convert text to lowercase for case-insensitive counting.",
        "You can use a dictionary to store word counts efficiently.",
        "The .strip() and .replace() methods are useful for cleaning punctuation."
      ];
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      setResponses(prev => [...prev, randomResponse]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI Assistant</h2>
            <p className="text-gray-600 text-sm">Real-time guidance and feedback</p>
          </div>
          <button
            onClick={simulateAIResponse}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Ask AI
          </button>
        </div>
      </div>
      
      <div 
        ref={contentRef}
        className="p-4 space-y-4 overflow-y-auto"
        style={{ maxHeight: 'calc(100% - 80px)' }}
      >
        {responses.map((response, index) => (
          <div 
            key={index}
            className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg"
          >
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-lg">🤖</span>
              <p className="text-gray-800 text-sm leading-relaxed flex-1">
                {response}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="bg-gray-50 border-l-4 border-gray-300 p-3 rounded-r-lg">
            <div className="flex items-start gap-2">
              <span className="text-gray-500 text-lg">🤖</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-600 text-sm">AI is thinking</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};