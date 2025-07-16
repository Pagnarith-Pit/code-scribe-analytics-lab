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
  const sentBeaconRef = useRef(false);

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

  // Handle page visibility change (e.g., tab switching, browser closing)
  useEffect(() => {
    const handlePageHideOrVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionIdRef.current) {
        // Get the backend URL from your Vite environment variables (.env file)
        // Example: VITE_PYTHON_BACKEND_URL=http://localhost:5001
        sentBeaconRef.current = true;
        const backendUrl = import.meta.env.VITE_PYTHON_BACKEND_URL;

        if (!backendUrl) {
          console.error('Backend URL is not configured.');
          return;
        }

        const endpoint = `${backendUrl}/api/track/end-subproblem`;
        const data = JSON.stringify({ session_id: sessionIdRef.current });

        console.log(`Sending beacon due to visibility change to ${endpoint} with data:`, data);
        // Use a Blob to set the correct Content-Type for the beacon request
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
      }
    };

        // Add both listeners
        document.addEventListener('visibilitychange', handlePageHideOrVisibilityChange);
        window.addEventListener('pagehide', handlePageHideOrVisibilityChange);

        // Cleanup both on unmount
        return () => {
          document.removeEventListener('visibilitychange', handlePageHideOrVisibilityChange);
          window.removeEventListener('pagehide', handlePageHideOrVisibilityChange);}
        }, []); // This effect should only run once

  return {
    isTracking
  };
};