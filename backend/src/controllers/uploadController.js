// backend/src/controllers/uploadController.js

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs');
const Analysis = require('../models/Analysis');
const analysisQueue = require('../services/queueService');

/**
 * Handle file upload and queue analysis
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    const { filename, path: filePath, size } = req.file;
    
    // Generate unique task ID
    const taskId = uuidv4();
    
    // Calculate file hash
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Create analysis record
    const analysis = new Analysis({
      taskId,
      filename: req.file.originalname,
      fileHash,
      fileSize: size,
      status: 'queued',
      uploadedBy: req.body.userId || 'anonymous',
      ipAddress: req.ip
    });
    
    await analysis.save();
    
    // Add to queue
    await analysisQueue.add({
      taskId,
      filePath,
      filename: req.file.originalname
    });
    
    res.status(200).json({
      success: true,
      taskId,
      message: 'File uploaded successfully. Analysis queued.',
      status: 'queued'
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process upload'
    });
  }
};

/**
 * Get upload statistics
 */
exports.getUploadStats = async (req, res) => {
  try {
    const stats = await Analysis.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Analysis.countDocuments();
    
    res.json({
      success: true,
      total,
      byStatus: stats
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};