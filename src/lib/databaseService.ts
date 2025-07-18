import { supabase } from '@/lib/supabase';
import { sub } from 'date-fns';

// ===== TYPE DEFINITIONS =====
export interface WeekContent {
  id: string;
  module_number: number;
  problem_index: number;
  subproblem_index: number;
  problem_text: string;
  subproblem_text: string;
  subproblem_solution: string;
}

export interface StudentProgress {
  id: string;
  user_id: string;
  module_number: number;
  run_id: string;
  current_problem: number;
  current_subproblem: number;
  is_complete: boolean;
  started_at: string;
  updated_at: string;
}

export interface ChatLog {
  id: string;
  user_id: string;
  module_number: number;
  run_id: string;
  problem_index: number;
  subproblem_index: number;
  role: 'user' | 'ai';
  message: string;
  time_sent: string;
}

export interface HintUsageLog {
  id: string;
  user_id: string;
  module_number: number;
  run_id: string;
  problem_index: number;
  subproblem_index: number;
  hint_level: number;
  hint_provided: string;
}

export interface SubproblemTimeLog {
  id: string;
  user_id: string;
  module_number: number;
  run_id: string;
  problem_index: number;
  subproblem_index: number;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
}

export interface HintReadLog {
  id: string;
  user_id: string;
  module_number: number;
  run_id: string;
  problem_index: number;
  subproblem_index: number;
  hint_level: number;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
}

export interface SessionData {
  userId: string;
  runId: string;
  progressId: string;
  progress: StudentProgress;
  chatHistory: ChatLog[];
}

// ===== AUTHENTICATION =====
export class AuthService {
  static async getCurrentUser(): Promise<string> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user.id;
  }
}

// ===== WEEK CONTENT SERVICE =====
export class WeekContentService {
  static async getWeekContent(moduleNumber: number): Promise<WeekContent[]> {
    const { data, error } = await supabase
      .from('weekcontent')
      .select('*')
      .eq('module_number', moduleNumber)
      .order('problem_index', { ascending: true })
      .order('subproblem_index', { ascending: true });

    if (error) {
      console.error('Error fetching week content:', error);
      throw error;
    }

    return data || [];
  }

  static getCurrentContent(
    weekContent: WeekContent[], 
    problemIndex: number, 
    subproblemIndex: number
  ): WeekContent | undefined {
    return weekContent.find(
      content => 
        content.problem_index === problemIndex && 
        content.subproblem_index === subproblemIndex
    );
  }

  static getMaxProblemIndex(weekContent: WeekContent[]): number {
    return Math.max(...weekContent.map(c => c.problem_index));
  }

  static getMaxSubproblemIndex(weekContent: WeekContent[], problemIndex: number): number {
    const problemContent = weekContent.filter(c => c.problem_index === problemIndex);
    return Math.max(...problemContent.map(c => c.subproblem_index));
  }
}

// ===== STUDENT PROGRESS SERVICE =====
export class StudentProgressService {
  static async initializeOrResumeProgress(
    userId: string, 
    moduleNumber: number
  ): Promise<StudentProgress> {
    // 1. First, try to find existing incomplete progress
    const { data: existingProgress, error: progressError } = await supabase
      .from('studentprogress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_number', moduleNumber)
      .eq('is_complete', false)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (existingProgress && !progressError) {
      console.log('📚 Resuming existing incomplete session:', existingProgress.run_id);
      return existingProgress;
    }

    // 2. If no incomplete progress, check for completed progress to resume
    const { data: completedProgress, error: completedError } = await supabase
      .from('studentprogress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_number', moduleNumber)
      .eq('is_complete', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (completedProgress && !completedError) {
      console.log('📚 Loading completed module for review:', completedProgress.run_id);
      return completedProgress;
    }

    // 3. No existing progress found - create new session
    const newRunId = crypto.randomUUID();
    const newProgress: Partial<StudentProgress> = {
      id: crypto.randomUUID(),
      user_id: userId,
      module_number: moduleNumber,
      run_id: newRunId,
      current_problem: 1,
      current_subproblem: 1,
      is_complete: false,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Creating new progress:', newProgress);

    const { data, error } = await supabase
      .from('studentprogress')
      .insert([newProgress])
      .select()
      .single();

    if (error) {
      console.error('Error creating student progress:', error);
      throw error;
    }

    console.log('🆕 Created new session:', newRunId);
    return data;
  }

  static async updateProgress(
    progressId: string,
    problemIndex: number,
    subproblemIndex: number,
    isComplete: boolean = false
  ): Promise<void> {
    const { error } = await supabase
      .from('studentprogress')
      .update({
        current_problem: problemIndex,
        current_subproblem: subproblemIndex,
        is_complete: isComplete,
        updated_at: new Date().toISOString(),
      })
      .eq('id', progressId);

    if (error) {
      console.error('Error updating progress:', error);
      throw error;
    }

    console.log(`📊 Progress updated: Problem ${problemIndex}.${subproblemIndex}`);
  }

  static async resetModuleProgress(
    userId: string,
    moduleNumber: number
  ): Promise<StudentProgress> {
    console.log(`🔄 Resetting module ${moduleNumber} for user ${userId}`);
    
    // Create new session (this will not interfere with existing complete/incomplete sessions)
    const newRunId = crypto.randomUUID();
    const newProgress: Partial<StudentProgress> = {
      id: crypto.randomUUID(),
      user_id: userId,
      module_number: moduleNumber,
      run_id: newRunId,
      current_problem: 1,
      current_subproblem: 1,
      is_complete: false,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('studentprogress')
      .insert([newProgress])
      .select()
      .single();

    if (error) {
      console.error('Error resetting module progress:', error);
      throw error;
    }

    console.log('🆕 Created fresh session for reset:', newRunId);
    return data;
  }
}

// ===== CHAT SERVICE =====
export class ChatService {
  static async loadChatHistory(
    userId: string,
    moduleNumber: number,
    runId: string
  ): Promise<ChatLog[]> {
    const { data, error } = await supabase
      .from('chatlogs')
      .select('*')
      .eq('user_id', userId)
      .eq('module_number', moduleNumber)
      .eq('run_id', runId)
      .order('time_sent', { ascending: true });

    if (error) {
      console.error('Error loading chat history:', error);
      throw error;
    }

    return data || [];
  }

  static async saveChatMessage(
    userId: string,
    moduleNumber: number,
    runId: string,
    problemIndex: number,
    subproblemIndex: number,
    role: 'user' | 'ai',
    message: string,
    timestamp?: number
  ): Promise<void> {
    const chatLog: Partial<ChatLog> = {
      id: crypto.randomUUID(),
      user_id: userId,
      module_number: moduleNumber,
      run_id: runId,
      problem_index: problemIndex,
      subproblem_index: subproblemIndex,
      role,
      message,
      time_sent: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
    };

    const { error } = await supabase
      .from('chatlogs')
      .insert([chatLog]);

    if (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  static transformChatLogsToMessages(chatLogs: ChatLog[]) {
    return chatLogs.map(log => ({
      id: log.id,
      type: log.role as 'ai' | 'user',
      content: log.message,
      timestamp: new Date(log.time_sent).getTime(),
    }));
  }
}

// ===== HINT SERVICE =====
export class HintService {
  static async loadHintUsage(
    userId: string,
    moduleNumber: number,
    runId: string,
    problemIndex: number,
    subproblemIndex: number
  ): Promise<HintUsageLog[]> {
    
    const { data, error } = await supabase
      .from('hintusagelogs')
      .select('*')
      .eq('user_id', userId)
      .eq('module_number', moduleNumber)
      .eq('run_id', runId)
      .eq('problem_index', problemIndex)
      .eq('subproblem_index', subproblemIndex)

    if (error) {
      console.error('Error loading hint usage:', error);
      throw error;
    }

    console.log(`Loaded data:`, data);

    return data || [];
  }

  static async saveHintRequest(
    userId: string,
    moduleNumber: number,
    runId: string,
    problemIndex: number,
    subproblemIndex: number,
    hintLevel: number,
    hintText: string
  ): Promise<void> {
    const hintLog: Partial<HintUsageLog> = {
      user_id: userId,
      module_number: moduleNumber,
      run_id: runId,
      problem_index: problemIndex,
      subproblem_index: subproblemIndex,
      hint_level: hintLevel,
      hint_provided: hintText
    };

    const { error } = await supabase.from('hintusagelogs').insert([hintLog]);

    if (error) {
      console.error('Error saving hint request:', error);
      throw error;
    }

    console.log(`💡 Hint request saved: Level ${hintLevel}`);
  }

  static determineCurrentHintLevel(hintUsage: HintUsageLog[]): number {
    console.log(`Determining current hint level from usage logs:`, hintUsage);
    if (hintUsage.length === 0) return 1; // Start with level 1
    return Math.max(...hintUsage.map(h => h.hint_level));
  }

  static getLastHintContent(hintUsage: HintUsageLog[]): string {
    if (hintUsage.length === 0) return '';
    // Sort by hint_level to get the latest hint
    const sortedHints = [...hintUsage].sort((a, b) => b.hint_level - a.hint_level);
    return sortedHints[0].hint_provided;
  }
}

// ===== TIME TRACKING SERVICE =====
export class TimeTrackingService {
  // Subproblem time tracking
  static async startSubproblemTimer(
    userId: string,
    moduleNumber: number,
    runId: string,
    problemIndex: number,
    subproblemIndex: number
  ): Promise<string> {
    const { data, error } = await supabase
      .from('subproblem_time_logs')
      .insert({
        user_id: userId,
        module_number: moduleNumber,
        run_id: runId,
        problem_index: problemIndex,
        subproblem_index: subproblemIndex,
        start_time: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error starting subproblem timer:', error);
      throw error;
    }
    return data.id;
  }

  static async endSubproblemTimer(sessionId: string): Promise<void> {
    const { data: log, error: fetchError } = await supabase
      .from('subproblem_time_logs')
      .select('start_time')
      .eq('id', sessionId)
      .single();

    if (fetchError || !log) {
      console.error('Error fetching subproblem session for ending:', fetchError);
      throw new Error('Subproblem session not found.');
    }

    const startTime = new Date(log.start_time.endsWith('Z') ? log.start_time : log.start_time + 'Z');
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    const { error: updateError } = await supabase
      .from('subproblem_time_logs')
      .update({
        end_time: endTime.toISOString(),
        duration_seconds: duration
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error ending subproblem timer:', updateError);
      throw updateError;
    }
  }

  // Hint read time tracking
  static async startHintReadTimer(
    userId: string,
    moduleNumber: number,
    runId: string,
    problemIndex: number,
    subproblemIndex: number,
    hintLevel: number
  ): Promise<string> {
    const { data, error } = await supabase
      .from('hint_read_logs')
      .insert({
        user_id: userId,
        module_number: moduleNumber,
        run_id: runId,
        problem_index: problemIndex,
        subproblem_index: subproblemIndex,
        hint_level: hintLevel,
        start_time: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error starting hint read timer:', error);
      throw error;
    }
    return data.id;
  }

  static async endHintReadTimer(sessionId: string): Promise<void> {
    const { data: log, error: fetchError } = await supabase
      .from('hint_read_logs')
      .select('start_time')
      .eq('id', sessionId)
      .single();

    if (fetchError || !log) {
      console.error('Error fetching hint read session for ending:', fetchError);
      throw new Error('Hint read session not found.');
    }

    const startTime = new Date(log.start_time.endsWith('Z') ? log.start_time : log.start_time + 'Z');
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    const { error: updateError } = await supabase
      .from('hint_read_logs')
      .update({
        end_time: endTime.toISOString(),
        duration_seconds: duration
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error ending hint read timer:', updateError);
      throw updateError;
    }
  }
}


// ===== ANALYTICS SERVICE =====
export class AnalyticsService {
  static async getUserAnalytics(userId: string, moduleNumber?: number) {
    let query = supabase
      .from('studentprogress')
      .select(`
        *,
        chatlogs(*),
        hintusagelogs(*)
      `)
      .eq('user_id', userId);

    if (moduleNumber) {
      query = query.eq('module_number', moduleNumber);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }

    return data;
  }

  static async getModuleAnalytics(moduleNumber: number) {
    const { data, error } = await supabase
      .from('studentprogress')
      .select(`
        *,
        chatlogs(*),
        hintusagelogs(*)
      `)
      .eq('module_number', moduleNumber);

    if (error) {
      console.error('Error fetching module analytics:', error);
      throw error;
    }

    return data;
  }
}

// ===== MAIN SESSION SERVICE =====
export class SessionService {
  static async initializeSession(moduleNumber: number): Promise<SessionData> {
    try {
      // Get current user
      const userId = await AuthService.getCurrentUser();

      // Initialize or resume progress
      const progress = await StudentProgressService.initializeOrResumeProgress(userId, moduleNumber);

      // Load existing chat history
      const chatLogs = await ChatService.loadChatHistory(userId, moduleNumber, progress.run_id);

      return {
        userId,
        runId: progress.run_id,
        progressId: progress.id,
        progress,
        chatHistory: chatLogs,
      };
    } catch (error) {
      console.error('Error initializing session:', error);
      throw error;
    }
  }

  static async saveMessage(
    sessionData: SessionData,
    moduleNumber: number,
    problemIndex: number,
    subproblemIndex: number,
    role: 'user' | 'ai',
    message: string,
    timestamp?: number
  ): Promise<void> {
    await ChatService.saveChatMessage(
      sessionData.userId,
      moduleNumber,
      sessionData.runId,
      problemIndex,
      subproblemIndex,
      role,
      message,
      timestamp
    );
  }

  static async updateProgress(
    sessionData: SessionData,
    problemIndex: number,
    subproblemIndex: number,
    isComplete: boolean = false
  ): Promise<void> {
    await StudentProgressService.updateProgress(
      sessionData.progressId,
      problemIndex,
      subproblemIndex,
      isComplete
    );
  }

  static async restartModule(moduleNumber: number): Promise<SessionData> {
    try {
      // Get current user
      const userId = await AuthService.getCurrentUser();

      // Reset module progress (creates new incomplete session)
      const progress = await StudentProgressService.resetModuleProgress(userId, moduleNumber);

      // No existing chat history for a fresh restart
      const chatLogs: ChatLog[] = [];

      return {
        userId,
        runId: progress.run_id,
        progressId: progress.id,
        progress,
        chatHistory: chatLogs,
      };
    } catch (error) {
      console.error('Error restarting module:', error);
      throw error;
    }
  }
}

// ===== API SERVICE =====
export class APIService {
  static async fetchHintFromAPI(
    level: 'initial' | 'more_help' | 'solution',
    weekNumber: string,
    problemIndex: number,
    subproblemIndex: number,
    problemText: string,
    subProblemText: string,
    subProblemSolutionText: string,
    chatHistory: ChatLog[],
    currentUserCode: string

  ): Promise<string> {
    console.log(`Fetching hint via API for week ${weekNumber}, problem ${problemIndex}.${subproblemIndex}, level: ${level}`);
    
    try {
      const response = await fetch('http://localhost:5001/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          week_number: weekNumber, 
          problem_index: problemIndex,
          subproblem_index: subproblemIndex,
          subproblem_solution: subProblemSolutionText,
          hint_level: level,
          problem_text: problemText,
          sub_problem_text: subProblemText,
          chat_history: chatHistory,
          user_code: currentUserCode
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch hint');
      }
      
      // Correctly parse the JSON body before accessing its properties
      const data = await response.json();
      // console.log here shows that data is properly retrieved
      return data.hint;

    } catch (error) {
      console.error('Error fetching hint:', error);
      // Return a default error message
      return 'Sorry, there was an error fetching your hint.';
    }
  }

  static async sendToAI(
    payload: any,
    onChunk: (chunk: string) => void
  ): Promise<{ isCorrect: boolean; fullMessage: string }> {
    try {
      const response = await fetch('http://localhost:5001/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

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
              onChunk(parsed.chunk);
            }
          } catch (e) {
            console.error('Error parsing streamed chunk:', data);
          }
        }
      }

      return { isCorrect: validationResult.isCorrect, fullMessage };
    } catch (error) {
      console.error('Error in AI request:', error);
      onChunk('Sorry, there was an error communicating with the AI tutor.');
      return { isCorrect: false, fullMessage: 'Error communicating with AI tutor.' };
    }
  }
}