import { useState, useEffect, useCallback, useRef } from 'react';
import { PythonEditor } from '@/components/PythonEditor';
import { OutputPanel } from '@/components/OutputPanel';
import { usePyodide } from '@/hooks/usePyodide';
import { WeekTopics } from '@/components/WeekTopics';
import { ChatDisplay } from '@/components/ChatDisplay';
import { useProblemFlow } from '@/hooks/useProblemFlow';
import { useSubproblemTimer } from '@/hooks/useSubproblemTimer';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { HintSystem } from '@/components/HintSystem';
import { RestartModuleButton } from '@/components/RestartModuleButton';

const Problem = () => {
  const { weekNumber } = useParams();
  const [currentCode, setCurrentCode] = useState(`# Write your Python code here
# For example:
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
`);
  
  const [output, setOutput] = useState('');
  const [executionTime, setExecutionTime] = useState<number>();
  
  // Resizable panel state
  const [leftPanelWidth, setLeftPanelWidth] = useState(70);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // All data comes from the hooks - no direct database calls
  const { runPython, isLoading: pyodideLoading, isRunning } = usePyodide();
  const { 
    loading: problemFlowLoading, 
    chatHistory, 
    problemState, 
    handleUserResponse,
    handleRestartModule,
    currentRunId,
    currentUserId,
    currentProblemText,
    currentSubProblemText,
    currentSubProblemSolutionText
  } = useProblemFlow(weekNumber || '1');

  // Add subproblem time tracking
  const { isTracking } = useSubproblemTimer({
    userId: currentUserId,
    moduleNumber: parseInt(weekNumber || '1'),
    runId: currentRunId,
    problemIndex: problemState.currentProblemIndex,
    subproblemIndex: problemState.currentSubproblemIndex,
    enabled: !problemState.isComplete && !!currentUserId && !!currentRunId
  });

  const handleCodeChange = (code: string) => {
    setCurrentCode(code);
  };

  const handleRunCode = async (code: string) => {
    if (pyodideLoading) {
      setOutput('Python runtime is still loading...');
      return;
    }

    const result = await runPython(code);
    setOutput(result.output);
    setExecutionTime(result.executionTime);
  };

  // Resizable panel handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
    setLeftPanelWidth(constrainedWidth);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Show loading screen while Python runtime initializes
  if (pyodideLoading) {
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

  const rightPanelWidth = 100 - leftPanelWidth;

  return (
    <div className="min-h-screen bg-gray-50">
      <div 
        ref={containerRef}
        className="flex h-screen p-4 gap-4"
        style={{ userSelect: isDragging ? 'none' : 'auto' }}
      >
        {/* Left Side - AI Messages & Chat */}
        <div 
          className="flex flex-col gap-4 min-w-0"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="flex-1 min-h-0">
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link to="/module" className="text-black font-bold py-2 px-4 transition-colors">
                  &larr; Back to Modules
                </Link>
                
                {/* Show tracking indicator */}
                {isTracking && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Time tracking active</span>
                  </div>
                )}

                {/* Restart Module Button - Only shows when module is complete */}
                <RestartModuleButton
                  isComplete={problemState.isComplete}
                  onRestart={handleRestartModule}
                  disabled={problemFlowLoading}
                />
              </div>
              
              {/* Only render HintSystem when we have the required session data */}
              {currentUserId && currentRunId && (
                <HintSystem 
                  key={`${problemState.currentProblemIndex}-${problemState.currentSubproblemIndex}`}
                  weekNumber={weekNumber || '1'} 
                  problemIndex={problemState.currentProblemIndex}
                  subproblemIndex={problemState.currentSubproblemIndex}
                  userId={currentUserId}
                  runId={currentRunId}
                  currentUserCode={currentCode}
                  chatHistory={chatHistory}
                  problemText={currentProblemText}
                  subProblemText={currentSubProblemText}
                  subProblemSolutionText={currentSubProblemSolutionText}
                />
              )}
            </div>

            <WeekTopics 
              weekNumber={weekNumber || '1'}
              messages={chatHistory.filter(msg => msg.role === 'ai')}
              loading={problemFlowLoading}
              problemState={problemState}
            />
          </div>
          
          <div className="h-20">
            <ChatDisplay 
              onSendMessage={handleUserResponse}
              disabled={problemState.isComplete}
            />
          </div>
        </div>

        {/* Resizable Divider */}
        <div
          className={`
            w-2 bg-gray-300 hover:bg-gray-400 cursor-col-resize 
            flex items-center justify-center transition-colors duration-200
            ${isDragging ? 'bg-blue-400' : ''}
          `}
          onMouseDown={handleMouseDown}
        >
          <div className="flex flex-col gap-1">
            <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
            <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
            <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
          </div>
        </div>

        {/* Right Side - Code Editor & Output */}
        <div 
          className="flex flex-col gap-4 min-w-0"
          style={{ width: `${rightPanelWidth}%` }}
        >
          <div className="flex-1 min-h-0 h-3/5">
            <PythonEditor
              initialCode={currentCode}
              onChange={handleCodeChange}
              onRun={handleRunCode}
            />
          </div>
          <div className="h-2/5 min-h-[200px]">
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

export default Problem;