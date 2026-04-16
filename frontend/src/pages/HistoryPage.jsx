// frontend/src/pages/HistoryPage.jsx

import React, { useState, useEffect } from 'react';
import uploadService from '../services/uploadService';
import './HistoryPage.css';

const HistoryPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    loadHistory();
    loadStatistics();
  }, [page]);
  
  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await uploadService.getRecent(page, 10);
      setAnalyses(data.data);
      setTotalPages(data.pagination.pages);
      setLoading(false);
    } catch (error) {
      console.error('Error loading history:', error);
      setLoading(false);
    }
  };
  
  const loadStatistics = async () => {
    try {
      const data = await uploadService.getStatistics();
      setStatistics(data.statistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      completed: { text: 'Completed', color: '#48bb78' },
      failed: { text: 'Failed', color: '#f56565' },
      analyzing: { text: 'Analyzing', color: '#4299e1' },
      queued: { text: 'Queued', color: '#ed8936' },
      pending: { text: 'Pending', color: '#718096' }
    };
    
    const badge = badges[status] || badges.pending;
    
    return (
      <span className="status-badge" style={{ background: badge.color }}>
        {badge.text}
      </span>
    );
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="history-page">
      <div className="history-container">
        <h1>Analysis Dashboard</h1>
        
        {/* Statistics Cards */}
        {statistics && (
          <div className="stats-overview">
            <div className="stat-box">
              <div className="stat-value">{statistics.total}</div>
              <div className="stat-label">Total Scans</div>
            </div>
            
            <div className="stat-box success">
              <div className="stat-value">{statistics.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            
            <div className="stat-box warning">
              <div className="stat-value">{statistics.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            
            <div className="stat-box danger">
              <div className="stat-value">{statistics.failed}</div>
              <div className="stat-label">Failed</div>
            </div>
          </div>
        )}
        
        {/* Malware Family Distribution */}
        {statistics?.familyDistribution && statistics.familyDistribution.length > 0 && (
          <div className="distribution-section">
            <h2>Malware Family Distribution</h2>
            <div className="distribution-grid">
              {statistics.familyDistribution.map((item, idx) => (
                <div key={idx} className="distribution-item">
                  <div className="family-name">{item._id || 'Unknown'}</div>
                  <div className="family-count">{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recent Analyses Table */}
        <div className="table-section">
          <h2>Recent Analyses</h2>
          
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : analyses.length === 0 ? (
            <div className="empty-state">
              <p>No analyses found</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Filename</th>
                      <th>Status</th>
                      <th>Malware Type</th>
                      <th>Confidence</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map((analysis) => (
                      <tr key={analysis.taskId}>
                        <td className="filename-cell">
                          <span className="file-icon">📄</span>
                          {analysis.filename}
                        </td>
                        <td>{getStatusBadge(analysis.status)}</td>
                        <td>
                          {analysis.result?.malwareFamily || '-'}
                        </td>
                        <td>
                          {analysis.result?.confidence
                            ? `${(analysis.result.confidence * 100).toFixed(1)}%`
                            : '-'}
                        </td>
                        <td>{formatDate(analysis.createdAt)}</td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => window.open(`/analysis/${analysis.taskId}`, '_blank')}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  
                  <span className="page-info">
                    Page {page} of {totalPages}
                  </span>
                  
                  <button
                    className="page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;