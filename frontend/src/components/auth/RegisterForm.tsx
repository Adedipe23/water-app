import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserCreate } from '../../types';

interface RegisterFormProps {
  onToggleForm: () => void;
  onSuccess?: () => void;
}

const RegisterForm = ({ onToggleForm, onSuccess }: RegisterFormProps) => {
  const { register, isLoading, error } = useAuth();
  const [userData, setUserData] = useState<UserCreate>({
    email: '',
    password: '',
    reminder_frequency: 120, // 2 hours
    active_hours_start: 9, // 9 AM
    active_hours_end: 21, // 9 PM
  });
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!userData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!userData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (userData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: name === 'email' || name === 'password'
        ? value
        : parseInt(value, 10),
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
      const registeredUser = await register(userData);

      // Show success message and switch to login form
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled in the auth context
      console.error('Registration error:', error);
    }
  };

  // Format hours for display
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Create Account
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
            className={`w-full p-2 border ${
              validationErrors.email
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white`}
            placeholder="your@email.com"
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
            minLength={8}
            className={`w-full p-2 border ${
              validationErrors.password
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white`}
            placeholder="••••••••"
          />
          {validationErrors.password ? (
            <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Password must be at least 8 characters long
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="reminder_frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reminder Frequency
          </label>
          <select
            id="reminder_frequency"
            name="reminder_frequency"
            value={userData.reminder_frequency}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          >
            <option value="30">Every 30 minutes</option>
            <option value="60">Every 1 hour</option>
            <option value="90">Every 1.5 hours</option>
            <option value="120">Every 2 hours</option>
            <option value="180">Every 3 hours</option>
            <option value="240">Every 4 hours</option>
          </select>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="active_hours_start" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Active Hours Start
            </label>
            <select
              id="active_hours_start"
              name="active_hours_start"
              value={userData.active_hours_start}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={`start-${i}`} value={i}>
                  {formatHour(i)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="active_hours_end" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Active Hours End
            </label>
            <select
              id="active_hours_end"
              name="active_hours_end"
              value={userData.active_hours_end}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={`end-${i}`} value={i}>
                  {formatHour(i)}
                </option>
              ))}
            </select>
          </div>
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
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onToggleForm}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Log In
          </button>
        </p>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          After registration, you'll need to log in with your new account.
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
