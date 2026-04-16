// tests/api/endpoints.test.js

const request = require('supertest');
const app = require('../../backend/server');

describe('API Endpoints', () => {
  test('Health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });
  
  test('Upload file', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', 'test-files/test.exe');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.taskId).toBeDefined();
  });
  
  test('Get statistics', async () => {
    const response = await request(app).get('/api/analysis/statistics');
    expect(response.status).toBe(200);
    expect(response.body.statistics).toBeDefined();
  });
});