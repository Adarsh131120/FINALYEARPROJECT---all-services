// // frontend/src/components/Results/AnalysisStatus.jsx

// import React from 'react';
// import { usePolling } from '../../hooks/usePolling';
// import './AnalysisStatus.css';

// const AnalysisStatus = ({ taskId, onComplete }) => {
//   const { status, loading, error } = usePolling(taskId, 3000);
  
//   React.useEffect(() => {
//     if (status?.status === 'completed' && onComplete) {
//       onComplete(status.result);
//     }
//   }, [status, onComplete]);
  
//   if (loading && !status) {
//     return <div className="status-loading">Loading...</div>;
//   }
  
//   if (error) {
//     return (
//       <div className="status-error">
//         <span className="error-icon">❌</span>
//         <p>{error}</p>
//       </div>
//     );
//   }
  
//   const getStatusIcon = () => {
//     switch (status?.status) {
//       case 'pending':
//       case 'queued':
//         return '⏳';
//       case 'analyzing':
//         return '🔄';
//       case 'completed':
//         return '✅';
//       case 'failed':
//         return '❌';
//       default:
//         return '⏳';
//     }
//   };
  
//   const getStatusText = () => {
//     switch (status?.status) {
//       case 'pending':
//         return 'Pending...';
//       case 'queued':
//         return 'In queue...';
//       case 'analyzing':
//         return 'Analyzing in sandbox...';
//       case 'completed':
//         return 'Analysis complete!';
//       case 'failed':
//         return 'Analysis failed';
//       default:
//         return 'Processing...';
//     }
//   };
  
//   return (
//     <div className="analysis-status">
//       <div className="status-header">
//         <span className="status-icon">{getStatusIcon()}</span>
//         <h3>{getStatusText()}</h3>
//       </div>
      
//       <div className="status-details">
//         <p className="filename">{status?.filename}</p>
        
//         {status?.status === 'analyzing' && (
//           <div className="progress-container">
//             <div className="progress-bar">
//               <div
//                 className="progress-fill animated"
//                 style={{ width: `${status?.progress || 0}%` }}
//               />
//             </div>
//             <p className="progress-text">{status?.progress || 0}%</p>
//           </div>
//         )}
        
//         {status?.status === 'failed' && status?.errorMessage && (
//           <div className="error-details">
//             <p>{status.errorMessage}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AnalysisStatus;


// frontend/src/components/Results/ResultCard.jsx

import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import './ResultCard.css';

const COLORS = {
  Trojan: '#e53e3e',
  Worm: '#dd6b20',
  Virus: '#d69e2e',
  Backdoor: '#38a169',
  Spyware: '#3182ce',
  Downloader: '#805ad5',
  Dropper: '#d53f8c',
  Adware: '#718096'
};

const ResultCard = ({ result, filename }) => {
  if (!result || !result.success) {
    return (
      <div className="result-card error">
        <h3>Analysis Failed</h3>
        <p>{result?.error || 'Unknown error occurred'}</p>
      </div>
    );
  }
  
  const {
    malware_family,
    confidence,
    probabilities,
    total_api_calls,
    unique_api_calls,
    critical_apis,
    model_used
  } = result;
  
  // Prepare probability data for chart
  const probData = Object.entries(probabilities || {}).map(([family, prob]) => ({
    family,
    probability: (prob * 100).toFixed(2)
  })).sort((a, b) => b.probability - a.probability);
  
  const getThreatLevel = () => {
    if (confidence >= 0.9) return { level: 'Critical', color: '#e53e3e' };
    if (confidence >= 0.7) return { level: 'High', color: '#dd6b20' };
    if (confidence >= 0.5) return { level: 'Medium', color: '#d69e2e' };
    return { level: 'Low', color: '#38a169' };
  };
  
  const threat = getThreatLevel();
  
  return (
    <div className="result-card">
      <div className="result-header">
        <h2>Analysis Complete</h2>
        <p className="filename">{filename}</p>
      </div>
      
      <div className="main-result">
        <div className="threat-badge" style={{ borderColor: threat.color }}>
          <span className="threat-level" style={{ color: threat.color }}>
            {threat.level} Threat
          </span>
        </div>
        
        <h1 className="malware-type" style={{ color: COLORS[malware_family] }}>
          {malware_family}
        </h1>
        
        <div className="confidence-meter">
          <div className="confidence-label">Confidence</div>
          <div className="confidence-value">{(confidence * 100).toFixed(1)}%</div>
          <div className="confidence-bar">
            <div
              className="confidence-fill"
              style={{
                width: `${confidence * 100}%`,
                background: COLORS[malware_family]
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{total_api_calls?.toLocaleString()}</div>
          <div className="stat-label">Total API Calls</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{unique_api_calls?.toLocaleString()}</div>
          <div className="stat-label">Unique APIs</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{critical_apis?.length || 0}</div>
          <div className="stat-label">Critical APIs</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{model_used}</div>
          <div className="stat-label">Model</div>
        </div>
      </div>
      
      {critical_apis && critical_apis.length > 0 && (
        <div className="critical-apis-section">
          <h3>Critical API Calls Detected</h3>
          <div className="api-tags">
            {critical_apis.map((api, idx) => (
              <span key={idx} className="api-tag">
                {api}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="probability-chart">
        <h3>Probability Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={probData}>
            <XAxis dataKey="family" />
            <YAxis />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="probability" fill="#667eea">
              {probData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.family]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ResultCard;


