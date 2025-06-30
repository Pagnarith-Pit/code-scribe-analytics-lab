
interface ExercisePanelProps {
  onHintRequest: (level: 1 | 2 | 3) => void;
  hintsUsed: number[];
}

export const ExercisePanel = ({ onHintRequest, hintsUsed }: ExercisePanelProps) => {
  const exerciseData = {
    title: "Word Frequency Counter",
    description: "Create a Python program that analyzes text and counts word frequencies.",
    requirements: [
      "Write a function called `count_words()` that takes a string as input",
      "The function should return a dictionary with words as keys and their counts as values",
      "Ignore case (treat 'Hello' and 'hello' as the same word)",
      "Remove punctuation from words",
      "Handle empty strings gracefully"
    ],
    examples: [
      {
        input: `"Hello world! Hello Python world."`,
        output: `{'hello': 2, 'world': 2, 'python': 1}`
      }
    ],
    testCases: [
      'count_words("Hello world")',
      'count_words("The quick brown fox jumps over the lazy dog")',
      'count_words("")',
      'count_words("Python! Python? Python.")'
    ]
  };

  const isHintAvailable = (level: 1 | 2 | 3) => {
    if (level === 1) return true;
    if (level === 2) return hintsUsed.includes(1);
    if (level === 3) return hintsUsed.includes(2);
    return false;
  };

  const getHintButtonText = (level: 1 | 2 | 3) => {
    if (hintsUsed.includes(level)) return `Hint ${level} (Used)`;
    if (!isHintAvailable(level)) return `Hint ${level} (Locked)`;
    return `Get Hint ${level}`;
  };

  return (
    <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <h2 className="text-xl font-bold text-blue-800">{exerciseData.title}</h2>
        <p className="text-blue-600 mt-1">{exerciseData.description}</p>
      </div>
      
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Requirements */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Requirements</h3>
          <ul className="space-y-2">
            {exerciseData.requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700 text-sm">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Examples */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Example</h3>
          {exerciseData.examples.map((example, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">Input:</span>
                <code className="ml-2 bg-gray-200 px-2 py-1 rounded text-sm">
                  {example.input}
                </code>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Output:</span>
                <code className="ml-2 bg-gray-200 px-2 py-1 rounded text-sm">
                  {example.output}
                </code>
              </div>
            </div>
          ))}
        </div>

        {/* Test Cases */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Test Your Solution</h3>
          <div className="space-y-2">
            {exerciseData.testCases.map((testCase, idx) => (
              <code key={idx} className="block bg-gray-100 p-2 rounded text-sm text-gray-800">
                {testCase}
              </code>
            ))}
          </div>
        </div>

        {/* Hint System */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Need Help?</h3>
          <div className="space-y-2">
            {[1, 2, 3].map(level => (
              <button
                key={level}
                onClick={() => onHintRequest(level as 1 | 2 | 3)}
                disabled={!isHintAvailable(level as 1 | 2 | 3)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  hintsUsed.includes(level)
                    ? 'bg-green-100 border-2 border-green-300 text-green-800'
                    : isHintAvailable(level as 1 | 2 | 3)
                    ? 'bg-blue-50 border-2 border-blue-200 text-blue-800 hover:bg-blue-100'
                    : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {getHintButtonText(level as 1 | 2 | 3)}
                  </span>
                  <span className="text-2xl">
                    {level === 1 ? '💡' : level === 2 ? '🎯' : '✨'}
                  </span>
                </div>
                <div className="text-sm mt-1 text-gray-600">
                  {level === 1 && 'Gentle guidance to get you started'}
                  {level === 2 && 'More direct approach and structure'}
                  {level === 3 && 'Complete solution with explanation'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
