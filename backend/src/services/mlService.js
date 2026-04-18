// backend/src/services/mlService.js

const axios = require('axios');
const logger = require('../utils/logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

class MLService {
    constructor() {
        this.baseURL = ML_SERVICE_URL;
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 300000, // 5 minutes timeout for analysis
            headers: {
                'Content-Type': 'application/json'
            }
        });

        logger.info(`ML Service initialized: ${this.baseURL}`);
    }

    /**
     * Check if ML service is available
     */
    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            return response.data;
        } catch (error) {
            logger.error('ML Service health check failed:', error.message);
            throw new Error('ML Service unavailable');
        }
    }

    /**
     * Predict malware family from API sequence
     * @param {string} apiSequence - Comma-separated API call sequence
     * @param {string} modelName - Model to use (xgboost, random_forest, ensemble)
     */
    async predict(apiSequence, modelName = 'xgboost') {
        try {
            logger.info(`Predicting with ${modelName} model`);

            const response = await this.client.post('/api/predict', {
                api_sequence: apiSequence,
                model_name: modelName
            });

            logger.info(`Prediction successful: ${response.data.malware_family}`);
            return response.data;

        } catch (error) {
            logger.error('Prediction failed:', error.message);
            if (error.response) {
                throw new Error(`ML Service error: ${error.response.data.detail || error.response.statusText}`);
            }
            throw new Error('Failed to get prediction from ML service');
        }
    }

    /**
     * Predict using ensemble of all models
     * @param {string} apiSequence - Comma-separated API call sequence
     */
    async predictEnsemble(apiSequence) {
        try {
            logger.info('Predicting with ensemble');

            const response = await this.client.post('/api/predict/ensemble', {
                api_sequence: apiSequence
            });

            logger.info(`Ensemble prediction: ${response.data.malware_family}`);
            return response.data;

        } catch (error) {
            logger.error('Ensemble prediction failed:', error.message);
            if (error.response) {
                throw new Error(`ML Service error: ${error.response.data.detail || error.response.statusText}`);
            }
            throw new Error('Failed to get ensemble prediction');
        }
    }

    /**
     * Upload and analyze a file using Cuckoo Sandbox + ML prediction
     * @param {string} filePath - Path to the malware file
     */
    async analyzeFile(filePath) {
        try {
            logger.info(`Analyzing file: ${filePath}`);

            const FormData = require('form-data');
            const fs = require('fs');

            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            const response = await this.client.post('/api/upload', formData, {
                headers: {
                    ...formData.getHeaders()
                },
                timeout: 600000 // 10 minutes for full analysis
            });

            logger.info(`File analysis complete: ${response.data.task_id}`);
            return response.data;

        } catch (error) {
            logger.error('File analysis failed:', error.message);
            if (error.response) {
                throw new Error(`ML Service error: ${error.response.data.detail || error.response.statusText}`);
            }
            throw new Error('Failed to analyze file');
        }
    }

    /**
     * Get analysis status
     * @param {string} taskId - Cuckoo task ID
     */
    async getAnalysisStatus(taskId) {
        try {
            const response = await this.client.get(`/api/analysis/status/${taskId}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get status for task ${taskId}:`, error.message);
            if (error.response) {
                throw new Error(`ML Service error: ${error.response.data.detail || error.response.statusText}`);
            }
            throw new Error('Failed to get analysis status');
        }
    }

    /**
     * Get analysis results
     * @param {string} taskId - Cuckoo task ID
     */
    async getAnalysisResults(taskId) {
        try {
            const response = await this.client.get(`/api/analysis/results/${taskId}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get results for task ${taskId}:`, error.message);
            if (error.response) {
                throw new Error(`ML Service error: ${error.response.data.detail || error.response.statusText}`);
            }
            throw new Error('Failed to get analysis results');
        }
    }

    /**
     * Get list of available models
     */
    async getModels() {
        try {
            const response = await this.client.get('/api/models');
            return response.data;
        } catch (error) {
            logger.error('Failed to get models:', error.message);
            throw new Error('Failed to get available models');
        }
    }
}

// Export singleton instance
module.exports = new MLService();
