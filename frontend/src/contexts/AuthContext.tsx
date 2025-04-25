import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, UserCreate } from '../types';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  storeUserData,
  setToken,
  getToken,
  removeToken,
  isAuthenticated as checkAuth
} from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: UserCreate) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      try {
        if (checkAuth()) {
          // Get user data from localStorage
          const userData = getCurrentUser();
          if (userData) {
            setUser(userData);
          }
        }
      } catch (err) {
        console.error('Authentication initialization error:', err);
        removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await loginUser(credentials);
      setToken(token);

      // Since we don't have a /users/me endpoint, we'll use the stored user data
      // or create a minimal user object
      const userData = getCurrentUser() || {
        id: 'local-user',
        email: credentials.username,
        is_active: true,
        reminder_frequency: 120,
        active_hours_start: 9,
        active_hours_end: 21,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(userData);
      storeUserData(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: UserCreate): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      const registeredUser = await registerUser(userData);

      // Store the user data for later use
      storeUserData(registeredUser);

      // We don't auto-login after registration since the API requires a separate login step
      return registeredUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
