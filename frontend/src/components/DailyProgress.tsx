import { useWater } from '../contexts/WaterContext';
import { useEffect, useState } from 'react';

const DailyProgress = () => {
  const { todayLogs, goal, refreshTodayLogs } = useWater();
  const [progress, setProgress] = useState(0);

  // Calculate progress percentage
  useEffect(() => {
    if (todayLogs && goal) {
      const percentage = Math.min(100, (todayLogs.total_amount / goal.goal_amount) * 100);
      setProgress(percentage);
    }
  }, [todayLogs, goal]);

  // We don't need to refresh here since it's already handled in the WaterContext
  // This prevents duplicate API calls

  if (!todayLogs || !goal) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2.5"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-2.5"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Today's Progress</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {todayLogs.total_amount} of {goal.goal_amount} glasses
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Status message */}
      <div className="mt-2 text-center">
        {progress >= 100 ? (
          <p className="text-green-500 dark:text-green-400 font-medium">
            🎉 Goal achieved! Great job staying hydrated today!
          </p>
        ) : progress >= 75 ? (
          <p className="text-blue-500 dark:text-blue-400 font-medium">
            Almost there! Just a few more glasses to go.
          </p>
        ) : progress >= 50 ? (
          <p className="text-blue-500 dark:text-blue-400 font-medium">
            Halfway there! Keep up the good work.
          </p>
        ) : progress >= 25 ? (
          <p className="text-yellow-500 dark:text-yellow-400 font-medium">
            Good start! Remember to keep drinking water throughout the day.
          </p>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Time to hydrate! Tap the button when you drink water.
          </p>
        )}
      </div>

      {/* Today's log count */}
      <div className="mt-4 text-center">
        <p className="text-2xl font-bold text-gray-800 dark:text-white">
          {todayLogs.total_amount}
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
            {todayLogs.total_amount === 1 ? 'glass' : 'glasses'} today
          </span>
        </p>
      </div>
    </div>
  );
};

export default DailyProgress;
