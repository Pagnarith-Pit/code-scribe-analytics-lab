import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface WeekTopicsProps {
  weekNumber?: string;
}

export const WeekTopics: React.FC<WeekTopicsProps> = ({ weekNumber = '1' }) => {
  const [weekContent, setWeekContent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Cache to prevent re-queries
  const cacheRef = useRef(new Map());
  const currentWeekRef = useRef(weekNumber);

  const getWeekContent = useCallback(async (weekNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('COMP90059WeeklyContent')
        .select('*')
        .eq('week', weekNumber)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching week content:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    currentWeekRef.current = weekNumber;

    const loadContent = async () => {
      // ✅ Check cache first
      const cached = cacheRef.current.get(weekNumber);
      if (cached) {
        setWeekContent(cached);
        setLoading(false);
        return;
      }

      // ✅ Only fetch if not cached
      setLoading(true);
      const data = await getWeekContent(weekNumber);
      
      // ✅ Only update if still current week
      if (currentWeekRef.current === weekNumber) {
        if (data) {
          cacheRef.current.set(weekNumber, data);
          setWeekContent(data);
        }
        setLoading(false);
      }
    };

    loadContent();
  }, [weekNumber, getWeekContent]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Welcome to {weekContent?.title || `Week ${weekNumber}`}!
      </h2>
      {/* Your existing JSX */}
    </div>
  );
};