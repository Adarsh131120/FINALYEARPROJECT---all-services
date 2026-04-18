// test-server.js - Simplified backend for testing ML service integration
// Run without MongoDB/Redis dependencies

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mlService = require('./src/services/mlService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        // Accept executables
        const allowedExts = ['.exe', '.dll', '.bat', '.ps1', '.bin'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only executables allowed.'));
        }
    }
});

// Health check
app.get('/health', async (req, res) => {
    try {
        const mlHealth = await mlService.healthCheck();
        res.json({
            status: 'healthy',
            backend: 'running',
            mlService: mlHealth,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'degraded',
            backend: 'running',
            mlService: 'unavailable',
            error: error.message
        });
    }
});

// Direct prediction endpoint (for testing)
app.post('/api/predict', async (req, res) => {
    try {
        const { api_sequence, model_name } = req.body;

        if (!api_sequence) {
            return res.status(400).json({
                success: false,
                error: 'api_sequence is required'
            });
        }

        const result = await mlService.predict(api_sequence, model_name || 'xgboost');

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Ensemble prediction
app.post('/api/predict/ensemble', async (req, res) => {
    try {
        const { api_sequence } = req.body;

        if (!api_sequence) {
            return res.status(400).json({
                success: false,
                error: 'api_sequence is required'
            });
        }

        const result = await mlService.predictEnsemble(api_sequence);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Ensemble prediction error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// File upload and analysis
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        console.log(`File uploaded: ${req.file.originalname}`);

        // Submit to ML service
        const result = await mlService.analyzeFile(req.file.path);

        res.json({
            success: true,
            taskId: result.task_id,
            filename: req.file.originalname,
            message: 'File submitted for analysis',
            status: result.status
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get analysis status
app.get('/api/analysis/status/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const status = await mlService.getAnalysisStatus(taskId);

        res.json({
            success: true,
            ...status
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get available models
app.get('/api/models', async (req, res) => {
    try {
        const models = await mlService.getModels();

        res.json({
            success: true,
            models
        });

    } catch (error) {
        console.error('Get models error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, async () => {
    console.log('\n' + '='.repeat(60));
    console.log('   MALWARE DETECTION BACKEND (TEST MODE)');
    console.log('='.repeat(60));
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   ML Service: ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
    console.log('='.repeat(60));

    // Test ML service connection
    try {
        const health = await mlService.healthCheck();
        console.log('\n✓ ML Service connected successfully!');
        console.log('  Status:', health.status);
        console.log('  Predictor:', health.predictor);
        console.log('  Cuckoo:', health.cuckoo);
    } catch (error) {
        console.log('\n✗ ML Service connection failed:', error.message);
        console.log('  Make sure ML service is running on port 8000');
    }

    console.log('\n' + '='.repeat(60));
    console.log('Backend ready! Available endpoints:');
    console.log('  GET  /health');
    console.log('  POST /api/predict');
    console.log('  POST /api/predict/ensemble');
    console.log('  POST /api/upload');
    console.log('  GET  /api/analysis/status/:taskId');
    console.log('  GET  /api/models');
    console.log('='.repeat(60) + '\n');
});
