// backend/src/middleware/validation.js

const Joi = require('joi');

/**
 * Validate file upload
 */
exports.validateUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }
  
  const schema = Joi.object({
    originalname: Joi.string().required(),
    mimetype: Joi.string().valid(
      'application/x-msdownload',
      'application/x-dosexec',
      'application/octet-stream'
    ).required(),
    size: Joi.number().max(50 * 1024 * 1024).required() // 50MB
  });
  
  const { error } = schema.validate({
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  next();
};

/**
 * Validate task ID
 */
exports.validateTaskId = (req, res, next) => {
  const schema = Joi.object({
    taskId: Joi.string().uuid().required()
  });
  
  const { error } = schema.validate(req.params);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task ID format'
    });
  }
  
  next();
};