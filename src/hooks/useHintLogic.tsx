import { useState, useCallback, useRef, useEffect } from 'react';
import {
  HintService,
  APIService,
  TimeTrackingService,
  HintUsageLog,
  ChatLog
} from '@/lib/databaseService';

export type HintLevelString = 'initial' | 'more_help' | 'solution';

interface UseHintLogicProps {
  weekNumber: string;
  problemIndex: number;
  subproblemIndex: number;
  userId: string;
  runId: string;
  problemText: string;
  subProblemText: string;
  subProblemSolutionText: string;
  chatHistory: ChatLog[];
  currentUserCode: string;
}

const mapLevelToString = (level: number): HintLevelString => {
  if (level === 1) return 'initial';
  if (level === 2) return 'more_help';
  return 'solution';
};

export const useHintLogic = ({
  weekNumber,
  problemIndex,
  subproblemIndex,
  userId,
  runId,
  problemText,
  subProblemText,
  subProblemSolutionText,
  chatHistory,
  currentUserCode
}: UseHintLogicProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hintContent, setHintContent] = useState('');
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [currentReadSessionId, setCurrentReadSessionId] = useState<string | null>(null);
  const [existingHintUsage, setExistingHintUsage] = useState<HintUsageLog[]>([]);

  // Load existing hint requests when component mounts or identity changes
  useEffect(() => {
    const loadExistingHints = async () => {
      if (!userId || !runId) return;

      try {
        const hintUsage = await HintService.loadHintUsage(
          userId,
          parseInt(weekNumber),
          runId,
          problemIndex,
          subproblemIndex
        );

        console.log("Hint Usage Loaded:", hintUsage);

        setExistingHintUsage(hintUsage);
        const currentLevel = HintService.determineCurrentHintLevel(hintUsage);
        setHintLevel(currentLevel);

        const lastHintContent = HintService.getLastHintContent(hintUsage);
        if (lastHintContent) {
          setHintContent(lastHintContent);
        } else {
          setHintContent(''); // Reset if no prior hints
        }
      } catch (error) {
        console.error('Error loading existing hints:', error);
      }
    };

    loadExistingHints();
  }, [userId, runId, weekNumber, problemIndex, subproblemIndex]);

  const getButtonConfig = () => {
    if (hintLevel === 1) return { text: 'Need More Help?', nextLevel: 2 };
    if (hintLevel === 2) return { text: 'Need The Solution?', nextLevel: 3 };
    return { text: 'Solution Provided', nextLevel: null };
  };

  const handleRequestHint = useCallback(async (level: number) => {
    setIsLoading(true);
    try {
      const levelString = mapLevelToString(level);
      const newHint = await APIService.fetchHintFromAPI(
        levelString,
        weekNumber,
        problemIndex,
        subproblemIndex,
        problemText,
        subProblemText,
        subProblemSolutionText,
        chatHistory,
        currentUserCode
      );

      setHintContent(newHint);

      // Save the fact that this hint was requested
      await HintService.saveHintRequest(
        userId,
        parseInt(weekNumber),
        runId,
        problemIndex,
        subproblemIndex,
        level,
        newHint
      );
      
      // Add to our local cache of used hints
      setExistingHintUsage(prev => [...prev, { hint_level: level, hint_provided: newHint } as HintUsageLog]);

    } catch (error) {
      console.error(error);
      setHintContent('Sorry, an error occurred while fetching your hint.');
    } finally {
      setIsLoading(false);
    }
  }, [weekNumber, problemIndex, subproblemIndex, userId, runId, problemText, subProblemText, chatHistory, currentUserCode]);

  const openPopup = async () => {
    setIsPopupOpen(true);
    // If this is the first time opening and no content exists, fetch initial hint
    if (hintLevel === 1 && !hintContent) {
      await handleRequestHint(1);
    }
    
    // Start a new read session every time popup is opened
    try {
      const sessionId = await TimeTrackingService.startHintReadTimer(
        userId,
        parseInt(weekNumber),
        runId,
        problemIndex,
        subproblemIndex,
        hintLevel
      );
      setCurrentReadSessionId(sessionId);
      console.log(`📖 Started hint read session: ${sessionId}`);
    } catch (error) {
      console.error("Failed to start hint read timer", error);
    }
  };

  const closePopup = async () => {
    setIsPopupOpen(false);
    if (currentReadSessionId) {
      try {
        await TimeTrackingService.endHintReadTimer(currentReadSessionId);
        console.log(`📕 Ended hint read session: ${currentReadSessionId}`);
      } catch (error) {
        console.error("Failed to end hint read timer", error);
      }
      setCurrentReadSessionId(null);
    }
  };

  const handleNextHint = async () => {
    const { nextLevel } = getButtonConfig();
    if (nextLevel) {
      // End the current reading session before fetching the next hint
      if (currentReadSessionId) {
        await TimeTrackingService.endHintReadTimer(currentReadSessionId);
        console.log(`📕 Ended hint read session for next hint: ${currentReadSessionId}`);
        setCurrentReadSessionId(null); // Reset immediately
      }

      setHintLevel(nextLevel);
      await handleRequestHint(nextLevel);

      // After fetching, immediately start a new read session for the new hint
      try {
        const newSessionId = await TimeTrackingService.startHintReadTimer(
          userId,
          parseInt(weekNumber),
          runId,
          problemIndex,
          subproblemIndex,
          nextLevel
        );
        setCurrentReadSessionId(newSessionId);
        console.log(`📖 Started new hint read session: ${newSessionId}`);
      } catch (error) {
        console.error("Failed to start new hint read timer", error);
      }
    }
  };

  return {
    isPopupOpen,
    isLoading,
    hintContent,
    buttonConfig: getButtonConfig(),
    openPopup,
    closePopup,
    handleNextHint,
  };
};