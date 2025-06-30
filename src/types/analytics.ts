
export interface CodeChange {
  timestamp: number;
  code: string;
  changeType: 'typing' | 'paste' | 'delete';
}

export interface HintInteraction {
  timestamp: number;
  hintLevel: 1 | 2 | 3;
  timeBeforeRequest: number;
  viewingDuration?: number;
  hintContent: string;
}

export interface CodeExecution {
  timestamp: number;
  code: string;
  output: string;
  executionTime: number;
  success: boolean;
}

export interface AnalyticsData {
  sessionStartTime: number;
  exerciseStartTime: number;
  totalSessionTime: number;
  totalExerciseTime: number;
  codeChanges: CodeChange[];
  hintInteractions: HintInteraction[];
  codeExecutions: CodeExecution[];
  currentHintLevel: number;
  hintsUsed: number[];
}
