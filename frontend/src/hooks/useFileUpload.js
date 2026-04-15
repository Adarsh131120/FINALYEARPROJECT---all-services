// frontend/src/hooks/useFileUpload.js

import { useState } from 'react';
import uploadService from '../services/uploadService';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const uploadFile = async (file) => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      const result = await uploadService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      
      setUploading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setUploading(false);
      throw err;
    }
  };
  
  return {
    uploadFile,
    uploading,
    uploadProgress,
    error
  };
};