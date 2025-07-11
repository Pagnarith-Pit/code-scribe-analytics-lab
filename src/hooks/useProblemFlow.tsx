import { useState, useEffect, useCallback } from 'react';
import { getWeekContent } from '@/lib/weekContent';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: number;
}

interface ProblemState {
  currentProblemIndex: number;
  currentSubproblemIndex: number;
  isComplete: boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useProblemFlow = (weekNumber: string) => {
  const [weekContent, setWeekContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [problemState, setProblemState] = useState<ProblemState>({
    currentProblemIndex: 0,
    currentSubproblemIndex: 0,
    isComplete: false,
  });

  // Load week content and initialize first problem
  useEffect(() => {
    const loadWeekContent = async () => {
      setLoading(true);
      const content = await getWeekContent(weekNumber);
      const fullProblems = content.content.Problems;
      setWeekContent(fullProblems);
      setLoading(false);

      if (fullProblems?.length) {
        const firstProblem = fullProblems[0]['Problem Main Question'];
        const firstSubQuestion = fullProblems[0]['Problem Subquestion'][0];

        // The initial chat history is empty.
        await sendToAI({
          action: 'initialize',
          problem: firstProblem,
          subproblem: firstSubQuestion,
          chatHistory: [],
        });
      }
    };

    loadWeekContent();
  }, [weekNumber]);

  const handleUserResponse = useCallback(async (userMessage: string) => {
    const userMsg: Message = {
      id: generateId(),
      type: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    const updatedChatHistory = [...chatHistory, userMsg];
    setChatHistory(updatedChatHistory);

    if (!weekContent) return;

    const currentProblem = weekContent[problemState.currentProblemIndex];
    const currentMainQuestion = currentProblem['Problem Main Question'];
    const currentSubproblem = currentProblem['Problem Subquestion'][problemState.currentSubproblemIndex];
    const currentSubSolution = currentProblem['Problem Solution'][problemState.currentSubproblemIndex];

    const aiResponse = await sendToAI({
      action: 'validate',
      problem: currentMainQuestion,
      subproblem: currentSubproblem,
      solution: currentSubSolution,
      currentState: problemState,
      chatHistory: updatedChatHistory,
    });

    if (aiResponse.isCorrect) {
      await moveToNextProblem();
    }
  }, [chatHistory, weekContent, problemState]);

  const moveToNextProblem = async () => {
    if (!weekContent) return;

    const currentProblem = weekContent[problemState.currentProblemIndex];
    const nextSubIndex = problemState.currentSubproblemIndex + 1;
    let nextState = { ...problemState };

    if (nextSubIndex < currentProblem['Problem Subquestion'].length) {
      nextState.currentSubproblemIndex = nextSubIndex;
    } else {
      const nextProblemIndex = problemState.currentProblemIndex + 1;
      if (nextProblemIndex < weekContent.length) {
        nextState = {
          currentProblemIndex: nextProblemIndex,
          currentSubproblemIndex: 0,
          isComplete: false,
        };
      } else {
        nextState.isComplete = true;
        setChatHistory(prev => [
          ...prev,
          {
            id: generateId(),
            type: 'ai',
            content: '🎉 You completed all problems for this week!',
            timestamp: Date.now(),
          },
        ]);
        setProblemState(nextState);
        return;
      }
    }

    setProblemState(nextState);

    const nextProblem = weekContent[nextState.currentProblemIndex];
    const nextMainQuestion = nextProblem['Problem Main Question'];
    const nextSubproblem = nextProblem['Problem Subquestion'][nextState.currentSubproblemIndex];

    await sendToAI({
      action: 'next',
      problem: nextMainQuestion,
      subproblem: nextSubproblem,
      currentState: nextState,
      chatHistory, // Pass the current chat history
    });
  };

  const sendToAI = async (payload: any): Promise<any> => {
    const aiMsgId = generateId();
    const placeholderMessage: Message = {
      id: aiMsgId,
      type: 'ai',
      content: '...',
      timestamp: Date.now(),
    };

    // Use a function for setChatHistory to get the latest state
    setChatHistory(prev => [...prev, placeholderMessage]);

    console.log(chatHistory)
    const response = await fetch('http://localhost:5001/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.body) return {};

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let validationResult = { isCorrect: false };
    let fullMessage = '';
    let firstChunk = true;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n\n').filter(line => line.trim());

      for (const line of lines) {
        const data = line.replace(/^data: /, '');
        try {
          const parsed = JSON.parse(data);

          if (payload.action === 'validate' && firstChunk) {
            validationResult.isCorrect = parsed.isCorrect;
            firstChunk = false;
            if (!parsed.chunk) continue;
          }

          if (parsed.chunk) {
            fullMessage += parsed.chunk;

            setChatHistory(prev =>
              prev.map(msg =>
                msg.id === aiMsgId
                  ? { ...msg, content: fullMessage }
                  : msg
              )
            );
          }
        } catch (e) {
          console.error('Error parsing streamed chunk:', data);
        }
      }
    }

    return validationResult;
  };

  return {
    loading,
    chatHistory,
    problemState,
    handleUserResponse,
    weekContent,
  };
};
