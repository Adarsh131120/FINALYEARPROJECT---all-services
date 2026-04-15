// backend/src/services/queueService.js

const Queue = require('bull');
const Analysis = require('../models/Analysis');
const mlService = require('./mlService');

// Create queue
const analysisQueue = new Queue('malware-analysis', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

// Process jobs
analysisQueue.process(async (job) => {
  const { taskId, filePath, filename } = job.data;
  
  try {
    // Update status
    await Analysis.findOneAndUpdate(
      { taskId },
      { 
        status: 'analyzing',
        startedAt: new Date(),
        progress: 20
      }
    );
    
    // Submit to ML service
    job.progress(30);
    const uploadResult = await mlService.uploadFile(filePath, filename);
    
    const mlTaskId = uploadResult.task_id;
    
    // Update with ML task ID
    await Analysis.findOneAndUpdate(
      { taskId },
      { cuckooTaskId: mlTaskId, progress: 40 }
    );
    
    // Poll for results
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes with 5-second intervals
    
    while (attempts < maxAttempts) {
      job.progress(40 + (attempts / maxAttempts) * 50);
      
      const statusResult = await mlService.getStatus(mlTaskId);
      
      if (statusResult.status === 'completed') {
        // Analysis complete
        const result = statusResult.result;
        
        await Analysis.findOneAndUpdate(
          { taskId },
          {
            status: 'completed',
            completedAt: new Date(),
            progress: 100,
            result: {
              malwareFamily: result.malware_family,
              confidence: result.confidence,
              probabilities: result.probabilities,
              totalApiCalls: result.total_api_calls,
              uniqueApiCalls: result.unique_api_calls,
              criticalApis: result.critical_apis,
              modelUsed: result.model_used
            }
          }
        );
        
        // Cleanup uploaded file
        const fs = require('fs');
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        return { success: true, taskId };
      } else if (statusResult.status === 'failed') {
        throw new Error('ML analysis failed');
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    
    throw new Error('Analysis timeout');
    
  } catch (error) {
    // Update as failed
    await Analysis.findOneAndUpdate(
      { taskId },
      {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: error.message
      }
    );
    
    throw error;
  }
});

// Event handlers
analysisQueue.on('completed', (job, result) => {
  console.log(`✓ Job ${job.id} completed:`, result);
});

analysisQueue.on('failed', (job, err) => {
  console.error(`✗ Job ${job.id} failed:`, err.message);
});

module.exports = analysisQueue;