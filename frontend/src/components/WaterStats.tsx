import React, { useState, useEffect, useRef } from 'react';
import { useWater } from '../contexts/WaterContext';

const WaterStats = () => {
  const { fetchWaterStats, waterStats, isLoading } = useWater();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  // Create the ref outside of useEffect
  const loadedPeriods = useRef<Set<string>>(new Set());

  // Fetch water stats on mount and when period changes
  useEffect(() => {
    if (!loadedPeriods.current.has(period)) {
      fetchWaterStats(period).catch(error => {
        console.error('Failed to fetch water stats:', error);
        // We'll handle the error gracefully in the UI
      });
      loadedPeriods.current.add(period);
    }
  }, [period, fetchWaterStats]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get max value for scaling
  const getMaxValue = () => {
    if (!waterStats || waterStats.data.length === 0) return 10;
    return Math.max(...waterStats.data.map(item => item.amount), 10);
  };

  const maxValue = getMaxValue();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Water Consumption</h2>

        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1 rounded-md text-sm ${
              period === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1 rounded-md text-sm ${
              period === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        </div>
      ) : waterStats && waterStats.data.length > 0 ? (
        <>
          {/* Bar chart */}
          <div className="h-60 flex items-end space-x-1 sm:space-x-2 mb-2">
            {waterStats.data.map((item, index) => (
              <div key={item.date} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-blue-500 dark:bg-blue-600 rounded-t transition-all duration-500 ease-out relative group"
                  style={{
                    height: `${Math.max(4, (item.amount / maxValue) * 100)}%`,
                    minHeight: item.amount > 0 ? '8px' : '0',
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.amount} {item.amount === 1 ? 'glass' : 'glasses'}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45 origin-top-left h-6 overflow-hidden">
                  {formatDate(item.date).split(' ')[0]}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div>
              <div className="w-3 h-3 bg-blue-500 dark:bg-blue-600 rounded-sm inline-block mr-1"></div>
              Water intake (glasses)
            </div>
            <div>
              Period: {period === 'weekly' ? 'This Week' : 'This Month'}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {waterStats.data.reduce((sum, item) => sum + item.amount, 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {(waterStats.data.reduce((sum, item) => sum + item.amount, 0) / waterStats.data.length).toFixed(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Best Day</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                {Math.max(...waterStats.data.map(item => item.amount))}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="h-40 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            No data available for this period.
          </p>
        </div>
      )}
    </div>
  );
};

export default WaterStats;
