import { useState, useEffect, useCallback } from 'react';
import { getWeekContent } from '@/lib/weekContent';

interface ProblemState {
  currentProblemIndex: number;
  currentSubproblemIndex: number;
  isComplete: boolean;
}

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: number;
}

export const useProblemFlow = (weekNumber: string) => {
  const [weekContent, setWeekContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [problemState, setProblemState] = useState<ProblemState>({
    currentProblemIndex: 0,
    currentSubproblemIndex: 0,
    isComplete: false,
  });

  // Load week content on mount
  useEffect(() => {
    const loadWeekContent = async () => {
      setLoading(true);
      const content = await getWeekContent(weekNumber);
      const full_problems = content.content.Problems;
      setWeekContent(full_problems);
      
      if (content) {
        // Initialize with first problem/subproblem
        await initializeFirstProblem(full_problems);
      }
      setLoading(false);
    };

    loadWeekContent();
  }, [weekNumber]);

  // Initialize conversation with first problem
  const initializeFirstProblem = async (content) => {
    const firstProblem = content[problemState.currentProblemIndex]['Problem Main Question']
    const firstSubQuestion = content[problemState.currentProblemIndex]['Problem Subquestion'][problemState.currentSubproblemIndex]

    const aiMessage = await sendToAI({
      action: 'initialize',
      problem: firstProblem,
      subproblem: firstSubQuestion
    });

    setMessages([{
      id: generateId(),
      type: 'ai',
      content: aiMessage,
      timestamp: Date.now(),
    }]);
  };

  // Handle user response
  const handleUserResponse = useCallback(async (userMessage: string) => {
    // Save user response (but don't display it)
    setUserResponses(prev => [...prev, userMessage]);

    if (!weekContent) return;

    const currentProblem = weekContent[problemState.currentProblemIndex];

    const currentMainQuestion = currentProblem['Problem Main Question'];
    const currentSubproblem = currentProblem['Problem Subquestion'][problemState.currentSubproblemIndex];
    const currentSubSolution = currentProblem['Problem Solution'][problemState.currentSubproblemIndex]

    // Send to AI for validation
    const aiResponse = await sendToAI({
      action: 'validate',
      userResponse: userMessage,
      problem: currentMainQuestion,
      subproblem: currentSubproblem,
      solution: currentSubSolution,
      currentState: problemState,
    });

    // Add AI response to messages
    setMessages(prev => [...prev, {
      id: generateId(),
      type: 'ai',
      content: aiResponse.message,
      timestamp: Date.now(),
    }]);

    // If validation successful, move to next problem/subproblem
    if (aiResponse.isCorrect) {
      await moveToNextProblem();
    }
  }, [weekContent, problemState]);

  // Move to next problem/subproblem
  const moveToNextProblem = async () => {
    if (!weekContent) return;

    const currentProblem = weekContent[problemState.currentProblemIndex];
    const nextSubproblemIndex = problemState.currentSubproblemIndex + 1;

    let nextState = { ...problemState };

    // Check if there are more subproblems in current problem
    if (currentProblem['Problem Subquestion'] && nextSubproblemIndex < currentProblem['Problem Subquestion'].length) {
      nextState.currentSubproblemIndex = nextSubproblemIndex;
    } else {
      // Move to next problem
      const nextProblemIndex = problemState.currentProblemIndex + 1;
      
      if (nextProblemIndex < weekContent.length) {
        nextState.currentProblemIndex = nextProblemIndex;
        nextState.currentSubproblemIndex = 0;
      } else {
        // All problems completed
        nextState.isComplete = true;
        setMessages(prev => [...prev, {
          id: generateId(),
          type: 'ai',
          content: 'Congratulations! You have completed all problems for this week.',
          timestamp: Date.now(),
        }]);
        setProblemState(nextState);
        return;
      }
    }

    setProblemState(nextState);

    // Get next problem/subproblem and send to AI
    const nextProblem = weekContent[nextState.currentProblemIndex];

    const nextMainQuestion = nextProblem['Problem Main Question'];
    const nextSubproblem = nextProblem['Problem Subquestion'][nextState.currentSubproblemIndex]

    const aiMessage = await sendToAI({
      action: 'next',
      problem: nextMainQuestion,
      subproblem: nextSubproblem,
      currentState: nextState,
    });

    setMessages(prev => [...prev, {
      id: generateId(),
      type: 'ai',
      content: aiMessage,
      timestamp: Date.now(),
    }]);
  };

  // Mock AI service call (replace with actual API call)
  const sendToAI = async (payload: any): Promise<any> => {
    // This would be your actual AI service call
    // For now, returning mock responses
    console.log(payload.userResponse)

    switch (payload.action) {
      case 'initialize':
        return `Let's begin. ${payload.problem}\n\n${payload.subproblem}`;
      
      case 'validate':
        // Mock validation logic
        const isCorrect = payload.userResponse.length > 10; // Simple mock validation
        return {
          isCorrect,
          message: isCorrect 
            ? "Great job! That's correct. Let's move to the next problem."
            : "That's not quite right. Let me give you a hint: " + (payload.subproblem?.hint || "Think about the problem from a different angle.")
        };
      
      case 'next':
        return `Now let's tackle Problem ${payload.problem}:\n\n${payload.subproblem}`;
      
      default:
        return "I'm here to help you learn!";
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  return {
    loading,
    messages,
    userResponses,
    problemState,
    handleUserResponse,
    weekContent,
  };
};