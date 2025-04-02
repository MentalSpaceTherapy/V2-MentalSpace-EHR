import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SessionTimeoutMonitorProps {
  timeoutWarningInMs?: number; // Time before session expiry to show warning
  checkInterval?: number;      // How often to check session status
  onTimeout?: () => void;      // Callback when session times out
  children?: React.ReactNode;
}

/**
 * SessionTimeoutMonitor
 * 
 * Monitors user activity and shows a warning dialog before the session expires.
 * Automatically logs out the user when the session expires.
 */
const SessionTimeoutMonitor: React.FC<SessionTimeoutMonitorProps> = ({
  timeoutWarningInMs = 5 * 60 * 1000, // 5 minutes before expiry by default
  checkInterval = 30 * 1000,          // Check every 30 seconds by default
  onTimeout,
  children
}) => {
  const { isAuthenticated, logout, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const warningTimerId = useRef<number | null>(null);
  const checkTimerId = useRef<number | null>(null);

  // Function to ping server and update session activity
  const pingServer = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/auth/session/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.expiresAt; // Server returns when the session will expire
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
    return null;
  }, [isAuthenticated]);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    if (!isAuthenticated) return;
    
    // If warning is showing, hide it since user is active
    if (showWarning) {
      setShowWarning(false);
      refreshSession();
    }
    
    // If we have a timer running, clear it
    if (warningTimerId.current) {
      window.clearTimeout(warningTimerId.current);
      warningTimerId.current = null;
    }
    
    // Ping server to update activity timestamp
    pingServer();
  }, [isAuthenticated, showWarning, refreshSession, pingServer]);

  // Check remaining session time
  const checkSessionTime = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/auth/session/status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const timeRemaining = data.expiresIn; // milliseconds until session expires
        
        // If session is about to expire, show warning
        if (timeRemaining <= timeoutWarningInMs) {
          setTimeLeft(Math.floor(timeRemaining / 1000)); // Convert to seconds
          setShowWarning(true);
          
          // Set a countdown timer
          const countdownInterval = window.setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                // Logout when timer reaches zero
                handleSessionTimeout();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(countdownInterval);
        }
      } else {
        // Session may have expired, handle accordingly
        if (response.status === 401) {
          handleSessionTimeout();
        }
      }
    } catch (error) {
      console.error('Failed to check session status:', error);
    }
  }, [isAuthenticated, timeoutWarningInMs]);

  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    setShowWarning(false);
    
    if (onTimeout) {
      onTimeout();
    }
    
    logout();
    navigate('/login', { 
      state: { 
        message: 'Your session has expired. Please log in again.' 
      } 
    });
  }, [logout, navigate, onTimeout]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // User activity events to monitor
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown',
      'scroll', 'touchstart', 'click', 'keypress'
    ];
    
    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });
    
    // Set up interval to check session status
    checkTimerId.current = window.setInterval(checkSessionTime, checkInterval);
    
    // Initial check
    checkSessionTime();
    
    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      
      if (warningTimerId.current) {
        window.clearTimeout(warningTimerId.current);
      }
      
      if (checkTimerId.current) {
        window.clearInterval(checkTimerId.current);
      }
    };
  }, [isAuthenticated, handleUserActivity, checkSessionTime, checkInterval]);

  // Extend session handler
  const handleExtendSession = async () => {
    const success = await refreshSession();
    if (success) {
      setShowWarning(false);
    }
  };

  return (
    <>
      {children}
      
      {/* Session Timeout Warning Dialog */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Session Timeout Warning
            </h2>
            <p className="text-gray-600 mb-6">
              Your session will expire in {timeLeft} seconds due to inactivity. 
              Would you like to continue your session?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleSessionTimeout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Logout Now
              </button>
              <button
                onClick={handleExtendSession}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Continue Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionTimeoutMonitor; 