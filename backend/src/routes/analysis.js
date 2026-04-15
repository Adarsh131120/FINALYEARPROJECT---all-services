// backend/src/routes/analysis.js

const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

/**
 * @route   GET /api/analysis/status/:taskId
 * @desc    Get analysis status
 * @access  Public
 */
router.get('/status/:taskId', analysisController.getStatus);

/**
 * @route   GET /api/analysis/result/:taskId
 * @desc    Get analysis result
 * @access  Public
 */
router.get('/result/:taskId', analysisController.getResult);

/**
 * @route   GET /api/analysis/recent
 * @desc    Get recent analyses
 * @access  Public
 */
router.get('/recent', analysisController.getRecent);

/**
 * @route   GET /api/analysis/statistics
 * @desc    Get statistics
 * @access  Public
 */
router.get('/statistics', analysisController.getStatistics);

module.exports = router;