import { useState, useRef, useEffect } from 'react';
import { useWater } from '../contexts/WaterContext';

const WaterButton = () => {
  const { logWaterIntake, isLoading } = useWater();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Handle water button click
  const handleClick = async () => {
    if (isLoading) return;
    
    setIsAnimating(true);
    setShowRipple(true);
    
    try {
      await logWaterIntake(1);
    } catch (error) {
      console.error('Failed to log water intake:', error);
    }
    
    // Reset animation after a delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
    
    // Hide ripple after animation
    setTimeout(() => {
      setShowRipple(false);
    }, 800);
  };
  
  // Create water drop animation
  useEffect(() => {
    if (!isAnimating || !buttonRef.current) return;
    
    const button = buttonRef.current;
    const buttonRect = button.getBoundingClientRect();
    
    // Create water drops
    for (let i = 0; i < 8; i++) {
      const drop = document.createElement('div');
      drop.className = 'absolute w-4 h-4 bg-blue-400 rounded-full opacity-80 z-10';
      
      // Random position and animation
      const angle = (Math.PI * 2 / 8) * i;
      const distance = 60 + Math.random() * 40;
      const duration = 600 + Math.random() * 400;
      
      // Set initial position at center of button
      drop.style.left = `${buttonRect.width / 2}px`;
      drop.style.top = `${buttonRect.height / 2}px`;
      
      // Animate the drop
      drop.animate(
        [
          { transform: 'scale(0.8) translate(0, 0)', opacity: 0.8 },
          { 
            transform: `scale(0.2) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`, 
            opacity: 0 
          }
        ],
        {
          duration,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
          fill: 'forwards'
        }
      );
      
      button.appendChild(drop);
      
      // Remove the drop after animation
      setTimeout(() => {
        if (button.contains(drop)) {
          button.removeChild(drop);
        }
      }, duration);
    }
  }, [isAnimating]);
  
  return (
    <div className="flex flex-col items-center">
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={isLoading}
        className="relative overflow-hidden bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 px-6 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-48 h-48"
        aria-label="I Drank Water"
      >
        <div className="relative z-20 flex flex-col items-center">
          <svg 
            className={`h-16 w-16 mb-2 transition-transform duration-500 ${isAnimating ? 'scale-110' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2zm-4-8c0 2.2 1.8 4 4 4s4-1.8 4-4-1.8-4-4-4-4 1.8-4 4z" />
          </svg>
          <span className="text-xl font-bold">I Drank Water</span>
        </div>
        
        {/* Ripple effect */}
        {showRipple && (
          <div className="absolute inset-0 z-10">
            <span className="absolute inset-0 rounded-full animate-ping bg-blue-300 opacity-30"></span>
          </div>
        )}
        
        {/* Water background */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-blue-300 opacity-30 transition-all duration-1000 ease-out z-0 ${
            isAnimating ? 'h-full' : 'h-0'
          }`}
        ></div>
      </button>
    </div>
  );
};

export default WaterButton;
