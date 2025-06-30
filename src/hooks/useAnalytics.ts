
import { useState, useRef, useCallback } from 'react';
import { AnalyticsData, CodeChange, HintInteraction, CodeExecution } from '@/types/analytics';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    sessionStartTime: Date.now(),
    exerciseStartTime: Date.now(),
    totalSessionTime: 0,
    totalExerciseTime: 0,
    codeChanges: [],
    hintInteractions: [],
    codeExecutions: [],
    currentHintLevel: 0,
    hintsUsed: []
  });

  const sessionInterval = useRef<NodeJS.Timeout>();
  const exerciseInterval = useRef<NodeJS.Timeout>();

  const startTracking = useCallback(() => {
    const startTime = Date.now();
    setAnalytics(prev => ({
      ...prev,
      sessionStartTime: startTime,
      exerciseStartTime: startTime
    }));

    sessionInterval.current = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        totalSessionTime: Date.now() - prev.sessionStartTime,
        totalExerciseTime: Date.now() - prev.exerciseStartTime
      }));
    }, 1000);
  }, []);

  const logCodeChange = useCallback((code: string, changeType: 'typing' | 'paste' | 'delete') => {
    const change: CodeChange = {
      timestamp: Date.now(),
      code,
      changeType
    };

    setAnalytics(prev => ({
      ...prev,
      codeChanges: [...prev.codeChanges, change]
    }));
  }, []);

  const logHintInteraction = useCallback((hintLevel: 1 | 2 | 3, hintContent: string) => {
    const timeBeforeRequest = Date.now() - analytics.exerciseStartTime;
    
    const interaction: HintInteraction = {
      timestamp: Date.now(),
      hintLevel,
      timeBeforeRequest,
      hintContent
    };

    setAnalytics(prev => ({
      ...prev,
      hintInteractions: [...prev.hintInteractions, interaction],
      currentHintLevel: Math.max(prev.currentHintLevel, hintLevel),
      hintsUsed: [...new Set([...prev.hintsUsed, hintLevel])]
    }));

    return interaction;
  }, [analytics.exerciseStartTime]);

  const logCodeExecution = useCallback((code: string, output: string, executionTime: number, success: boolean) => {
    const execution: CodeExecution = {
      timestamp: Date.now(),
      code,
      output,
      executionTime,
      success
    };

    setAnalytics(prev => ({
      ...prev,
      codeExecutions: [...prev.codeExecutions, execution]
    }));
  }, []);

  const updateHintViewingDuration = useCallback((hintTimestamp: number, duration: number) => {
    setAnalytics(prev => ({
      ...prev,
      hintInteractions: prev.hintInteractions.map(interaction =>
        interaction.timestamp === hintTimestamp
          ? { ...interaction, viewingDuration: duration }
          : interaction
      )
    }));
  }, []);

  return {
    analytics,
    startTracking,
    logCodeChange,
    logHintInteraction,
    logCodeExecution,
    updateHintViewingDuration
  };
};
