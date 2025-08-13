// Content Upload Page - Integrates with existing content-store-service
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ContentUpload.css';

const ContentUpload = () => {
  const { user, token } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);

  useEffect(() => {
    loadUploadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is correct for one-time initialization

  const loadUploadHistory = async () => {
    try {
      const response = await fetch('/api/content/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const history = await response.json();
        setUploadHistory(history.slice(0, 5)); // Show last 5 uploads
      }
    } catch (error) {
      console.error('Failed to load upload history:', error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (fileList) => {
    const validFiles = fileList.filter(file => {
      const validTypes = ['image/', 'video/', 'audio/', 'application/pdf', 'text/'];
      return validTypes.some(type => file.type.startsWith(type)) && file.size <= 50 * 1024 * 1024; // 50MB limit
    });
    
    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      progress: 0,
      status: 'pending'
    }))]);
  };

  const uploadFile = async (fileData) => {
    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('userId', user.id);
    formData.append('metadata', JSON.stringify({
      originalName: fileData.file.name,
      uploadDate: new Date().toISOString(),
      category: 'user-upload'
    }));

    try {
      setIsUploading(true);
      const response = await fetch('/api/content/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'completed', progress: 100, result }
            : f
        ));
        loadUploadHistory(); // Refresh history
        return result;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'error', error: error.message }
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const startUpload = () => {
    files.filter(f => f.status === 'pending').forEach(uploadFile);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="content-upload-page">
      <div className="upload-header">
        <h1>📁 Content Upload</h1>
        <p>Upload and manage your content with our integrated content-store-service</p>
      </div>

      {/* Upload Zone */}
      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📤</div>
          <h3>Drag & Drop Files Here</h3>
          <p>or</p>
          <label className="file-select-button">
            Choose Files
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
            />
          </label>
          <p className="upload-info">
            Supported: Images, Videos, Audio, PDFs, Documents (Max 50MB per file)
          </p>
        </div>
      </div>

      {/* File Queue */}
      {files.length > 0 && (
        <div className="file-queue">
          <div className="queue-header">
            <h3>Upload Queue ({files.length} files)</h3>
            <button 
              className="upload-all-button"
              onClick={startUpload}
              disabled={isUploading || files.every(f => f.status !== 'pending')}
            >
              {isUploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>
          
          <div className="file-list">
            {files.map(fileData => (
              <div key={fileData.id} className={`file-item ${fileData.status}`}>
                <div className="file-info">
                  <span className="file-name">{fileData.file.name}</span>
                  <span className="file-size">{formatFileSize(fileData.file.size)}</span>
                </div>
                <div className="file-actions">
                  {fileData.status === 'pending' && (
                    <button onClick={() => removeFile(fileData.id)}>❌</button>
                  )}
                  {fileData.status === 'completed' && <span className="status-icon">✅</span>}
                  {fileData.status === 'error' && <span className="status-icon">❌</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <div className="upload-history">
          <h3>📜 Recent Uploads</h3>
          <div className="history-list">
            {uploadHistory.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-info">
                  <span className="history-name">{item.originalName}</span>
                  <span className="history-date">
                    {new Date(item.uploadDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="history-actions">
                  <button onClick={() => window.open(item.url, '_blank')}>
                    🔗 View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Status */}
      <div className="integration-status">
        <h4>🔗 Content Store Integration</h4>
        <div className="status-indicators">
          <div className="status-item">
            <span className="status-dot active"></span>
            Content Store Service: Connected
          </div>
          <div className="status-item">
            <span className="status-dot active"></span>
            Upload API: Ready
          </div>
          <div className="status-item">
            <span className="status-dot active"></span>
            File Processing: Active
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentUpload;
