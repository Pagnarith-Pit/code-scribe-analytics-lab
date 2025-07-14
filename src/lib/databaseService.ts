import { supabase } from '@/lib/supabase';

// ===== TYPE DEFINITIONS =====
export interface WeekContent {
  id: string;
  module_number: number;
  problem_index: number;
  subproblem_index: number;
  problem_text: string;
  subproblem_text: string;
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
  time_opened: string;
  time_closed?: string;
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
    // First, try to find existing incomplete progress
 
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
      console.log('📚 Resuming existing session:', existingProgress.run_id);
      return existingProgress;
    }


    // Create new session
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

    console.log(newProgress)

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
    // Mark any existing incomplete progress as abandoned (optional)
    await supabase
      .from('studentprogress')
      .update({ updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('module_number', moduleNumber)
      .eq('is_complete', false);

    // Create new session
    return this.initializeOrResumeProgress(userId, moduleNumber);
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
      .order('time_opened', { ascending: true });

    if (error) {
      console.error('Error loading hint usage:', error);
      throw error;
    }

    return data || [];
  }

  static async saveHintUsage(
    userId: string,
    moduleNumber: number,
    runId: string,
    problemIndex: number,
    subproblemIndex: number,
    hintLevel: number,
    hintText: string,
    timeOpened: Date,
    timeClosed?: Date
  ): Promise<string> {
    const durationSeconds = timeClosed 
      ? Math.round((timeClosed.getTime() - timeOpened.getTime()) / 1000) 
      : null;

    const hintLog: Partial<HintUsageLog> = {
      id: crypto.randomUUID(),
      user_id: userId,
      module_number: moduleNumber,
      run_id: runId,
      problem_index: problemIndex,
      subproblem_index: subproblemIndex,
      hint_level: hintLevel,
      hint_provided: hintText,
      time_opened: timeOpened.toISOString(),
      time_closed: timeClosed?.toISOString(),
      duration_seconds: durationSeconds,
    };

    const { data, error } = await supabase
      .from('hintusagelogs')
      .insert([hintLog])
      .select()
      .single();

    if (error) {
      console.error('Error saving hint usage:', error);
      throw error;
    }

    console.log(`💡 Hint usage saved: Level ${hintLevel} for ${durationSeconds}s`);
    return data.id;
  }

  static async updateHintUsage(
    hintLogId: string,
    timeClosed: Date,
    timeOpened: Date
  ): Promise<void> {
    const durationSeconds = Math.round((timeClosed.getTime() - timeOpened.getTime()) / 1000);

    const { error } = await supabase
      .from('hintusagelogs')
      .update({
        time_closed: timeClosed.toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq('id', hintLogId);

    if (error) {
      console.error('Error updating hint usage:', error);
      throw error;
    }

    console.log(`💡 Hint usage updated: ${durationSeconds}s duration`);
  }

  static determineCurrentHintLevel(hintUsage: HintUsageLog[]): 'initial' | 'more_help' | 'solution' {
    if (hintUsage.length === 0) return 'initial';
    
    const maxLevel = Math.max(...hintUsage.map(h => h.hint_level));
    const levelMap: { [key: number]: 'initial' | 'more_help' | 'solution' } = {
      1: 'initial',
      2: 'more_help',
      3: 'solution'
    };
    
    return levelMap[maxLevel] || 'initial';
  }

  static getLastHintContent(hintUsage: HintUsageLog[]): string {
    if (hintUsage.length === 0) return '';
    return hintUsage[hintUsage.length - 1].hint_provided;
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
}

// ===== API SERVICE =====
export class APIService {
  static async fetchHintFromAPI(
    level: 'initial' | 'more_help' | 'solution',
    weekNumber: string,
    problemIndex: number,
    subproblemIndex: number
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
          hint_level: level 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch hint');
      }
      
      const data = await response.json();
      return data.hint;
    } catch (error) {
      console.error('Error fetching hint:', error);
      
      // Fallback hints for development
      await new Promise(resolve => setTimeout(resolve, 800));
      switch (level) {
        case 'initial':
          return "Break the problem down into smaller, manageable steps.";
        case 'more_help':
          return "Consider using a loop to iterate through the data.";
        case 'solution':
          return "1. Initialize a variable. 2. Loop. 3. Calculate. 4. Return result.";
        default:
          return "No hint available.";
      }
    }
  }

  static async sendToAI(payload: any): Promise<{ isCorrect: boolean; fullMessage: string }> {
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
            }
          } catch (e) {
            console.error('Error parsing streamed chunk:', data);
          }
        }
      }

      return { isCorrect: validationResult.isCorrect, fullMessage };
    } catch (error) {
      console.error('Error in AI request:', error);
      return { isCorrect: false, fullMessage: 'Error communicating with AI tutor.' };
    }
  }
}