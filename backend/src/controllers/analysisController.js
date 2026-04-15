// backend/src/controllers/analysisController.js

const Analysis = require('../models/Analysis');

/**
 * Get analysis status by task ID
 */
exports.getStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const analysis = await Analysis.findOne({ taskId });
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }
    
    res.json({
      success: true,
      taskId: analysis.taskId,
      status: analysis.status,
      progress: analysis.progress,
      filename: analysis.filename,
      result: analysis.result,
      createdAt: analysis.createdAt,
      completedAt: analysis.completedAt,
      errorMessage: analysis.errorMessage
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get analysis result by task ID
 */
exports.getResult = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const analysis = await Analysis.findOne({ taskId });
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }
    
    if (analysis.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Analysis not completed yet',
        status: analysis.status
      });
    }
    
    res.json({
      success: true,
      taskId: analysis.taskId,
      filename: analysis.filename,
      result: analysis.result,
      processingTime: analysis.duration,
      completedAt: analysis.completedAt
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get recent analyses
 */
exports.getRecent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    const analyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-__v');
    
    const total = await Analysis.countDocuments();
    
    res.json({
      success: true,
      data: analyses,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const totalAnalyses = await Analysis.countDocuments();
    const completedAnalyses = await Analysis.countDocuments({ status: 'completed' });
    const failedAnalyses = await Analysis.countDocuments({ status: 'failed' });
    const pendingAnalyses = await Analysis.countDocuments({ 
      status: { $in: ['pending', 'queued', 'analyzing'] }
    });
    
    // Malware family distribution
    const familyDistribution = await Analysis.aggregate([
      { $match: { status: 'completed' } },
      { 
        $group: {
          _id: '$result.malwareFamily',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Average processing time
    const avgProcessingTime = await Analysis.aggregate([
      { $match: { status: 'completed', processingTime: { $exists: true } } },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$processingTime' }
        }
      }
    ]);
    
    res.json({
      success: true,
      statistics: {
        total: totalAnalyses,
        completed: completedAnalyses,
        failed: failedAnalyses,
        pending: pendingAnalyses,
        familyDistribution,
        averageProcessingTime: avgProcessingTime[0]?.avgTime || 0
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};