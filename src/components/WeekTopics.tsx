import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { getWeekContent } from '@/lib/weekContent';

interface WeekTopicsProps {
  weekNumber?: string;
}

// Get the weekContent using weekNumber
const fetchWeekContent = async (weekNumber: string) => {
  if (!weekNumber) {
    return [];
  }
  
  const content = await getWeekContent(weekNumber);
  return content ? content.topics : [];
}

export const WeekTopics: React.FC<WeekTopicsProps> = ({ weekNumber }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      
      const content = await getWeekContent(weekNumber);
      const weekTopics = content.content.Problems
      
      setTopics(weekTopics);
      setLoading(false);
    };

    fetchContent();
  }, [weekNumber]); // Only re-run when weekNumber changes

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Loading Week {weekNumber}...</h2>
      </div>
    );
  }
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome to Week {weekNumber}!</h2> 
      <p className="text-gray-700 whitespace-pre-wrap">{topics[0]["Problem Main Question"]}</p>
    </div>
  );
};