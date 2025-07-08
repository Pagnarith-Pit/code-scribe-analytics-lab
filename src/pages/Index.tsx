import { useState, useEffect } from 'react';
import { PythonEditor } from '@/components/PythonEditor';
import { OutputPanel } from '@/components/OutputPanel';
import { usePyodide } from '@/hooks/usePyodide';
import { WeekTopics } from '@/components/WeekTopics';
import { ChatDisplay } from '@/components/ChatDisplay';

const Index = () => {
  const [currentCode, setCurrentCode] = useState(`# Write your Python code here
# For example:
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
`);
  
  const [output, setOutput] = useState('');
  const [executionTime, setExecutionTime] = useState<number>();
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  
  const { runPython, isLoading, isRunning } = usePyodide();

  const handleCodeChange = (code: string) => {
    setCurrentCode(code);
  };

  const handleRunCode = async (code: string) => {
    if (isLoading) {
      setOutput('Python runtime is still loading...');
      return;
    }

    const result = await runPython(code);
    setOutput(result.output);
    setExecutionTime(result.executionTime);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Python IDE</h2>
          <p className="text-gray-600">Initializing Python runtime...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-10 gap-4 p-4 h-screen">
        {/* Left Side (80%) */}
        <div className="col-span-8 flex flex-col gap-4">
          <div className="h-1/4">
            <WeekTopics />
          </div>
          <div className="h-3/4 flex-grow">
            <ChatDisplay messages={aiMessages} />
          </div>
        </div>

        {/* Right Side (20%) */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="flex-grow h-3/5">
            <PythonEditor
              initialCode={currentCode}
              onChange={handleCodeChange}
              onRun={handleRunCode}
            />
          </div>
          <div className="h-2/5">
            <OutputPanel
              output={output}
              isRunning={isRunning}
              executionTime={executionTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;