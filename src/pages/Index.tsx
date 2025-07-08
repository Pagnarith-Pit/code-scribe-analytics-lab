
import { useState, useEffect } from 'react';
import { PythonEditor } from '@/components/PythonEditor';
import { OutputPanel } from '@/components/OutputPanel';
import { WeekTopics } from '@/components/WeekTopics';
import { AIResponsePanel } from '@/components/AIResponsePanel';
import { HintModal } from '@/components/HintModal';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePyodide } from '@/hooks/usePyodide';
import { hints } from '@/data/hints';

const Index = () => {
  const [currentCode, setCurrentCode] = useState(`# Write your count_words function here
def count_words(text):
    # Your code here
    pass

# Test your function
if __name__ == "__main__":
    test_text = "Hello world! Hello Python world."
    result = count_words(test_text)
    print(f"Result: {result}")
`);
  
  const [output, setOutput] = useState('');
  const [executionTime, setExecutionTime] = useState<number>();
  const [showHintModal, setShowHintModal] = useState(false);
  const [currentHint, setCurrentHint] = useState<{ level: 1 | 2 | 3; content: string; timestamp: number } | null>(null);
  
  const { runPython, isLoading, isRunning } = usePyodide();
  const { 
    analytics, 
    startTracking, 
    logCodeChange, 
    logHintInteraction, 
    logCodeExecution,
    updateHintViewingDuration 
  } = useAnalytics();

  useEffect(() => {
    startTracking();
  }, [startTracking]);

  const handleCodeChange = (code: string, changeType: 'typing' | 'paste' | 'delete') => {
    setCurrentCode(code);
    logCodeChange(code, changeType);
  };

  const handleRunCode = async (code: string) => {
    if (isLoading) {
      setOutput('Python runtime is still loading...');
      return;
    }

    const result = await runPython(code);
    setOutput(result.output);
    setExecutionTime(result.executionTime);
    logCodeExecution(code, result.output, result.executionTime, result.success);
  };

  const handleHintRequest = (level: 1 | 2 | 3) => {
    const hintContent = hints[level];
    const interaction = logHintInteraction(level, hintContent);
    setCurrentHint({ level, content: hintContent, timestamp: interaction.timestamp });
    setShowHintModal(true);
  };

  const handleCloseHint = () => {
    setShowHintModal(false);
  };

  const handleHintViewed = (viewingDuration: number) => {
    if (currentHint) {
      updateHintViewingDuration(currentHint.timestamp, viewingDuration);
    }
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Python Learning IDE</h1>
              <p className="text-gray-600">Complete coding exercises with intelligent analytics</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Python Runtime Ready</span>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                Session: {Math.floor(analytics.totalSessionTime / 1000)}s
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full p-4">
        <div className="flex gap-4 h-[calc(100vh-140px)]">
          {/* Left Panel - 80% */}
          <div className="flex-1 w-4/5 flex flex-col gap-4">
            {/* Top Left - Week Topics */}
            <div className="h-1/2">
              <WeekTopics className="h-full" />
            </div>
            
            {/* Bottom Left - AI Response Panel */}
            <div className="h-1/2">
              <AIResponsePanel className="h-full" />
            </div>
          </div>

          {/* Right Panel - 20% */}
          <div className="w-1/5 flex flex-col gap-4">
            {/* Top Right - Python Editor */}
            <div className="h-2/3">
              <PythonEditor
                initialCode={currentCode}
                onChange={handleCodeChange}
                onRun={handleRunCode}
              />
            </div>
            
            {/* Bottom Right - Terminal Output */}
            <div className="h-1/3">
              <OutputPanel
                output={output}
                isRunning={isRunning}
                executionTime={executionTime}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hint Modal */}
      {currentHint && (
        <HintModal
          isOpen={showHintModal}
          onClose={handleCloseHint}
          hintLevel={currentHint.level}
          hintContent={currentHint.content}
          onHintViewed={handleHintViewed}
        />
      )}
    </div>
  );
};

export default Index;
