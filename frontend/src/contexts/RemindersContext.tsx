import { createContext, useContext, useState, ReactNode } from 'react';
import { ReminderHistoryItem } from '../types';

interface RemindersContextType {
  reminders: ReminderHistoryItem[];
  addReminder: (reminder: ReminderHistoryItem) => void;
  clearReminders: () => void;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export const RemindersProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<ReminderHistoryItem[]>([]);

  const addReminder = (reminder: ReminderHistoryItem) => {
    setReminders(prev => [reminder, ...prev]);
  };

  const clearReminders = () => {
    setReminders([]);
  };

  return (
    <RemindersContext.Provider value={{ reminders, addReminder, clearReminders }}>
      {children}
    </RemindersContext.Provider>
  );
};

export const useReminders = (): RemindersContextType => {
  const context = useContext(RemindersContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
};
