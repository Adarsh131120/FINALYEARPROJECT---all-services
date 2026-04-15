// backend/src/models/Analysis.js

const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  filename: {
    type: String,
    required: true
  },
  
  fileHash: {
    type: String,
    sparse: true
  },
  
  fileSize: {
    type: Number,
    required: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'uploading', 'queued', 'analyzing', 'completed', 'failed'],
    default: 'pending'
  },
  
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Results
  result: {
    malwareFamily: String,
    confidence: Number,
    probabilities: mongoose.Schema.Types.Mixed,
    totalApiCalls: Number,
    uniqueApiCalls: Number,
    criticalApis: [String],
    modelUsed: String
  },
  
  // Metadata
  uploadedBy: {
    type: String,
    default: 'anonymous'
  },
  
  ipAddress: String,
  
  cuckooTaskId: Number,
  
  errorMessage: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  startedAt: Date,
  completedAt: Date,
  
  // Processing time
  processingTime: Number  // in seconds
});

// Indexes for performance
analysisSchema.index({ status: 1, createdAt: -1 });
analysisSchema.index({ createdAt: -1 });

// Virtual for duration
analysisSchema.virtual('duration').get(function() {
  if (this.completedAt && this.startedAt) {
    return Math.round((this.completedAt - this.startedAt) / 1000);
  }
  return null;
});

module.exports = mongoose.model('Analysis', analysisSchema);