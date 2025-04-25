import { DailyWaterLog, Goal, Streak, WaterLog, WaterStats } from '../types';
import { getAuthHeader } from './auth';
import { fetchWithCache, clearCache } from '../utils/apiUtils';

const API_BASE_URL = 'http://localhost:8000';

// Cache keys
const CACHE_KEYS = {
  TODAY_LOGS: 'today-logs',
  STREAK: 'streak',
  GOAL: 'goal',
  HISTORY: (startDate: string, endDate: string) => `history-${startDate}-${endDate}`,
  STATS: (period: string) => `stats-${period}`,
};

// Log water intake
export const logWater = async (amount: number = 1, notes?: string): Promise<WaterLog> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/water/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        amount,
        notes,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to log water intake');
    }

    // Clear caches that will be affected by this change
    clearCache(CACHE_KEYS.TODAY_LOGS);
    clearCache(CACHE_KEYS.STREAK);
    // Clear any stats or history caches that include today
    const today = new Date().toISOString().split('T')[0];
    Object.keys(CACHE_KEYS).forEach(key => {
      if (key.startsWith('history-') && key.includes(today)) {
        clearCache(key);
      }
      if (key.startsWith('stats-')) {
        clearCache(key);
      }
    });

    return await response.json();
  } catch (error) {
    console.error('Error logging water:', error);
    throw error;
  }
};

// Get today's water logs
export const getTodayLogs = async (forceRefresh = false): Promise<DailyWaterLog> => {
  return fetchWithCache(
    CACHE_KEYS.TODAY_LOGS,
    async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/water/today`, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to get today\'s logs');
        }

        return await response.json();
      } catch (error) {
        console.error('Error getting today\'s logs:', error);
        // Return empty data as fallback
        return {
          date: new Date().toISOString().split('T')[0],
          total_amount: 0,
          logs: []
        };
      }
    },
    {
      forceRefresh,
      // Short cache duration for today's logs (30 seconds)
      cacheDuration: 30 * 1000,
      // Longer debounce time to prevent too many requests
      debounceTime: 2000
    }
  );
};

// Get streak information
export const getStreak = async (forceRefresh = false): Promise<Streak> => {
  return fetchWithCache(
    CACHE_KEYS.STREAK,
    async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/water/streak`, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to get streak information');
        }

        return await response.json();
      } catch (error) {
        console.error('Error getting streak:', error);
        // Return fallback data
        return {
          current_streak: 0,
          longest_streak: 0,
          last_logged_date: new Date().toISOString().split('T')[0],
          id: 'fallback',
          user_id: 'fallback',
          updated_at: new Date().toISOString()
        };
      }
    },
    {
      forceRefresh,
      // Cache for 1 minute
      cacheDuration: 60 * 1000,
      // Debounce for 2 seconds
      debounceTime: 2000
    }
  );
};

// Get water intake goal
export const getGoal = async (forceRefresh = false): Promise<Goal> => {
  return fetchWithCache(
    CACHE_KEYS.GOAL,
    async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/water/goal`, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to get goal');
        }

        return await response.json();
      } catch (error) {
        console.error('Error getting goal:', error);
        // Return fallback data
        return {
          goal_amount: 8,
          id: 'fallback',
          user_id: 'fallback',
          updated_at: new Date().toISOString()
        };
      }
    },
    {
      forceRefresh,
      // Cache for 5 minutes (goals don't change often)
      cacheDuration: 5 * 60 * 1000,
      // Debounce for 2 seconds
      debounceTime: 2000
    }
  );
};

// Update water intake goal
export const updateGoal = async (goalAmount: number): Promise<Goal> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/water/goal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        goal_amount: goalAmount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update goal');
    }

    // Clear the goal cache since we've updated it
    clearCache(CACHE_KEYS.GOAL);

    const result = await response.json();

    // Update the cache with the new goal
    fetchWithCache(CACHE_KEYS.GOAL, async () => result, { forceRefresh: true });

    return result;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

// Get water history
export const getWaterHistory = async (startDate: string, endDate: string, forceRefresh = false): Promise<DailyWaterLog[]> => {
  return fetchWithCache(
    CACHE_KEYS.HISTORY(startDate, endDate),
    async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/water/history?start_date=${startDate}&end_date=${endDate}`,
          {
            headers: getAuthHeader(),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // If we get an error, we'll generate a fallback response with empty data
          // This is a workaround for the backend bug with date handling
          console.warn('Backend error in water history. Using fallback data.', errorData);

          // Generate dates between startDate and endDate
          const start = new Date(startDate);
          const end = new Date(endDate);
          const result: DailyWaterLog[] = [];

          // Generate empty logs for each day in the range
          for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
            result.push({
              date: day.toISOString().split('T')[0],
              total_amount: 0,
              logs: []
            });
          }

          return result;
        }

        return await response.json();
      } catch (error) {
        console.error('Error getting water history:', error);

        // Fallback to empty data in case of any error
        const start = new Date(startDate);
        const end = new Date(endDate);
        const result: DailyWaterLog[] = [];

        for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
          result.push({
            date: day.toISOString().split('T')[0],
            total_amount: 0,
            logs: []
          });
        }

        return result;
      }
    },
    {
      forceRefresh,
      // Cache for 2 minutes
      cacheDuration: 2 * 60 * 1000,
      // Debounce for 2 seconds
      debounceTime: 2000
    }
  );
};

// Get water stats
export const getWaterStats = async (period: 'weekly' | 'monthly', forceRefresh = false): Promise<WaterStats> => {
  return fetchWithCache(
    CACHE_KEYS.STATS(period),
    async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/water/stats?period=${period}`,
          {
            headers: getAuthHeader(),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('Backend error in water stats. Using fallback data.', errorData);

          // Return fallback data
          return {
            period,
            data: []
          };
        }

        return await response.json();
      } catch (error) {
        console.error('Error getting water stats:', error);

        // Return fallback data
        return {
          period,
          data: []
        };
      }
    },
    {
      forceRefresh,
      // Cache for 2 minutes
      cacheDuration: 2 * 60 * 1000,
      // Debounce for 2 seconds
      debounceTime: 2000
    }
  );
};
