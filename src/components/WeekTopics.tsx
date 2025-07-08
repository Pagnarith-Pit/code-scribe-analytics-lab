import React from 'react';

const topics = [
  "Week 1: Introduction to Python",
  "Week 2: Data Structures",
  "Week 3: Functions and Modules",
  "Week 4: Object-Oriented Programming",
  "Week 5: File I/O and Exception Handling",
];

export const WeekTopics: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome to Week x !</h2>
      <ul className="space-y-2">
        {topics.map((topic, index) => (
          <li key={index} className="text-gray-700 hover:text-blue-600 cursor-pointer">
            {topic}
          </li>
        ))}
      </ul>
    </div>
  );
};