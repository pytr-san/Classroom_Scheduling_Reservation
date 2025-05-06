import React, { useState, useEffect  } from 'react';
import  axiosInstance  from './../axios.jsx';
import './BulkUpload.css';
import useAuth from "../Hooks/useAuth";
import { toast } from 'react-hot-toast';
import { Modal, Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const BulkUploader = ({ courseId }) => {
  const { auth } = useAuth();
  const token = auth?.token;
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);

  const fetchFiles = async () => {
    try {
console.log("USer token:", token);
      const res = await axiosInstance.get(`/api/view-files?courseId=${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }});
      setUploadedFiles(res.data);
    } catch (error) {
      const errorMessage = error.res?.data?.error || 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [courseId]);

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    const validFiles = selectedFiles.filter(file => file.type === 'application/pdf');

    const newFiles = validFiles.filter(
      (file) => !files.some(f => f.name === file.name && f.size === file.size)
    );

    if (newFiles.length < validFiles.length) {
      toast.error('Some files were already selected.');
    }
  
    setFiles(prev => [...prev, ...newFiles]);
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
      const res = await axiosInstance.post('/api/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        }
      });

      toast.success(res.data.message);
      setFiles([]); 
      setProgress(0); 
    } catch (err) {
      console.error('Upload Error:', err);

      if (err.response) {
        const errorMessage = err.response.data?.message || 'Something went wrong on the server.';
        
        if (err.response.status === 413) {
          toast.error('File too large. Max size is 10MB.');
        } else if (err.response.status === 401) {
          toast.error('Unauthorized! Please log in again.');
        } else if (err.response.status === 404) {
          toast.error('Upload endpoint not found.');
        } else if (err.response.status === 500) {
          toast.error('Server error occurred. Please try again later.');
        } else {
          toast.error(errorMessage); 
        }
      } else if (err.request) {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error('Error during file upload.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm  = async () => {
    try {

      await axiosInstance.delete(`/api/delete-file/${selectedFileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      toast.success('File deleted');
      fetchFiles(); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete file');
    }
    setShowModal(false);
  };


  const handleDeleteClick = (fileId) => {
    setSelectedFileId(fileId);
    setShowModal(true);
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

        <h3 className="mt-4">Uploaded Files</h3>
        {loading ? (
          <p>Loading...</p>
        ) : uploadedFiles.length === 0 ? (
          <p className="text-muted">No files have been uploaded yet.</p>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Course</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map(file => (
                <tr key={file.id}>
                  <td>{file.filename}</td>
                  <td>{file.course_name}</td>
                  <td>{new Date(file.created_at).toLocaleString()}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteClick(file.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}


         <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this file?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      </div>
  );
};

export default BulkUploader;
