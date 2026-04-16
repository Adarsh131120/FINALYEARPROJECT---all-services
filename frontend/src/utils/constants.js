// frontend/src/utils/constants.js

export const MALWARE_FAMILIES = {
  TROJAN: 'Trojan',
  WORM: 'Worm',
  VIRUS: 'Virus',
  BACKDOOR: 'Backdoor',
  SPYWARE: 'Spyware',
  DOWNLOADER: 'Downloader',
  DROPPER: 'Dropper',
  ADWARE: 'Adware'
};

export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  QUEUED: 'queued',
  UPLOADING: 'uploading',
  ANALYZING: 'analyzing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const THREAT_LEVELS = {
  CRITICAL: { level: 'Critical', color: '#e53e3e', threshold: 0.9 },
  HIGH: { level: 'High', color: '#dd6b20', threshold: 0.7 },
  MEDIUM: { level: 'Medium', color: '#d69e2e', threshold: 0.5 },
  LOW: { level: 'Low', color: '#38a169', threshold: 0 }
};

export const API_ENDPOINTS = {
  UPLOAD: '/api/upload',
  STATUS: '/api/analysis/status',
  RESULT: '/api/analysis/result',
  RECENT: '/api/analysis/recent',
  STATISTICS: '/api/analysis/statistics'
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const POLL_INTERVAL = 3000; // 3 seconds

export const ALLOWED_FILE_TYPES = [
  'application/x-msdownload',
  'application/x-dosexec',
  'application/octet-stream',
  'application/x-executable'
];

export const ALLOWED_EXTENSIONS = ['.exe', '.dll', '.bat', '.scr', '.com', '.msi'];