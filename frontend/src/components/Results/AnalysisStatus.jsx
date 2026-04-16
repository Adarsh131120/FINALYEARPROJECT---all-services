// frontend/src/components/Results/AnalysisStatus.jsx

import React from 'react';
import { usePolling } from '../../hooks/usePolling';
import './AnalysisStatus.css';

const AnalysisStatus = ({ taskId, onComplete }) => {
  const { status, loading, error } = usePolling(taskId, 3000);
  
  React.useEffect(() => {
    if (status?.status === 'completed' && onComplete) {
      onComplete(status.result);
    }
  }, [status, onComplete]);
  
  if (loading && !status) {
    return <div className="status-loading">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="status-error">
        <span className="error-icon">❌</span>
        <p>{error}</p>
      </div>
    );
  }
  
  const getStatusIcon = () => {
    switch (status?.status) {
      case 'pending':
      case 'queued':
        return '⏳';
      case 'analyzing':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };
  
  const getStatusText = () => {
    switch (status?.status) {
      case 'pending':
        return 'Pending...';
      case 'queued':
        return 'In queue...';
      case 'analyzing':
        return 'Analyzing in sandbox...';
      case 'completed':
        return 'Analysis complete!';
      case 'failed':
        return 'Analysis failed';
      default:
        return 'Processing...';
    }
  };
  
  return (
    <div className="analysis-status">
      <div className="status-header">
        <span className="status-icon">{getStatusIcon()}</span>
        <h3>{getStatusText()}</h3>
      </div>
      
      <div className="status-details">
        <p className="filename">{status?.filename}</p>
        
        {status?.status === 'analyzing' && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill animated"
                style={{ width: `${status?.progress || 0}%` }}
              />
            </div>
            <p className="progress-text">{status?.progress || 0}%</p>
          </div>
        )}
        
        {status?.status === 'failed' && status?.errorMessage && (
          <div className="error-details">
            <p>{status.errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisStatus;
