import { useState, useCallback, useRef, useEffect } from 'react';

export type HintLevel = 'initial' | 'more_help' | 'solution';

interface HintAnalytics {
  level: 1 | 2 | 3;
  firstUsedTimestamp: number | null;
  totalVisibleDuration: number; // in milliseconds
}

type AnalyticsData = Partial<Record<HintLevel, HintAnalytics>>;

// This function will call your Flask API for hints.
const fetchHintFromAPI = async (level: HintLevel, weekNumber: string): Promise<string> => {
  console.log(`Fetching hint via API for week ${weekNumber}, level: ${level}`);
  
  // Example of what a real fetch might look like:
  // const response = await fetch('YOUR_FLASK_API_ENDPOINT/get-hint', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ week_number: weekNumber, hint_level: level }),
  // });
  // if (!response.ok) {
  //   throw new Error('Failed to fetch hint');
  // }
  // const data = await response.json();
  // return data.hint;

  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

  switch (level) {
    case 'initial':
      return "API Hint: Break the problem down into smaller, manageable steps.";
    case 'more_help':
      return "API Hint: Consider using a loop to iterate through the data.";
    case 'solution':
      return "API Hint: 1. Initialize a variable. 2. Loop. 3. Calculate. 4. Return result.";
    default:
      return "No hint available.";
  }
};

// This function would send the collected analytics to your database.
const sendAnalyticsToAPI = (analyticsPayload: any) => {
  console.log("📊 Sending Analytics Data:", JSON.stringify(analyticsPayload, null, 2));
  // Example of a real API call:
  // fetch('YOUR_FLASK_API_ENDPOINT/save-hint-analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(analyticsPayload),
  // });
};


interface UseHintLogicProps {
  weekNumber: string;
  problemIndex: number;
  subproblemIndex: number;
}

export const useHintLogic = ({ weekNumber, problemIndex, subproblemIndex }: UseHintLogicProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hintContent, setHintContent] = useState('');
  const [hintLevel, setHintLevel] = useState<HintLevel>('initial');

  // --- Analytics State ---
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const sessionStartTimeRef = useRef<number | null>(null);
  const activeAnalyticsLevelRef = useRef<HintLevel>(hintLevel);

  // Effect to manage the visibility timer
  useEffect(() => {
    if (isPopupOpen) {
      // Start timer when popup opens
      sessionStartTimeRef.current = Date.now();
      activeAnalyticsLevelRef.current = hintLevel;
    } else {
      // Stop timer and update duration when popup closes
      if (sessionStartTimeRef.current) {
        const duration = Date.now() - sessionStartTimeRef.current;
        const levelToUpdate = activeAnalyticsLevelRef.current;
        
        const updatedAnalytics = { ...analyticsData };
        if (updatedAnalytics[levelToUpdate]) {
          updatedAnalytics[levelToUpdate]!.totalVisibleDuration += duration;
        }

        setAnalyticsData(updatedAnalytics);
        sessionStartTimeRef.current = null;
        
        // Send data with the desired structure when user closes the popup
        if (Object.keys(updatedAnalytics).length > 0) {
          const analyticsPayload = {
            Problem: problemIndex,
            subproblem: subproblemIndex,
            hintUsage: updatedAnalytics,
          };
          sendAnalyticsToAPI(analyticsPayload);
        }
      }
    }
  }, [isPopupOpen, hintLevel, analyticsData, problemIndex, subproblemIndex]);


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
      const newHint = await fetchHintFromAPI(level, weekNumber);
      setHintContent(newHint);

      // Initialize analytics for the level if it's the first time
      setAnalyticsData(prev => {
        if (!prev[level]) {
          const levelMap = { initial: 1, more_help: 2, solution: 3 };
          return {
            ...prev,
            [level]: {
              level: levelMap[level],
              firstUsedTimestamp: Date.now(),
              totalVisibleDuration: 0,
            },
          };
        }
        return prev;
      });

    } catch (error) {
      console.error(error);
      setHintContent('Sorry, an error occurred while fetching your hint.');
    } finally {
      setIsLoading(false);
    }
  }, [weekNumber]);

  const openPopup = () => {
    setIsPopupOpen(true);
    if (hintLevel === 'initial' && !hintContent) {
      handleRequestHint('initial');
    }
  };

  const closePopup = () => setIsPopupOpen(false);

  const handleNextHint = () => {
    // Stop timer for the current level before switching
    if (sessionStartTimeRef.current) {
      const duration = Date.now() - sessionStartTimeRef.current;
      setAnalyticsData(prev => ({
        ...prev,
        [hintLevel]: {
          ...prev[hintLevel]!,
          totalVisibleDuration: prev[hintLevel]!.totalVisibleDuration + duration,
        },
      }));
    }

    const { nextLevel } = getButtonConfig();
    if (nextLevel) {
      setHintLevel(nextLevel);
      handleRequestHint(nextLevel);
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