// backend/src/routes/upload.js

const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const uploadController = require('../controllers/uploadController');

/**
 * @route   POST /api/upload
 * @desc    Upload file for analysis
 * @access  Public
 */
router.post('/', upload.single('file'), uploadController.uploadFile);

/**
 * @route   GET /api/upload/stats
 * @desc    Get upload statistics
 * @access  Public
 */
router.get('/stats', uploadController.getUploadStats);

module.exports = router;