import { useState, useEffect } from 'react';
import { useWater } from '../contexts/WaterContext';

const GoalSetting = () => {
  const { goal, setGoal, refreshGoal } = useWater();
  const [goalAmount, setGoalAmount] = useState<number>(8);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize goal amount from context
  useEffect(() => {
    if (goal) {
      setGoalAmount(goal.goal_amount);
    }
    // We don't need to call refreshGoal() here since it's already handled in the WaterContext
  }, [goal]);

  // Handle goal update
  const handleUpdateGoal = async () => {
    if (goalAmount < 1 || goalAmount > 20) return;

    setIsSaving(true);

    try {
      await setGoal(goalAmount);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update goal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!goal) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2.5"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2.5"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Daily Water Goal</h2>

      {isEditing ? (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-center">
            <button
              onClick={() => setGoalAmount(prev => Math.max(1, prev - 1))}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-l-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>

            <input
              type="number"
              min="1"
              max="20"
              value={goalAmount}
              onChange={(e) => setGoalAmount(parseInt(e.target.value) || 1)}
              className="w-16 text-center p-2 border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />

            <button
              onClick={() => setGoalAmount(prev => Math.min(20, prev + 1))}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdateGoal}
              disabled={isSaving}
              className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <svg className="w-24 h-24 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{goal.goal_amount}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
            Your daily goal is to drink {goal.goal_amount} {goal.goal_amount === 1 ? 'glass' : 'glasses'} of water.
          </p>

          <button
            onClick={() => setIsEditing(true)}
            className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Change Goal
          </button>
        </div>
      )}

      {/* Water intake recommendations */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommended Water Intake</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The general recommendation is to drink 8 glasses (64 ounces) of water per day, but individual needs may vary based on activity level, climate, and overall health.
        </p>
      </div>
    </div>
  );
};

export default GoalSetting;
