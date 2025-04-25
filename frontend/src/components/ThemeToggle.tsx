import { useTheme } from '../contexts/ThemeContext';
import { ThemeMode } from '../types';

const ThemeToggle = () => {
  const { theme, setTheme, isDarkMode } = useTheme();

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-md ${
          theme === 'light' 
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Light mode"
        title="Light mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
      
      <button
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-md ${
          theme === 'dark' 
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
      
      <button
        onClick={() => handleThemeChange('system')}
        className={`p-2 rounded-md ${
          theme === 'system' 
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="System theme"
        title="System theme"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
};

export default ThemeToggle;
