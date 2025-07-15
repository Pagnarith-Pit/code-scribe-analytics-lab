import { useState, useCallback, useRef, useEffect } from 'react';
import { HintService, APIService, HintUsageLog, ChatLog } from '@/lib/databaseService';

export type HintLevel = 'initial' | 'more_help' | 'solution';

interface UseHintLogicProps {
  weekNumber: string;
  problemIndex: number;
  subproblemIndex: number;
  userId: string;
  runId: string;
  problemText: string;
  subProblemText: string;
  subProblemSolutionText: string; // Optional for solution hints
  chatHistory: ChatLog[];
  currentUserCode: string;
}

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
  const [hintLevel, setHintLevel] = useState<HintLevel>('initial');
  
  // Track current hint session
  const [currentHintLogId, setCurrentHintLogId] = useState<string | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  
  // State for existing hint usage in this session
  const [existingHintUsage, setExistingHintUsage] = useState<HintUsageLog[]>([]);

  // Load existing hint usage for this problem/subproblem
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

        setExistingHintUsage(hintUsage);
        
        // Determine current hint level based on existing usage
        const currentLevel = HintService.determineCurrentHintLevel(hintUsage);
        setHintLevel(currentLevel);
        
        // Set the content of the last hint used
        const lastHintContent = HintService.getLastHintContent(hintUsage);
        if (lastHintContent) {
          setHintContent(lastHintContent);
        }
      } catch (error) {
        console.error('Error loading existing hints:', error);
      }
    };

    loadExistingHints();
  }, [userId, runId, weekNumber, problemIndex, subproblemIndex]);

  // Handle popup open/close timing
  useEffect(() => {
    if (isPopupOpen && !sessionStartTimeRef.current) {
      sessionStartTimeRef.current = Date.now();
    } else if (!isPopupOpen && sessionStartTimeRef.current && currentHintLogId) {
      // Update the current hint log with closing time
      const closeTime = new Date();
      const openTime = new Date(sessionStartTimeRef.current);
      
      HintService.updateHintUsage(currentHintLogId, closeTime, openTime)
        .catch(error => console.error('Error updating hint usage:', error));
      
      sessionStartTimeRef.current = null;
      setCurrentHintLogId(null);
    }
  }, [isPopupOpen, currentHintLogId]);

  const getButtonConfig = () => {
    switch (hintLevel) {
      case 'initial':
        return { text: 'Need More Help?', nextLevel: 'more_help' as HintLevel };
      case 'more_help':
        return { text: 'Need The Solution?', nextLevel: 'solution' as HintLevel };
      case 'solution':
        return { text: 'Solution Provided', nextLevel: null };
      default:
        return { text: '', nextLevel: null };
    }
  };

  const handleRequestHint = useCallback(async (level: HintLevel) => {
    setIsLoading(true);
    try {
      const newHint = await APIService.fetchHintFromAPI(
        level, 
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

    } catch (error) {
      console.error(error);
      setHintContent('Sorry, an error occurred while fetching your hint.');
    } finally {
      setIsLoading(false);
    }
  }, [weekNumber, problemIndex, subproblemIndex, userId, runId, problemText, subProblemText, chatHistory, currentUserCode]);

  const openPopup = () => {
    setIsPopupOpen(true);
    
    // If this is the first time opening and no content exists, fetch initial hint
    if (hintLevel === 'initial' && !hintContent) {
      handleRequestHint('initial');
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleNextHint = () => {
    const { nextLevel } = getButtonConfig();
    if (nextLevel) {
      // Close current hint session if active
      if (currentHintLogId && sessionStartTimeRef.current) {
        const closeTime = new Date();
        const openTime = new Date(sessionStartTimeRef.current);
        HintService.updateHintUsage(currentHintLogId, closeTime, openTime)
          .catch(error => console.error('Error updating hint usage:', error));
      }

      // Reset timing for next hint level
      sessionStartTimeRef.current = Date.now();
      setCurrentHintLogId(null);
      
      setHintLevel(nextLevel);
      handleRequestHint(nextLevel);
    }
  };

  // Reset hint state when problem/subproblem changes
  useEffect(() => {
    setHintLevel('initial');
    setHintContent('');
    setCurrentHintLogId(null);
    sessionStartTimeRef.current = null;
    setIsPopupOpen(false);
  }, [problemIndex, subproblemIndex]);

  return {
    isPopupOpen,
    isLoading,
    hintContent,
    buttonConfig: getButtonConfig(),
    openPopup,
    closePopup,
    handleNextHint,
    existingHintUsage, // Expose for analytics if needed
  };
};