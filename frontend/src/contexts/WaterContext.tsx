import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DailyWaterLog, Goal, Streak, WaterLog, WaterStats } from '../types';
import {
  logWater,
  getTodayLogs,
  getStreak,
  getGoal,
  updateGoal,
  getWaterHistory,
  getWaterStats
} from '../services/water';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface WaterContextType {
  todayLogs: DailyWaterLog | null;
  streak: Streak | null;
  goal: Goal | null;
  waterHistory: DailyWaterLog[];
  waterStats: WaterStats | null;
  isLoading: boolean;
  error: string | null;
  logWaterIntake: (amount?: number, notes?: string) => Promise<void>;
  refreshTodayLogs: () => Promise<void>;
  refreshStreak: () => Promise<void>;
  refreshGoal: () => Promise<void>;
  setGoal: (amount: number) => Promise<void>;
  fetchWaterHistory: (startDate: string, endDate: string) => Promise<void>;
  fetchWaterStats: (period: 'weekly' | 'monthly') => Promise<void>;
}

const WaterContext = createContext<WaterContextType | undefined>(undefined);

export const WaterProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();

  const [todayLogs, setTodayLogs] = useState<DailyWaterLog | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [goal, setGoalState] = useState<Goal | null>(null);
  const [waterHistory, setWaterHistory] = useState<DailyWaterLog[]>([]);
  const [waterStats, setWaterStats] = useState<WaterStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Use a single loading state for initial data
      setIsLoading(true);

      // Load data in sequence to prevent too many simultaneous requests
      const loadInitialData = async () => {
        try {
          await refreshTodayLogs();
          await refreshStreak();
          await refreshGoal();
        } catch (error) {
          console.error('Error loading initial data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadInitialData();
    }
  }, [isAuthenticated]);

  // Log water intake
  const logWaterIntake = async (amount: number = 1, notes?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        await logWater(amount, notes);
        await refreshTodayLogs();
        await refreshStreak();
      } else {
        // Handle offline/unauthenticated mode with local storage
        const timestamp = new Date().toISOString();
        const newLog: WaterLog = {
          id: uuidv4(),
          user_id: 'local',
          timestamp,
          amount,
          notes,
        };

        // Update local storage
        const storedLogs = localStorage.getItem('waterLogs');
        const logs: WaterLog[] = storedLogs ? JSON.parse(storedLogs) : [];
        logs.push(newLog);
        localStorage.setItem('waterLogs', JSON.stringify(logs));

        // Update today's logs in state
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = logs.filter(log => log.timestamp.startsWith(today));
        const totalAmount = todayLogs.reduce((sum, log) => sum + (log.amount || 1), 0);

        setTodayLogs({
          date: today,
          total_amount: totalAmount,
          logs: todayLogs,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log water intake');
      console.error('Error logging water:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh today's logs
  const refreshTodayLogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        const logs = await getTodayLogs();
        setTodayLogs(logs);
      } else {
        // Handle offline/unauthenticated mode
        const storedLogs = localStorage.getItem('waterLogs');
        if (storedLogs) {
          const logs: WaterLog[] = JSON.parse(storedLogs);
          const today = new Date().toISOString().split('T')[0];
          const todayLogs = logs.filter(log => log.timestamp.startsWith(today));
          const totalAmount = todayLogs.reduce((sum, log) => sum + (log.amount || 1), 0);

          setTodayLogs({
            date: today,
            total_amount: totalAmount,
            logs: todayLogs,
          });
        } else {
          setTodayLogs({
            date: new Date().toISOString().split('T')[0],
            total_amount: 0,
            logs: [],
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get today\'s logs');
      console.error('Error refreshing today logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh streak
  const refreshStreak = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        const streakData = await getStreak();
        setStreak(streakData);
      } else {
        // Simple local streak calculation
        const storedLogs = localStorage.getItem('waterLogs');
        if (storedLogs) {
          const logs: WaterLog[] = JSON.parse(storedLogs);

          // Get unique dates
          const dates = new Set<string>();
          logs.forEach(log => {
            const date = log.timestamp.split('T')[0];
            dates.add(date);
          });

          // Sort dates
          const sortedDates = Array.from(dates).sort();

          if (sortedDates.length > 0) {
            // Calculate current streak
            let currentStreak = 1;
            let longestStreak = 1;
            const lastDate = new Date(sortedDates[sortedDates.length - 1]);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if last log was today or yesterday
            const isActive = lastDate.getTime() >= today.getTime() - 86400000;

            if (isActive && sortedDates.length > 1) {
              // Calculate streak by checking consecutive days
              for (let i = sortedDates.length - 1; i > 0; i--) {
                const current = new Date(sortedDates[i]);
                const prev = new Date(sortedDates[i - 1]);

                // Check if dates are consecutive
                const diffTime = current.getTime() - prev.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);

                if (diffDays === 1) {
                  currentStreak++;
                  longestStreak = Math.max(longestStreak, currentStreak);
                } else {
                  break;
                }
              }
            } else if (!isActive) {
              currentStreak = 0;
            }

            setStreak({
              current_streak: currentStreak,
              longest_streak: longestStreak,
              last_logged_date: sortedDates[sortedDates.length - 1],
              id: 'local',
              user_id: 'local',
              updated_at: new Date().toISOString(),
            });
          } else {
            setStreak({
              current_streak: 0,
              longest_streak: 0,
              last_logged_date: new Date().toISOString().split('T')[0],
              id: 'local',
              user_id: 'local',
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          setStreak({
            current_streak: 0,
            longest_streak: 0,
            last_logged_date: new Date().toISOString().split('T')[0],
            id: 'local',
            user_id: 'local',
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get streak');
      console.error('Error refreshing streak:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh goal
  const refreshGoal = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        const goalData = await getGoal();
        setGoalState(goalData);
      } else {
        // Get goal from local storage
        const storedGoal = localStorage.getItem('waterGoal');
        if (storedGoal) {
          setGoalState(JSON.parse(storedGoal));
        } else {
          // Default goal
          const defaultGoal: Goal = {
            goal_amount: 8,
            id: 'local',
            user_id: 'local',
            updated_at: new Date().toISOString(),
          };
          localStorage.setItem('waterGoal', JSON.stringify(defaultGoal));
          setGoalState(defaultGoal);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get goal');
      console.error('Error refreshing goal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Set goal
  const setGoal = async (amount: number) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        const updatedGoal = await updateGoal(amount);
        setGoalState(updatedGoal);
      } else {
        // Update goal in local storage
        const goalData: Goal = {
          goal_amount: amount,
          id: 'local',
          user_id: 'local',
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem('waterGoal', JSON.stringify(goalData));
        setGoalState(goalData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      console.error('Error setting goal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch water history
  const fetchWaterHistory = async (startDate: string, endDate: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        const history = await getWaterHistory(startDate, endDate);
        setWaterHistory(history);
      } else {
        // Get history from local storage
        const storedLogs = localStorage.getItem('waterLogs');
        if (storedLogs) {
          const logs: WaterLog[] = JSON.parse(storedLogs);

          // Filter logs by date range
          const filteredLogs = logs.filter(log => {
            const logDate = log.timestamp.split('T')[0];
            return logDate >= startDate && logDate <= endDate;
          });

          // Group logs by date
          const logsByDate = filteredLogs.reduce((acc, log) => {
            const date = log.timestamp.split('T')[0];
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(log);
            return acc;
          }, {} as Record<string, WaterLog[]>);

          // Create daily logs
          const dailyLogs: DailyWaterLog[] = Object.keys(logsByDate).map(date => {
            const logs = logsByDate[date];
            const totalAmount = logs.reduce((sum, log) => sum + (log.amount || 1), 0);

            return {
              date,
              total_amount: totalAmount,
              logs,
            };
          });

          // Sort by date
          dailyLogs.sort((a, b) => a.date.localeCompare(b.date));

          setWaterHistory(dailyLogs);
        } else {
          setWaterHistory([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get water history');
      console.error('Error fetching water history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch water stats
  const fetchWaterStats = async (period: 'weekly' | 'monthly') => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        const stats = await getWaterStats(period);
        setWaterStats(stats);
      } else {
        // Calculate stats from local storage
        const storedLogs = localStorage.getItem('waterLogs');
        if (storedLogs) {
          const logs: WaterLog[] = JSON.parse(storedLogs);

          // Get date range based on period
          const today = new Date();
          let startDate: Date;

          if (period === 'weekly') {
            // Start from Sunday of current week
            const day = today.getDay();
            startDate = new Date(today);
            startDate.setDate(today.getDate() - day);
          } else {
            // Start from first day of current month
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          }

          startDate.setHours(0, 0, 0, 0);

          // Filter logs by date range
          const filteredLogs = logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= startDate && logDate <= today;
          });

          // Group logs by date
          const logsByDate = filteredLogs.reduce((acc, log) => {
            const date = log.timestamp.split('T')[0];
            if (!acc[date]) {
              acc[date] = 0;
            }
            acc[date] += log.amount || 1;
            return acc;
          }, {} as Record<string, number>);

          // Create stats data
          const statsData = Object.keys(logsByDate).map(date => ({
            date,
            amount: logsByDate[date],
          }));

          // Sort by date
          statsData.sort((a, b) => a.date.localeCompare(b.date));

          setWaterStats({
            period,
            data: statsData,
          });
        } else {
          setWaterStats({
            period,
            data: [],
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get water stats');
      console.error('Error fetching water stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WaterContext.Provider
      value={{
        todayLogs,
        streak,
        goal,
        waterHistory,
        waterStats,
        isLoading,
        error,
        logWaterIntake,
        refreshTodayLogs,
        refreshStreak,
        refreshGoal,
        setGoal,
        fetchWaterHistory,
        fetchWaterStats,
      }}
    >
      {children}
    </WaterContext.Provider>
  );
};

export const useWater = (): WaterContextType => {
  const context = useContext(WaterContext);
  if (context === undefined) {
    throw new Error('useWater must be used within a WaterProvider');
  }
  return context;
};
