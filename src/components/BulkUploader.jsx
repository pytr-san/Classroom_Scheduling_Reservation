import React, { useState } from 'react';
import axios from 'axios';
import './BulkUpload.css';

import { toast, Toaster } from 'react-hot-toast';

const BulkUploader = ({ courseId }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    const invalidFiles = selectedFiles.filter(file => file.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
      toast.error('Only PDF files are allowed');
    }
    setFiles(selectedFiles);
    setProgress(0);
  };
  
  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };
  
  const handleUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('courseId', courseId);

    try {
      setUploading(true);
      const res = await axios.post('http://localhost:8000/api/bulk-upload', formData, {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(res.data.message);
      setFiles([]); // Clear files after successful upload
      setProgress(0); // Reset progress
    } catch (err) {
      console.error(err);
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
        <div className="upload-container">
        <h2>Bulk Upload PDFs</h2>

        <input type="file" multiple accept="application/pdf" onChange={handleFileChange} className="file-input" />
        <span className="file-count">
          {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : ''}
        </span>
        {files.length > 0 && (
          <div className="file-list">
            <h4>Selected Files:</h4>
            <ul>
              {files.map((file, idx) => (
                <li key={idx} className="file-item">{file.name}
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveFile(idx)}
                    title="Remove"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {uploading && (
          <div className="progress-container">
            <div className="progress-bar-background">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p>{progress}%</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="upload-button"
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>

        
      </div>
  );
};

export default BulkUploader;
