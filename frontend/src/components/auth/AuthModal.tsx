import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  forceAuth?: boolean;
}

const AuthModal = ({ isOpen, onClose, forceAuth = false }: AuthModalProps) => {
  const { isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md">
        {/* Close button - only show if not forcing auth */}
        {(!forceAuth || isAuthenticated) && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 z-10"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {isLogin ? (
          <LoginForm
            onToggleForm={() => setIsLogin(false)}
            onSuccess={forceAuth ? undefined : onClose}
          />
        ) : (
          <RegisterForm
            onToggleForm={() => setIsLogin(true)}
            onSuccess={() => setIsLogin(true)} // After registration, show login form
          />
        )}

        {forceAuth && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md text-center">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Please log in or create an account to use the Water Tracker app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
