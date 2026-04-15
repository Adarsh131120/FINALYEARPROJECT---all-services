// frontend/src/components/FileUpload/FileUpload.jsx

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileUpload } from '../../hooks/useFileUpload';
import './FileUpload.css';

const FileUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const { uploadFile, uploading, uploadProgress, error } = useFileUpload();
  
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/x-msdownload': ['.exe'],
      'application/x-dosexec': ['.exe'],
      'application/octet-stream': ['.dll', '.bat', '.scr', '.com']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  });
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      const result = await uploadFile(selectedFile);
      onUploadSuccess(result.taskId);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };
  
  const handleClear = () => {
    setSelectedFile(null);
  };
  
  return (
    <div className="file-upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        
        {!selectedFile ? (
          <div className="dropzone-content">
            <svg className="upload-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 10L12 5L17 10M12 5V19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="dropzone-text">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="dropzone-subtext">
              Supported: .exe, .dll, .bat (Max 50MB)
            </p>
          </div>
        ) : (
          <div className="selected-file">
            <svg className="file-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
            <div className="file-info">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {!uploading && (
              <button className="clear-btn" onClick={handleClear}>
                ×
              </button>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="progress-text">{uploadProgress}%</p>
        </div>
      )}
      
      {selectedFile && !uploading && (
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Analyze File'}
        </button>
      )}
    </div>
  );
};

export default FileUpload;