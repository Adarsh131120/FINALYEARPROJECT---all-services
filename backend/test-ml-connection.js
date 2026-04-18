// test-ml-connection.js - Test ML service connection

require('dotenv').config();
const mlService = require('./src/services/mlService');

async function testMLService() {
    console.log('\n==========================================');
    console.log('Testing ML Service Connection');
    console.log('==========================================\n');

    try {
        // Test health check
        console.log('1. Testing health check...');
        const health = await mlService.healthCheck();
        console.log('   ✓ ML Service is healthy:', health);

        // Test prediction with sample data
        console.log('\n2. Testing prediction...');
        const sampleApiSequence = '292,291,292,291,291,291,291,291,291,291,291,291';
        const prediction = await mlService.predict(sampleApiSequence, 'xgboost');
        console.log('   ✓ Prediction result:');
        console.log('     - Malware Family:', prediction.malware_family);
        console.log('     - Confidence:', (prediction.confidence * 100).toFixed(2) + '%');
        console.log('     - Model Used:', prediction.model_used);

        // Test getting available models
        console.log('\n3. Getting available models...');
        try {
            const models = await mlService.getModels();
            console.log('   ✓ Available models:', models);
        } catch (err) {
            console.log('   ⚠ Model list endpoint not available (optional)');
        }

        console.log('\n==========================================');
        console.log('✓ All tests passed!');
        console.log('==========================================\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\nMake sure ML service is running on:', process.env.ML_SERVICE_URL || 'http://localhost:8000');
        process.exit(1);
    }
}

testMLService();
