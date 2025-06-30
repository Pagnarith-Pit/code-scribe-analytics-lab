
import { useEffect, useRef } from 'react';

interface OutputPanelProps {
  output: string;
  isRunning: boolean;
  executionTime?: number;
}

export const OutputPanel = ({ output, isRunning, executionTime }: OutputPanelProps) => {
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm">Output</span>
          {isRunning && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">Running...</span>
            </div>
          )}
        </div>
        {executionTime && (
          <span className="text-gray-400 text-xs">
            Executed in {executionTime}ms
          </span>
        )}
      </div>
      <div 
        ref={outputRef}
        className="flex-1 p-4 font-mono text-sm text-gray-200 overflow-y-auto whitespace-pre-wrap bg-gray-900"
      >
        {output || 'Run your code to see output here...'}
      </div>
    </div>
  );
};
