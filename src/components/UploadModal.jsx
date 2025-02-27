import React, { useState, useEffect } from 'react';
import './UploadModal.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import api from './api';

const UploadModal = ({ activeTab, setInventoryData }) => {
    const [file, setFile] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // State for error messages
    const [loading, setLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        setSuccessMessage(''); // Clear previous success message
        setErrorMessage(''); // Clear previous error message

        // If the active tab is 'TOGS', auto-fill the school name
        if (activeTab === 'TOGS' && selectedFile) {
            const fileNameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '');
            setSchoolName(fileNameWithoutExtension);
        }
    };

    const handleSchoolNameChange = (event) => {
        setSchoolName(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            setErrorMessage('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);


        const token = localStorage.getItem('authToken');
        setLoading(true); // Show loading indicator
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const response = await api.post(apiEndpoint, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setInventoryData(response.data);
            setSuccessMessage('File uploaded successfully!'); // Show success message
            setFile(null); // Clear the file input
            setUploadSuccess(true); // Trigger re-render

            const modalElement = document.getElementById('uploadModal');
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            modal.hide();
        } catch (error) {
            console.error('Error uploading file:', error);
            // Extract error message from response if available
            const errMsg = error.response?.data?.message || 'Error uploading file. Please try again.';
            setErrorMessage(errMsg); // Show error message in red
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };


    useEffect(() => {
        if (uploadSuccess) {
            // Reload the page to reflect new data
            window.location.reload();
        }
    }, [uploadSuccess]);

    return (
        <div className="modal fade" id="uploadModal" tabIndex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="uploadModalLabel">Bulk Upload</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {/* Success Message */}
                        {successMessage && (
                            <div className="alert alert-success" role="alert">
                                {successMessage}
                            </div>
                        )}
                        {/* Error Message */}
                        {errorMessage && (
                            <div className="alert alert-danger" role="alert">
                                {errorMessage}
                            </div>
                        )}
                        {/* Loading Indicator */}
                        {loading && (
                            <div className="text-center mb-3">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3 d-flex flex-column flex-md-row align-items-center">
                                <label htmlFor="formFile" className="form-label me-3">Upload CSV file</label>
                                <label htmlFor="formFile" className="form-label me-3 custom-file-upload">
                                    <input
                                        type="file"
                                        id="formFile"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="form-control"
                                        required
                                    />
                                    <span className="upload-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-upload" viewBox="0 0 16 16">
                                            <path d="M.5 9.9a.5.5 0 0 1 1 0V12h13V9.9a.5.5 0 1 1 1 0V13a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V9.9z" />
                                            <path d="M7.646 1.646a.5.5 0 0 1 .708 0l3 3a.5.5 0 1 1-.708.708L8.5 3.207V10.5a.5.5 0 0 1-1 0V3.207L5.354 5.354a.5.5 0 1 1-.708-.708l3-3z" />
                                        </svg>
                                    </span>
                                    {file && <span className="ms-2">{file.name}</span>}
                                </label>
                            </div>

                            <div className="d-flex justify-content-end">
                                <button type="submit" className="btn btn-light-green" disabled={loading}>
                                    {loading ? 'Uploading...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
