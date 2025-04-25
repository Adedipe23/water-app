import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types';

interface LoginFormProps {
  onToggleForm: () => void;
  onSuccess?: () => void;
}

const LoginForm = ({ onToggleForm, onSuccess }: LoginFormProps) => {
  const { login, isLoading, error } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { username?: string; password?: string } = {};
    let isValid = true;

    if (!credentials.username) {
      errors.username = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(credentials.username)) {
      errors.username = 'Email is invalid';
      isValid = false;
    }

    if (!credentials.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (credentials.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user types
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(credentials);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is handled in the auth context
      console.error('Login error:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Log In
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
            className={`w-full p-2 border ${
              validationErrors.username
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white`}
            placeholder="your@email.com"
          />
          {validationErrors.username && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.username}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            className={`w-full p-2 border ${
              validationErrors.password
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white`}
            placeholder="••••••••"
          />
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={onToggleForm}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign Up
          </button>
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          You can also use the app without logging in. Your data will be stored locally.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
