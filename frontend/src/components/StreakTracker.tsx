import { useWater } from '../contexts/WaterContext';
import { useEffect } from 'react';

const StreakTracker = () => {
  const { streak, refreshStreak } = useWater();

  // We don't need to refresh here since it's already handled in the WaterContext
  // This prevents duplicate API calls

  if (!streak) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2.5"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2.5"></div>
      </div>
    );
  }

  // Get streak badge
  const getStreakBadge = () => {
    if (streak.current_streak >= 30) {
      return '🏆 Hydration Master';
    } else if (streak.current_streak >= 14) {
      return '🥇 Hydration Pro';
    } else if (streak.current_streak >= 7) {
      return '🥈 Hydration Enthusiast';
    } else if (streak.current_streak >= 3) {
      return '🥉 Hydration Starter';
    } else {
      return '💧 Just Starting';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Streak Tracker</h2>

      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
          <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">
            {streak.current_streak} {streak.current_streak === 1 ? 'day' : 'days'}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</p>
          <p className="text-2xl font-bold text-purple-500 dark:text-purple-400">
            {streak.longest_streak} {streak.longest_streak === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>

      {/* Streak badge */}
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
        <p className="text-lg font-medium text-blue-800 dark:text-blue-300">
          {getStreakBadge()}
        </p>
      </div>

      {/* Streak visualization */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Streak Progress</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Next milestone: {
              streak.current_streak < 3 ? '3 days' :
              streak.current_streak < 7 ? '7 days' :
              streak.current_streak < 14 ? '14 days' :
              streak.current_streak < 30 ? '30 days' : 'Maintaining streak'
            }
          </p>
        </div>

        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {streak.current_streak < 3 ? (
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(streak.current_streak / 3) * 100}%` }}
            ></div>
          ) : streak.current_streak < 7 ? (
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(streak.current_streak / 7) * 100}%` }}
            ></div>
          ) : streak.current_streak < 14 ? (
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(streak.current_streak / 14) * 100}%` }}
            ></div>
          ) : streak.current_streak < 30 ? (
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(streak.current_streak / 30) * 100}%` }}
            ></div>
          ) : (
            <div className="h-full bg-blue-500 rounded-full w-full"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreakTracker;
