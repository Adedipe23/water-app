import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from './AuthModal';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  useEffect(() => {
    // If not loading and not authenticated, show auth modal
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true);
    } else if (isAuthenticated) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated, isLoading]);
  
  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {children}
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          // Only allow closing if authenticated or in development mode
          if (isAuthenticated || process.env.NODE_ENV === 'development') {
            setShowAuthModal(false);
          }
        }} 
        forceAuth={!isAuthenticated}
      />
    </>
  );
};

export default AuthGuard;
