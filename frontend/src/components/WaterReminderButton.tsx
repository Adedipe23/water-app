import { useState } from 'react';
import { sendWaterReminder } from '../services/api';
import { useReminders } from '../contexts/RemindersContext';
import { v4 as uuidv4 } from 'uuid';

const WaterReminderButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const { addReminder } = useReminders();

  const handleReminderClick = async () => {
    setIsLoading(true);
    
    try {
      const response = await sendWaterReminder();
      
      // Add to reminder history
      addReminder({
        id: uuidv4(),
        timestamp: response.timestamp,
        success: response.success,
      });
      
      // Show success toast
      setToastMessage(response.success ? 'Water reminder sent successfully!' : response.message);
      setToastType(response.success ? 'success' : 'error');
      setShowToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending reminder:', error);
      
      // Show error toast
      setToastMessage('Failed to send water reminder');
      setToastType('error');
      setShowToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleReminderClick}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )}
        {isLoading ? 'Sending...' : 'Remind Me to Drink Water'}
      </button>
      
      {/* Toast notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white transition-opacity duration-300`}>
          <div className="flex items-center">
            {toastType === 'success' ? (
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterReminderButton;
