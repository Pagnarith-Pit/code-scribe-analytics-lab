import { useState, useEffect, useCallback } from 'react';
import { 
  SessionService, 
  WeekContentService, 
  APIService,
  type WeekContent,
  type SessionData,
  type ChatLog // Use ChatLog from the service
} from '@/lib/databaseService';

// The local Message interface is no longer needed and has been removed.

interface ProblemState {
  currentProblemIndex: number;
  currentSubproblemIndex: number;
  isComplete: boolean;
}

const generateId = () => crypto.randomUUID();

export const useProblemFlow = (weekNumber: string) => {
  const [weekContent, setWeekContent] = useState<WeekContent[]>([]);
  const [loading, setLoading] = useState(true);
  // State now uses the ChatLog[] type directly.
  const [chatHistory, setChatHistory] = useState<ChatLog[]>([]);
  const [problemState, setProblemState] = useState<ProblemState>({
    currentProblemIndex: 1,
    currentSubproblemIndex: 1,
    isComplete: false
  });
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const session = await SessionService.initializeSession(parseInt(weekNumber));
        setSessionData(session);

        const content = await WeekContentService.getWeekContent(parseInt(weekNumber));
        setWeekContent(content);

        if (content.length === 0) {
          console.error('No content found for week', weekNumber);
          setLoading(false);
          return;
        }

        setProblemState({
          currentProblemIndex: session.progress.current_problem,
          currentSubproblemIndex: session.progress.current_subproblem,
          isComplete: session.progress.is_complete,
        });

        // No transformation needed. Use the chat history from the session directly.
        setChatHistory(session.chatHistory);

        if (session.chatHistory.length === 0 && !session.progress.is_complete) {
          const currentContent = WeekContentService.getCurrentContent(
            content,
            session.progress.current_problem,
            session.progress.current_subproblem
          );

          if (currentContent) {
            await sendToAI({
              action: 'initialize',
              problem: currentContent.problem_text,
              subproblem: currentContent.subproblem_text,
              chatHistory: [],
            }, session.progress.current_problem, session.progress.current_subproblem, session);
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

  const currentContent = WeekContentService.getCurrentContent(
    weekContent,
    problemState.currentProblemIndex,
    problemState.currentSubproblemIndex
  );

  const handleUserResponse = useCallback(async (userMessage: string) => {
    if (!sessionData) return;

    const timestamp = new Date();
    // Create a full ChatLog object for the user's message.
    const userMsg: ChatLog = {
      id: generateId(),
      user_id: sessionData.userId,
      module_number: parseInt(weekNumber),
      run_id: sessionData.runId,
      problem_index: problemState.currentProblemIndex,
      subproblem_index: problemState.currentSubproblemIndex,
      role: 'user',
      message: userMessage,
      time_sent: timestamp.toISOString(),
    };

    const updatedChatHistory = [...chatHistory, userMsg];
    setChatHistory(updatedChatHistory);

    await SessionService.saveMessage(
      sessionData,
      parseInt(weekNumber),
      problemState.currentProblemIndex,
      problemState.currentSubproblemIndex,
      'user',
      userMessage,
      timestamp.getTime() // Pass timestamp as a number to the service
    );

    if (!currentContent) return;

    const aiResponse = await sendToAI({
      action: 'validate',
      problem: currentContent.problem_text,
      subproblem: currentContent.subproblem_text,
      currentState: problemState,
      chatHistory: updatedChatHistory, // Pass the updated ChatLog[]
    }, problemState.currentProblemIndex, problemState.currentSubproblemIndex, sessionData);

    if (aiResponse.isCorrect) {
      await moveToNextProblem();
    }
  }, [chatHistory, problemState, sessionData, weekNumber, currentContent]);

  const moveToNextProblem = async () => {
    if (!sessionData || weekContent.length === 0) return;

    const maxProblem = WeekContentService.getMaxProblemIndex(weekContent);
    const maxSubproblem = WeekContentService.getMaxSubproblemIndex(weekContent, problemState.currentProblemIndex);

    let nextState = { ...problemState };

    if (problemState.currentSubproblemIndex < maxSubproblem) {
      nextState.currentSubproblemIndex += 1;
    } else if (problemState.currentProblemIndex < maxProblem) {
      nextState.currentProblemIndex += 1;
      nextState.currentSubproblemIndex = 1;
    } else {
      nextState.isComplete = true;
      await SessionService.updateProgress(
        sessionData,
        problemState.currentProblemIndex,
        problemState.currentSubproblemIndex,
        true
      );
      
      const completionTimestamp = new Date();
      // Create a full ChatLog object for the completion message.
      const completionMsg: ChatLog = {
        id: generateId(),
        user_id: sessionData.userId,
        run_id: sessionData.runId,
        module_number: parseInt(weekNumber),
        problem_index: problemState.currentProblemIndex,
        subproblem_index: problemState.currentSubproblemIndex,
        role: 'ai',
        message: 'Well Done! You have completed all problems for this week. Keep up the great work!',
        time_sent: completionTimestamp.toISOString(),
      };
      
      setChatHistory(prev => [...prev, completionMsg]);
      await SessionService.saveMessage(
        sessionData,
        parseInt(weekNumber),
        problemState.currentProblemIndex,
        problemState.currentSubproblemIndex,
        'ai',
        completionMsg.message,
        completionTimestamp.getTime() // Pass timestamp as a number
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
    currentSession: SessionData | null
  ): Promise<{ isCorrect: boolean }> => {
    if (!currentSession) return { isCorrect: false };

    const aiMsgId = generateId();
    // Create a placeholder that conforms to the ChatLog type.
    const placeholderMessage: ChatLog = {
      id: aiMsgId,
      user_id: currentSession.userId,
      module_number: parseInt(weekNumber),
      run_id: currentSession.runId,
      problem_index: problemIndex,
      subproblem_index: subproblemIndex,
      role: 'ai',
      message: '', // Start with empty content
      time_sent: new Date().toISOString(),
    };

    setChatHistory(prev => [...prev, placeholderMessage]);

    try {
      const handleChunk = (chunk: string) => {
        setChatHistory(prev =>
          prev.map(msg =>
            msg.id === aiMsgId
              ? { ...msg, message: msg.message + chunk }
              : msg
          )
        );
      };

      const { isCorrect, fullMessage } = await APIService.sendToAI(payload, handleChunk);

      const finalTimestamp = new Date();
      setChatHistory(prev =>
        prev.map(msg =>
          msg.id === aiMsgId ? { ...msg, time_sent: finalTimestamp.toISOString() } : msg
        )
      );

      await SessionService.saveMessage(
        currentSession,
        parseInt(weekNumber),
        problemIndex,
        subproblemIndex,
        'ai',
        fullMessage,
        finalTimestamp.getTime() // Pass timestamp as a number
      );

      return { isCorrect };
    } catch (error) {
      console.error('Error in AI request:', error);
      return { isCorrect: false };
    }
  };

  const handleRestartModule = useCallback(async () => {
    try {
      setLoading(true);
      const newSession = await SessionService.restartModule(parseInt(weekNumber));
      setSessionData(newSession);

      // Reset to initial state
      setProblemState({
        currentProblemIndex: 1,
        currentSubproblemIndex: 1,
        isComplete: false
      });

      // Clear chat history for fresh start
      setChatHistory([]);

      // Trigger first AI message for the fresh session
      const content = await WeekContentService.getWeekContent(parseInt(weekNumber));
      if (content.length > 0) {
        const firstContent = content.find(c => c.problem_index === 1 && c.subproblem_index === 1);
        if (firstContent) {
          await sendToAI({
            action: 'initialize',
            problem: firstContent.problem_text,
            subproblem: firstContent.subproblem_text,
            chatHistory: [],
          }, 1, 1, newSession);
        }
      }
    } catch (error) {
      console.error('Error restarting module:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [weekNumber]);

  return {
    loading,
    chatHistory,
    problemState,
    handleUserResponse,
    handleRestartModule,
    currentRunId: sessionData?.runId || '',
    currentUserId: sessionData?.userId || '',
    currentProblemText: currentContent?.problem_text || '',
    currentSubProblemText: currentContent?.subproblem_text || '',
    currentSubProblemSolutionText: currentContent?.subproblem_solution|| '', 
  };
};