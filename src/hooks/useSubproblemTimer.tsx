import { useState, useEffect, useRef } from 'react';
import { TimeTrackingService } from '@/lib/databaseService';

interface UseSubproblemTimerProps {
  userId: string;
  moduleNumber: number;
  runId: string;
  problemIndex: number;
  subproblemIndex: number;
  enabled: boolean; // Only track when enabled
}

export const useSubproblemTimer = ({
  userId,
  moduleNumber,
  runId,
  problemIndex,
  subproblemIndex,
  enabled
}: UseSubproblemTimerProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  // Start new session when subproblem changes or component mounts
  useEffect(() => {
    if (!enabled || !userId || !runId) {
      // If the hook is disabled, ensure any active session is ended.
      if (sessionIdRef.current) {
        TimeTrackingService.endSubproblemTimer(sessionIdRef.current);
        sessionIdRef.current = null;
        setIsTracking(false);
      }
      return;
    }

    const startNewSession = async () => {
      try {
        // End previous session if it exists
        if (sessionIdRef.current) {
          await TimeTrackingService.endSubproblemTimer(sessionIdRef.current);
        }

        // Start new session and get the ID directly
        const newSessionId = await TimeTrackingService.startSubproblemTimer(
          userId,
          moduleNumber,
          runId,
          problemIndex,
          subproblemIndex
        );

        sessionIdRef.current = newSessionId;
        setIsTracking(true);

        console.log(`⏱️ Started tracking subproblem ${problemIndex}.${subproblemIndex}, session: ${newSessionId}`);
      } catch (error) {
        console.error('Error starting subproblem timer:', error);
      }
    };

    startNewSession();

    // Cleanup function to end session on component unmount or dependency change
    return () => {
      if (sessionIdRef.current) {
        TimeTrackingService.endSubproblemTimer(sessionIdRef.current)
          .then(() => {
            console.log(`⏱️ Ended subproblem session on cleanup: ${sessionIdRef.current}`);
          })
          .catch(error => {
            console.error('Error ending subproblem timer on cleanup:', error);
          });
        sessionIdRef.current = null;
        setIsTracking(false);
      }
    };
  }, [userId, runId, moduleNumber, problemIndex, subproblemIndex, enabled]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionIdRef.current) {
        // IMPORTANT: You must create this API route in your project.
        // It should receive the session_id and call TimeTrackingService.endSubproblemTimer.
        const data = JSON.stringify({ session_id: sessionIdRef.current });
        navigator.sendBeacon('/api/track/end-subproblem', data);
        console.log(`⏱️ Beacon sent to end subproblem session: ${sessionIdRef.current}`);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); // This effect should only run once

  return {
    isTracking
  };
};