import { supabase } from '@/lib/supabase'

const cache = new Map<string, { data: any; timestamp: number }>();
const TTL = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

const getWeekContent = async (weekNumber: string) => {
  // 1. Check if a valid entry exists in the cache
  const cachedItem = cache.get(weekNumber);
  if (cachedItem) {
    const isCacheValid = (Date.now() - cachedItem.timestamp) < TTL;
    if (isCacheValid) {
      console.log(`Returning cached content for week ${weekNumber}`);
      return cachedItem.data;
    }
  }

  // 2. If not in cache or expired, fetch from the database
  try {
    console.log(`Fetching fresh content for week ${weekNumber} from database.`);
    const { data, error } = await supabase
      .from('COMP90059WeeklyContent')
      .select('*')
      .eq('week', weekNumber)
      .single();

    if (error) throw error;

    // 3. Store the new data and timestamp in the cache
    if (data) {
      cache.set(weekNumber, { data, timestamp: Date.now() });
    }
    
    return data;

  } catch (error) {
    console.error('Error fetching week content:', error);
    return null;
  }
};

export { getWeekContent };