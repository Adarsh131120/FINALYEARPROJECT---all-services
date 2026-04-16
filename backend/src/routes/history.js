// backend/src/routes/history.js

const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
// const authenticate = require('../middleware/auth'); // Optional

/**
 * @route   GET /api/history
 * @desc    Get user's analysis history
 * @access  Public/Private
 */
router.get('/', historyController.getUserHistory);

/**
 * @route   DELETE /api/history/:taskId
 * @desc    Delete analysis
 * @access  Private
 */
router.delete('/:taskId', historyController.deleteAnalysis);

/**
 * @route   GET /api/history/export
 * @desc    Export analyses
 * @access  Private
 */
router.get('/export', historyController.exportAnalyses);

module.exports = router;