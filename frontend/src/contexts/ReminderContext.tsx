import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ReminderSettings {
  enabled: boolean;
  frequency: number; // in minutes
  activeHoursStart: number; // 0-23
  activeHoursEnd: number; // 0-23
}

interface ReminderContextType {
  settings: ReminderSettings;
  updateSettings: (settings: Partial<ReminderSettings>) => void;
  lastNotificationTime: Date | null;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    const savedSettings = localStorage.getItem('reminderSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    
    // Default settings
    return {
      enabled: true,
      frequency: 120, // 2 hours
      activeHoursStart: 9, // 9 AM
      activeHoursEnd: 21, // 9 PM
    };
  });
  
  const [lastNotificationTime, setLastNotificationTime] = useState<Date | null>(null);
  
  // Update settings from user preferences if available
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        frequency: user.reminder_frequency || prev.frequency,
        activeHoursStart: user.active_hours_start || prev.activeHoursStart,
        activeHoursEnd: user.active_hours_end || prev.activeHoursEnd,
      }));
    }
  }, [user]);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('reminderSettings', JSON.stringify(settings));
  }, [settings]);
  
  // Set up notification timer
  useEffect(() => {
    if (!settings.enabled) return;
    
    // Check if we're in active hours
    const isInActiveHours = () => {
      const now = new Date();
      const hour = now.getHours();
      return hour >= settings.activeHoursStart && hour < settings.activeHoursEnd;
    };
    
    // Check if enough time has passed since last notification
    const shouldNotify = () => {
      if (!lastNotificationTime) return true;
      
      const now = new Date();
      const timeSinceLastNotification = now.getTime() - lastNotificationTime.getTime();
      const minimumInterval = settings.frequency * 60 * 1000; // Convert minutes to milliseconds
      
      return timeSinceLastNotification >= minimumInterval;
    };
    
    // Send notification
    const sendNotification = () => {
      if (!isInActiveHours() || !shouldNotify()) return;
      
      // Check if notification API is available
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Water Reminder', {
            body: 'Time to drink some water! 💧',
            icon: '/water-drop.png',
          });
          setLastNotificationTime(new Date());
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              sendNotification();
            }
          });
        }
      }
    };
    
    // Set up interval to check for notifications
    const checkInterval = setInterval(() => {
      sendNotification();
    }, 60000); // Check every minute
    
    return () => clearInterval(checkInterval);
  }, [settings, lastNotificationTime]);
  
  // Update settings
  const updateSettings = (newSettings: Partial<ReminderSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };
  
  return (
    <ReminderContext.Provider
      value={{
        settings,
        updateSettings,
        lastNotificationTime,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminder = (): ReminderContextType => {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminder must be used within a ReminderProvider');
  }
  return context;
};
