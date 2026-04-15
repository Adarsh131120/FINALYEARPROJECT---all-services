// frontend/src/services/uploadService.js

import api from './api';

class UploadService {
  /**
   * Upload file for analysis
   */
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) {
            onProgress(percentCompleted);
          }
        }
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Upload failed');
    }
  }
  
  /**
   * Get analysis status
   */
  async getStatus(taskId) {
    try {
      const response = await api.get(`/api/analysis/status/${taskId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get status');
    }
  }
  
  /**
   * Get analysis result
   */
  async getResult(taskId) {
    try {
      const response = await api.get(`/api/analysis/result/${taskId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get result');
    }
  }
  
  /**
   * Get recent analyses
   */
  async getRecent(page = 1, limit = 10) {
    try {
      const response = await api.get(`/api/analysis/recent?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get history');
    }
  }
  
  /**
   * Get statistics
   */
  async getStatistics() {
    try {
      const response = await api.get('/api/analysis/statistics');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get statistics');
    }
  }
}

export default new UploadService();