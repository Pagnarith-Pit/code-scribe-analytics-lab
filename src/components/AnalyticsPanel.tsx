
import { AnalyticsData } from '@/types/analytics';

interface AnalyticsPanelProps {
  analytics: AnalyticsData;
}

export const AnalyticsPanel = ({ analytics }: AnalyticsPanelProps) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getSuccessRate = () => {
    if (analytics.codeExecutions.length === 0) return 0;
    const successful = analytics.codeExecutions.filter(exec => exec.success).length;
    return Math.round((successful / analytics.codeExecutions.length) * 100);
  };

  const getAverageExecutionTime = () => {
    if (analytics.codeExecutions.length === 0) return 0;
    const totalTime = analytics.codeExecutions.reduce((sum, exec) => sum + exec.executionTime, 0);
    return Math.round(totalTime / analytics.codeExecutions.length);
  };

  return (
    <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Analytics Dashboard</h3>
      </div>
      
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Time Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Session Time</div>
            <div className="text-xl font-bold text-blue-800">
              {formatTime(analytics.totalSessionTime)}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Exercise Time</div>
            <div className="text-xl font-bold text-green-800">
              {formatTime(analytics.totalExerciseTime)}
            </div>
          </div>
        </div>

        {/* Code Activity */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">Code Activity</h4>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-gray-600">Changes</div>
              <div className="font-bold text-lg">{analytics.codeChanges.length}</div>
            </div>
            <div>
              <div className="text-gray-600">Executions</div>
              <div className="font-bold text-lg">{analytics.codeExecutions.length}</div>
            </div>
            <div>
              <div className="text-gray-600">Success Rate</div>
              <div className="font-bold text-lg">{getSuccessRate()}%</div>
            </div>
          </div>
        </div>

        {/* Hint Usage */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-3">Hint Usage</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-purple-600">Total Hints Used</span>
              <span className="font-bold">{analytics.hintInteractions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-purple-600">Highest Level</span>
              <span className="font-bold">
                {analytics.currentHintLevel === 0 ? 'None' : `Level ${analytics.currentHintLevel}`}
              </span>
            </div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3].map(level => (
                <div
                  key={level}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    analytics.hintsUsed.includes(level)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-medium text-orange-800 mb-3">Performance</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-orange-600">Avg Execution Time</span>
              <span className="font-bold">{getAverageExecutionTime()}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600">Code Changes/Minute</span>
              <span className="font-bold">
                {analytics.totalExerciseTime > 0 
                  ? Math.round((analytics.codeChanges.length / (analytics.totalExerciseTime / 60000)) * 10) / 10
                  : 0
                }
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">Recent Activity</h4>
          <div className="space-y-2 text-xs">
            {analytics.hintInteractions.slice(-3).reverse().map((hint, idx) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <span className="text-purple-600">Hint Level {hint.hintLevel}</span>
                <span className="text-gray-500">
                  {new Date(hint.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {analytics.codeExecutions.slice(-3).reverse().map((exec, idx) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <span className={exec.success ? 'text-green-600' : 'text-red-600'}>
                  Code {exec.success ? 'Success' : 'Error'}
                </span>
                <span className="text-gray-500">
                  {new Date(exec.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
