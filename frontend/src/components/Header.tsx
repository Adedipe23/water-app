import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import AuthModal from './auth/AuthModal';

const Header = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <img src="/water-drop.svg" alt="Water Drop" className="h-8 w-8 mr-2" />
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          Water Tracker
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <div className="flex items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Login / Register
          </button>
        )}

        <ThemeToggle />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
};

export default Header;
