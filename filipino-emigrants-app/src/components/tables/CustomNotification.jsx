// src/components/AgeTable/CustomNotification.js

import React, { useEffect, useState } from 'react';

const notificationStyles = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  padding: '12px 20px',
  borderRadius: '8px',
  color: 'white',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  zIndex: 3000,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '16px',
  // --- CHANGES START ---
  opacity: 0,
  transform: 'translateX(100%)', // Start off-screen to the right
  transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
  // --- CHANGES END ---
};

const typeStyles = {
  success: {
    backgroundColor: '#10b981', // Green
  },
  error: {
    backgroundColor: '#ef4444', // Red
  },
};

// --- NEW ---
// Style for when the notification is visible
const visibleStyles = {
  opacity: 1,
  transform: 'translateX(0)',
};

function CustomNotification({ message, type = 'success', onClose }) {
  // --- NEW ---
  // State to control the visibility and trigger animations
  const [isVisible, setIsVisible] = useState(false);

  // Animate in on mount, then set a timer to close
  useEffect(() => {
    // 1. Make the notification visible to trigger the "slide in" animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10); // A small delay ensures the transition is applied

    // 2. Set a timer to automatically start the closing animation
    const closeTimer = setTimeout(() => {
      handleClose();
    }, 3000); // Notification will start to disappear after 3 seconds

    // 3. Cleanup timers if the component is unmounted
    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- NEW ---
  // Function to handle the "slide out" animation before calling onClose
  const handleClose = () => {
    setIsVisible(false); // Trigger the "slide out" animation
    // Wait for the animation to finish before removing the component
    setTimeout(() => {
      onClose();
    }, 400); // This duration should match the transition duration
  };

  return (
    <div 
      style={{ 
        ...notificationStyles, 
        ...typeStyles[type],
        // --- CHANGE ---
        // Conditionally apply the visible styles
        ...(isVisible ? visibleStyles : {}),
      }}
    >
      <span>{message}</span>
      <button 
        // --- CHANGE ---
        // Use the new handleClose function
        onClick={handleClose} 
        style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}
      >
        &times;
      </button>
    </div>
  );
}

export default CustomNotification;