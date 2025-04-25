import { useState, useEffect } from 'react';
import { useReminder } from '../contexts/ReminderContext';

const ReminderSettings = () => {
  const { settings, updateSettings } = useReminder();
  
  const [enabled, setEnabled] = useState(settings.enabled);
  const [frequency, setFrequency] = useState(settings.frequency);
  const [activeHoursStart, setActiveHoursStart] = useState(settings.activeHoursStart);
  const [activeHoursEnd, setActiveHoursEnd] = useState(settings.activeHoursEnd);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'default'>('default');
  
  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  // Update context when settings change
  useEffect(() => {
    updateSettings({
      enabled,
      frequency,
      activeHoursStart,
      activeHoursEnd,
    });
  }, [enabled, frequency, activeHoursStart, activeHoursEnd, updateSettings]);
  
  // Request notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setEnabled(true);
        updateSettings({ enabled: true });
      }
    }
  };
  
  // Format hours for display
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Reminder Settings</h2>
      
      {/* Notification permission */}
      {notificationPermission !== 'granted' && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            {notificationPermission === 'denied' 
              ? 'Notifications are blocked. Please enable them in your browser settings.'
              : 'Enable notifications to receive water reminders.'}
          </p>
          {notificationPermission !== 'denied' && (
            <button
              onClick={requestPermission}
              className="mt-2 py-1 px-3 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600"
            >
              Enable Notifications
            </button>
          )}
        </div>
      )}
      
      {/* Enable/disable reminders */}
      <div className="mb-4">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={enabled}
              onChange={() => setEnabled(!enabled)}
              disabled={notificationPermission !== 'granted'}
            />
            <div className={`block w-10 h-6 rounded-full ${
              enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
              enabled ? 'transform translate-x-4' : ''
            }`}></div>
          </div>
          <div className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
            {enabled ? 'Reminders Enabled' : 'Reminders Disabled'}
          </div>
        </label>
      </div>
      
      {/* Reminder frequency */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Reminder Frequency
        </label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(Number(e.target.value))}
          disabled={!enabled}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white disabled:opacity-50"
        >
          <option value="30">Every 30 minutes</option>
          <option value="60">Every 1 hour</option>
          <option value="90">Every 1.5 hours</option>
          <option value="120">Every 2 hours</option>
          <option value="180">Every 3 hours</option>
          <option value="240">Every 4 hours</option>
        </select>
      </div>
      
      {/* Active hours */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Active Hours
        </label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start</label>
            <select
              value={activeHoursStart}
              onChange={(e) => setActiveHoursStart(Number(e.target.value))}
              disabled={!enabled}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white disabled:opacity-50"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={`start-${i}`} value={i}>
                  {formatHour(i)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End</label>
            <select
              value={activeHoursEnd}
              onChange={(e) => setActiveHoursEnd(Number(e.target.value))}
              disabled={!enabled}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white disabled:opacity-50"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={`end-${i}`} value={i}>
                  {formatHour(i)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {enabled 
            ? `You will receive reminders every ${frequency} minutes between ${formatHour(activeHoursStart)} and ${formatHour(activeHoursEnd)}.`
            : 'Reminders are currently disabled.'}
        </p>
      </div>
    </div>
  );
};

export default ReminderSettings;
