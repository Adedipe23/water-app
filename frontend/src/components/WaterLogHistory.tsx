import React, { useState, useEffect, useRef } from 'react';
import { useWater } from '../contexts/WaterContext';
import { DailyWaterLog } from '../types';

const WaterLogHistory = () => {
  const { fetchWaterHistory, waterHistory, isLoading } = useWater();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  // Create the ref outside of useEffect
  const hasLoaded = useRef(false);

  // Get date range for the past 30 days
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  // Fetch water history on mount, but only once
  useEffect(() => {
    if (!hasLoaded.current) {
      const { startDate, endDate } = getDateRange();
      fetchWaterHistory(startDate, endDate).catch(error => {
        console.error('Failed to fetch water history:', error);
        // The error is already handled in the service with fallback data
      });
      hasLoaded.current = true;
    }
  }, [fetchWaterHistory]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get calendar days
  const getCalendarDays = () => {
    const { startDate, endDate } = getDateRange();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];

    // Create a map of dates to water logs
    const logMap = new Map<string, DailyWaterLog>();
    waterHistory.forEach(log => {
      logMap.set(log.date, log);
    });

    // Generate days
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dateString = day.toISOString().split('T')[0];
      const log = logMap.get(dateString);

      // Add a unique identifier to ensure uniqueness
      const uniqueId = `${dateString}-${Math.random().toString(36).substring(2, 9)}`;

      days.push({
        date: dateString,
        id: uniqueId, // Add a unique ID for each day
        formattedDate: formatDate(dateString),
        isToday: dateString === new Date().toISOString().split('T')[0],
        totalAmount: log?.total_amount || 0,
      });
    }

    return days.reverse(); // Most recent first
  };

  // Get selected day logs
  const getSelectedDayLogs = () => {
    if (!selectedDate) return null;

    return waterHistory.find(log => log.date === selectedDate);
  };

  const selectedDayLogs = getSelectedDayLogs();
  const calendarDays = getCalendarDays();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Water Log History</h2>

        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1 rounded-md text-sm ${
              viewMode === 'calendar'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-md text-sm ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2.5"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2.5"></div>
        </div>
      ) : viewMode === 'calendar' ? (
        <>
          {/* Calendar view */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
            {calendarDays.map(day => (
              <button
                key={day.id}
                /* Use the unique ID instead of date */
                onClick={() => setSelectedDate(day.date)}
                className={`p-2 rounded-md text-center transition-colors ${
                  selectedDate === day.date
                    ? 'bg-blue-500 text-white'
                    : day.isToday
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : day.totalAmount > 0
                        ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <div className="text-xs">{day.formattedDate}</div>
                <div className="font-bold mt-1">
                  {day.totalAmount > 0 ? day.totalAmount : '-'}
                </div>
              </button>
            ))}
          </div>

          {/* Selected day details */}
          {selectedDayLogs ? (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">
                {formatDate(selectedDayLogs.date)} Details
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Total: {selectedDayLogs.total_amount} {selectedDayLogs.total_amount === 1 ? 'glass' : 'glasses'}
              </p>

              {selectedDayLogs.logs.length > 0 ? (
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedDayLogs.logs.map(log => (
                    <li key={log.id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <span className="w-16">{formatTime(log.timestamp)}</span>
                      <span className="ml-2">{log.amount} {log.amount === 1 ? 'glass' : 'glasses'}</span>
                      {log.notes && <span className="ml-2 text-gray-500 dark:text-gray-500 italic">"{log.notes}"</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-500 italic">No detailed logs available</p>
              )}
            </div>
          ) : selectedDate ? (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                No water intake recorded on {formatDate(selectedDate)}.
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <>
          {/* List view */}
          <div className="max-h-80 overflow-y-auto">
            {waterHistory.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {waterHistory
                  .filter(day => day.total_amount > 0)
                  .map(day => (
                    <li key={day.date} className="py-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {formatDate(day.date)}
                        </span>
                        <span className="text-blue-500 dark:text-blue-400 font-bold">
                          {day.total_amount} {day.total_amount === 1 ? 'glass' : 'glasses'}
                        </span>
                      </div>

                      {day.logs.length > 0 && (
                        <div className="mt-1 pl-4 text-sm text-gray-500 dark:text-gray-400">
                          {day.logs.slice(0, 3).map(log => (
                            <div key={log.id} className="flex items-center">
                              <span className="w-16">{formatTime(log.timestamp)}</span>
                              <span>{log.amount} {log.amount === 1 ? 'glass' : 'glasses'}</span>
                            </div>
                          ))}
                          {day.logs.length > 3 && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              + {day.logs.length - 3} more entries
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                No water intake records found for the past 30 days.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WaterLogHistory;
