// backend/src/controllers/historyController.js

const Analysis = require('../models/Analysis');

/**
 * Get user's analysis history
 */
exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.user?.id || 'anonymous';
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    const analyses = await Analysis.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-__v');
    
    const total = await Analysis.countDocuments({ uploadedBy: userId });
    
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
 * Delete analysis by ID
 */
exports.deleteAnalysis = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.id || 'anonymous';
    
    const analysis = await Analysis.findOne({ taskId, uploadedBy: userId });
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found or unauthorized'
      });
    }
    
    await analysis.deleteOne();
    
    res.json({
      success: true,
      message: 'Analysis deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Export analysis data
 */
exports.exportAnalyses = async (req, res) => {
  try {
    const userId = req.user?.id || 'anonymous';
    const format = req.query.format || 'json';
    
    const analyses = await Analysis.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(analyses);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analyses.csv');
      res.send(csv);
    } else {
      // Return JSON
      res.json({
        success: true,
        data: analyses
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

function convertToCSV(data) {
  // Simple CSV conversion
  const headers = ['taskId', 'filename', 'status', 'malwareFamily', 'confidence', 'createdAt'];
  const rows = data.map(item => [
    item.taskId,
    item.filename,
    item.status,
    item.result?.malwareFamily || '',
    item.result?.confidence || '',
    item.createdAt
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}