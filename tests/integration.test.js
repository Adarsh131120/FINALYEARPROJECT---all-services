// tests/integration.test.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'http://localhost:5000';

describe('Malware Detection System Integration Tests', () => {
  let taskId;
  
  test('Health check should return healthy status', async () => {
    const response = await axios.get(`${API_URL}/health`);
    expect(response.data.status).toBe('healthy');
  });
  
  test('Should upload file successfully', async () => {
    const formData = new FormData();
    
    // Create test file
    const testFile = Buffer.from('test malware content');
    formData.append('file', testFile, 'test.exe');
    
    const response = await axios.post(
      `${API_URL}/api/upload`,
      formData,
      { headers: formData.getHeaders() }
    );
    
    expect(response.data.success).toBe(true);
    expect(response.data.taskId).toBeDefined();
    
    taskId = response.data.taskId;
  });
  
  test('Should get analysis status', async () => {
    const response = await axios.get(
      `${API_URL}/api/analysis/status/${taskId}`
    );
    
    expect(response.data.success).toBe(true);
    expect(response.data.status).toBeDefined();
  });
  
  test('Should get statistics', async () => {
    const response = await axios.get(
      `${API_URL}/api/analysis/statistics`
    );
    
    expect(response.data.success).toBe(true);
    expect(response.data.statistics).toBeDefined();
  });
});