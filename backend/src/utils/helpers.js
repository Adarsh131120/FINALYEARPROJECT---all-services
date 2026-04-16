// backend/src/utils/helpers.js

const crypto = require('crypto');

/**
 * Generate unique ID
 */
exports.generateId = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Calculate file hash
 */
exports.calculateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Validate file extension
 */
exports.isValidFileExtension = (filename) => {
  const validExtensions = ['.exe', '.dll', '.bat', '.scr', '.com', '.msi'];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return validExtensions.includes(ext);
};

/**
 * Sanitize filename
 */
exports.sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Sleep utility
 */
exports.sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry with exponential backoff
 */
exports.retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      await exports.sleep(delay);
    }
  }
};

/**
 * Format error response
 */
exports.formatError = (error) => {
  return {
    success: false,
    error: error.message || 'An error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
};