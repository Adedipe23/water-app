import { useReminders } from '../contexts/RemindersContext';

const ReminderHistory = () => {
  const { reminders, clearReminders } = useReminders();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Reminder History</h2>
        {reminders.length > 0 && (
          <button
            onClick={clearReminders}
            className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear History
          </button>
        )}
      </div>
      
      {reminders.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No reminders sent yet. Click the button above to send a reminder.
        </p>
      ) : (
        <div className="max-h-60 overflow-y-auto">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {reminders.map((reminder) => (
              <li key={reminder.id} className="py-3 flex items-center">
                <span className={`h-2 w-2 rounded-full mr-3 ${
                  reminder.success ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className="text-gray-800 dark:text-gray-200">
                  {formatTimestamp(reminder.timestamp)}
                </span>
                <span className={`ml-auto text-sm ${
                  reminder.success 
                    ? 'text-green-500 dark:text-green-400' 
                    : 'text-red-500 dark:text-red-400'
                }`}>
                  {reminder.success ? 'Success' : 'Failed'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReminderHistory;
