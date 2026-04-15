// frontend/src/hooks/usePolling.js

import { useState, useEffect, useRef } from 'react';
import uploadService from '../services/uploadService';

export const usePolling = (taskId, interval = 3000) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (!taskId) return;
    
    const pollStatus = async () => {
      try {
        const data = await uploadService.getStatus(taskId);
        setStatus(data);
        setLoading(false);
        
        // Stop polling if completed or failed
        if (data.status === 'completed' || data.status === 'failed') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    // Initial call
    pollStatus();
    
    // Set up interval
    intervalRef.current = setInterval(pollStatus, interval);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [taskId, interval]);
  
  return { status, loading, error };
};