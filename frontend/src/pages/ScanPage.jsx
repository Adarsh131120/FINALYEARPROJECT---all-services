// frontend/src/pages/ScanPage.jsx

import React, { useState } from 'react';
import FileUpload from '../components/FileUpload/FileUpload';
import AnalysisStatus from '../components/Results/AnalysisStatus';
import ResultCard from '../components/Results/ResultCard';
import './ScanPage.css';

const ScanPage = () => {
  const [currentStep, setCurrentStep] = useState('upload'); // upload, analyzing, results
  const [taskId, setTaskId] = useState(null);
  const [filename, setFilename] = useState('');
  const [result, setResult] = useState(null);
  
  const handleUploadSuccess = (newTaskId) => {
    setTaskId(newTaskId);
    setCurrentStep('analyzing');
  };
  
  const handleAnalysisComplete = (analysisResult) => {
    setResult(analysisResult);
    setCurrentStep('results');
  };
  
  const handleReset = () => {
    setCurrentStep('upload');
    setTaskId(null);
    setResult(null);
    setFilename('');
  };
  
  return (
    <div className="scan-page">
      <div className="scan-container">
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${currentStep === 'upload' ? 'active' : 'completed'}`}>
            <div className="step-number">1</div>
            <div className="step-label">Upload File</div>
          </div>
          
          <div className="step-line" />
          
          <div className={`step ${currentStep === 'analyzing' ? 'active' : currentStep === 'results' ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Analysis</div>
          </div>
          
          <div className="step-line" />
          
          <div className={`step ${currentStep === 'results' ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Results</div>
          </div>
        </div>
        
        {/* Content based on current step */}
        <div className="scan-content">
          {currentStep === 'upload' && (
            <div className="upload-section">
              <h1>Malware Detection System</h1>
              <p className="subtitle">
                Upload a suspicious file for AI-powered malware analysis
              </p>
              <FileUpload onUploadSuccess={handleUploadSuccess} />
              
              <div className="info-cards">
                <div className="info-card">
                  <span className="info-icon">🛡️</span>
                  <h3>Safe Analysis</h3>
                  <p>Files are analyzed in an isolated sandbox environment</p>
                </div>
                
                <div className="info-card">
                  <span className="info-icon">🤖</span>
                  <h3>AI-Powered</h3>
                  <p>Advanced ML models trained on thousands of malware samples</p>
                </div>
                
                <div className="info-card">
                  <span className="info-icon">⚡</span>
                  <h3>Fast Results</h3>
                  <p>Get detailed analysis results in minutes</p>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 'analyzing' && taskId && (
            <div className="analyzing-section">
              <AnalysisStatus
                taskId={taskId}
                onComplete={handleAnalysisComplete}
              />
              
              <div className="analyzing-info">
                <h3>What's happening?</h3>
                <ul>
                  <li>✓ File uploaded to secure server</li>
                  <li>🔄 Executing file in sandbox environment</li>
                  <li>📊 Capturing API call sequences</li>
                  <li>🧠 Running ML classification model</li>
                  <li>⏳ Generating detailed report...</li>
                </ul>
              </div>
            </div>
          )}
          
          {currentStep === 'results' && result && (
            <div className="results-section">
              <ResultCard result={result} filename={filename} />
              
              <div className="action-buttons">
                <button className="btn-secondary" onClick={handleReset}>
                  Analyze Another File
                </button>
                <button className="btn-primary" onClick={() => window.print()}>
                  Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanPage;