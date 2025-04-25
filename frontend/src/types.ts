// API Response Types
export interface WaterLog {
  id: string;
  user_id: string;
  timestamp: string;
  amount: number;
  notes?: string;
}

export interface DailyWaterLog {
  date: string;
  total_amount: number;
  logs: WaterLog[];
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_logged_date: string;
  id: string;
  user_id: string;
  updated_at: string;
}

export interface Goal {
  goal_amount: number;
  id: string;
  user_id: string;
  updated_at: string;
}

export interface WaterStats {
  period: string;
  data: Array<{
    date: string;
    amount: number;
  }>;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  is_active: boolean;
  reminder_frequency: number;
  active_hours_start: number;
  active_hours_end: number;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  reminder_frequency?: number;
  active_hours_start?: number;
  active_hours_end?: number;
}

export interface LoginCredentials {
  username: string; // email
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

// Local State Types
export interface WaterLogEntry {
  id: string;
  timestamp: string;
  amount: number;
}

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system';
