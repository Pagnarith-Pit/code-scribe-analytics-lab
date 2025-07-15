import { useState, useEffect, useCallback } from 'react';
import { 
  SessionService, 
  WeekContentService, 
  ChatService,
  APIService,
  WeekContent,
  SessionData
} from '@/lib/databaseService';

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

const generateId = () => crypto.randomUUID();

export const useProblemFlow = (weekNumber: string) => {
  const [weekContent, setWeekContent] = useState<WeekContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [problemState, setProblemState] = useState<ProblemState>({
    currentProblemIndex: 1, // Start from problem 1
    currentSubproblemIndex: 1, // Start from subproblem 1
    isComplete: false
  });
  
  // Session management
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  // Initialize everything
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        // Initialize session (handles user auth, progress, chat history)
        const session = await SessionService.initializeSession(parseInt(weekNumber));
        setSessionData(session);


        // Load week content
        const content = await WeekContentService.getWeekContent(parseInt(weekNumber));
        setWeekContent(content);


        if (content.length === 0) {
          console.error('No content found for week', weekNumber);
          setLoading(false);
          return;
        }

        // Set current problem state from session
        setProblemState({
          currentProblemIndex: session.progress.current_problem,
          currentSubproblemIndex: session.progress.current_subproblem,
          isComplete: session.progress.is_complete,
        });

        // Load existing chat history
        const messages = ChatService.transformChatLogsToMessages(session.chatHistory);
        setChatHistory(messages);

        // If no existing chats and not complete, send initial message
        if (session.chatHistory.length === 0 && !session.progress.is_complete) {
          
          const currentContent = WeekContentService.getCurrentContent(
            content,
            session.progress.current_problem,
            session.progress.current_subproblem
          );

          console.log('Initializing with content:', currentContent);

          if (currentContent) {
            sendToAI({
              action: 'initialize',
              problem: currentContent.problem_text,
              subproblem: currentContent.subproblem_text,
              chatHistory: [],
            }, session.progress.current_problem, session.progress.current_subproblem, session); // Pass the 'session' object here
          }
        }

      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [weekNumber]);

  const handleUserResponse = useCallback(async (userMessage: string) => {
    if (!sessionData) return;

    const userMsg: Message = {
      id: generateId(),
      type: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    const updatedChatHistory = [...chatHistory, userMsg];
    setChatHistory(updatedChatHistory);

    // Save user message to database
    await SessionService.saveMessage(
      sessionData,
      parseInt(weekNumber),
      problemState.currentProblemIndex,
      problemState.currentSubproblemIndex,
      'user',
      userMessage,
      userMsg.timestamp
    );

    const currentContent = WeekContentService.getCurrentContent(
      weekContent,
      problemState.currentProblemIndex,
      problemState.currentSubproblemIndex
    );

    if (!currentContent) return;

    const aiResponse = await sendToAI({
      action: 'validate',
      problem: currentContent.problem_text,
      subproblem: currentContent.subproblem_text,
      currentState: problemState,
      chatHistory: updatedChatHistory,
    }, problemState.currentProblemIndex, problemState.currentSubproblemIndex, sessionData);

    if (aiResponse.isCorrect) {
      await moveToNextProblem();
    }
  }, [chatHistory, weekContent, problemState, sessionData, weekNumber]);

  const moveToNextProblem = async () => {
    if (!sessionData || weekContent.length === 0) return;

    const maxProblem = WeekContentService.getMaxProblemIndex(weekContent);
    const maxSubproblem = WeekContentService.getMaxSubproblemIndex(weekContent, problemState.currentProblemIndex);

    let nextState = { ...problemState };

    if (problemState.currentSubproblemIndex < maxSubproblem) {
      // Move to next subproblem
      nextState.currentSubproblemIndex = problemState.currentSubproblemIndex + 1;
    } else if (problemState.currentProblemIndex < maxProblem) {
      // Move to next problem
      nextState.currentProblemIndex = problemState.currentProblemIndex + 1;
      nextState.currentSubproblemIndex = 1;
    } else {
      // Module complete
      nextState.isComplete = true;
      await SessionService.updateProgress(
        sessionData,
        problemState.currentProblemIndex,
        problemState.currentSubproblemIndex,
        true
      );
      
      const completionMsg: Message = {
        id: generateId(),
        type: 'ai',
        content: 'Well Done! You have completed all problems for this week. Keep up the great work!',
        timestamp: Date.now(),
      };
      
      setChatHistory(prev => [...prev, completionMsg]);
      await SessionService.saveMessage(
        sessionData,
        parseInt(weekNumber),
        problemState.currentProblemIndex,
        problemState.currentSubproblemIndex,
        'ai',
        completionMsg.content,
        completionMsg.timestamp
      );
      setProblemState(nextState);
      return;
    }

    setProblemState(nextState);
    await SessionService.updateProgress(
      sessionData,
      nextState.currentProblemIndex,
      nextState.currentSubproblemIndex
    );

    const nextContent = WeekContentService.getCurrentContent(
      weekContent,
      nextState.currentProblemIndex,
      nextState.currentSubproblemIndex
    );

    if (nextContent) {
      await sendToAI({
        action: 'next',
        problem: nextContent.problem_text,
        subproblem: nextContent.subproblem_text,
        currentState: nextState,
        chatHistory,
      }, nextState.currentProblemIndex, nextState.currentSubproblemIndex, sessionData);
    }
  };

  const sendToAI = async (
    payload: any, 
    problemIndex: number, 
    subproblemIndex: number,
    currentSession: SessionData | null // Add this parameter
  ): Promise<{ isCorrect: boolean }> => {
    if (!currentSession) return { isCorrect: false }; // Use the parameter here

    const aiMsgId = generateId();
    const placeholderMessage: Message = {
      id: aiMsgId,
      type: 'ai',
      content: '', // Start with empty content
      timestamp: Date.now(),
    };

    setChatHistory(prev => [...prev, placeholderMessage]);

    try {
      // Define the callback to stream content into the message
      const handleChunk = (chunk: string) => {
        setChatHistory(prev =>
          prev.map(msg =>
            msg.id === aiMsgId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      };

      const { isCorrect, fullMessage } = await APIService.sendToAI(payload, handleChunk);

      // Final message is already streamed, now just save it
      const finalTimestamp = Date.now();

      // Update the timestamp of the final message
      setChatHistory(prev =>
        prev.map(msg =>
          msg.id === aiMsgId ? { ...msg, timestamp: finalTimestamp } : msg
        )
      );

      // Save final AI message to database
      await SessionService.saveMessage(
        currentSession, // Use the parameter here as well
        parseInt(weekNumber),
        problemIndex,
        subproblemIndex,
        'ai',
        fullMessage,
        finalTimestamp
      );

      return { isCorrect };
    } catch (error) {
      console.error('Error in AI request:', error);
      
      // The error message is already handled by the onChunk in APIService
      // We can just return here
      return { isCorrect: false };
    }
  };

  return {
    loading,
    chatHistory,
    problemState,
    handleUserResponse,
    weekContent,
    currentRunId: sessionData?.runId || '',
    currentUserId: sessionData?.userId || '',
  };
};