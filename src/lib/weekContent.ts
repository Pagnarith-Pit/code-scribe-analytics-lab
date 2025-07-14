import { WeekContentService } from '@/lib/databaseService';

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

  // 2. If not in cache or expired, fetch from the database using the service
  try {
    console.log(`Fetching fresh content for week ${weekNumber} from database.`);
    const data = await WeekContentService.getWeekContent(parseInt(weekNumber));

    if (data && data.length > 0) {
      // Transform the data to match the old format for backwards compatibility
      const transformedData = {
        content: {
          Problems: []
        }
      };

      // Group by problem_index to recreate the old structure
      const problemGroups = data.reduce((acc, item) => {
        if (!acc[item.problem_index]) {
          acc[item.problem_index] = {
            "Problem Number": item.problem_index.toString(),
            "Problem Main Question": item.problem_text,
            "Problem Subquestion": [],
            "Problem Solution": [] // You might need to add solutions to your schema
          };
        }
        acc[item.problem_index]["Problem Subquestion"].push(item.subproblem_text);
        return acc;
      }, {} as any);

      transformedData.content.Problems = Object.values(problemGroups);

      // 3. Store the new data and timestamp in the cache
      cache.set(weekNumber, { data: transformedData, timestamp: Date.now() });
      return transformedData;
    }

    return null;

  } catch (error) {
    console.error('Error fetching week content:', error);
    return null;
  }
};

export { getWeekContent };