// // backend/src/middleware/logger.js

// const winston = require('winston');

// const logger = winston.createLogger({
//   level: process.env.LOG_LEVEL || 'info',
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [
//     new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
//     new winston.transports.File({ filename: 'logs/combined.log' }),
//     new winston.transports.Console({
//       format: winston.format.simple()
//     })
//   ]
// });

// const requestLogger = (req, res, next) => {
//   logger.info({
//     method: req.method,
//     url: req.url,
//     ip: req.ip,
//     userAgent: req.get('user-agent')
//   });
//   next();
// };

// module.exports = { logger, requestLogger };


// backend/src/utils/logger.js

const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'malware-detection-backend' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;