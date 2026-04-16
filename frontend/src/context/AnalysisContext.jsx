// frontend/src/context/AnalysisContext.jsx

import React, { createContext, useState, useContext } from 'react';

const AnalysisContext = createContext();

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
};

export const AnalysisProvider = ({ children }) => {
  const [analyses, setAnalyses] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  
  const addAnalysis = (analysis) => {
    setAnalyses(prev => [analysis, ...prev]);
  };
  
  const updateAnalysis = (taskId, updates) => {
    setAnalyses(prev =>
      prev.map(a => a.taskId === taskId ? { ...a, ...updates } : a)
    );
  };
  
  const value = {
    analyses,
    currentAnalysis,
    setCurrentAnalysis,
    addAnalysis,
    updateAnalysis
  };
  
  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};