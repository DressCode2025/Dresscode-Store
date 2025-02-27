import React, { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import api from "./api";

const FileInput = styled("input")({
  display: "none",
});

const RaiseInventory = () => {
  const [file, setFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setSuccessMessage(""); // Clear previous success message
    setErrorMessage(""); // Clear previous error message
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("storeId", localStorage.getItem("storeId"));
    formData.append("storeName", localStorage.getItem("storeName"));

    const token = localStorage.getItem("authToken");
    setLoading(true); // Show loading indicator
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await api.post(
        "/store/raise-inventory-request",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccessMessage("File uploaded successfully!"); // Show success message
      setFile(null); // Clear the file input
      setUploadSuccess(true); // Trigger re-render
    } catch (error) {
      console.error("Error uploading file:", error);
      const errMsg =
        error.response?.data?.message ||
        "Error uploading file. Please try again.";
      setErrorMessage(errMsg); // Show error message
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
    <div className="main-content" style={{ padding: "20px" }}>


      <header className="d-flex justify-content-between align-items-center my-3">
        <h2 className="mb-0">Welcome Back, {localStorage.getItem("userName")}</h2>
      </header>

      <Typography variant="h5" gutterBottom>
        Please Upload Your Inventory Requirements
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">Upload CSV file</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <label htmlFor="formFile">
              <FileInput
                id="formFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
              <Button variant="contained" component="span" color="primary">
                Upload File
              </Button>
              {file && <span style={{ marginLeft: "10px" }}>{file.name}</span>}
            </label>
          </Grid>
        </Grid>

        {successMessage && (
          <Typography color="success" variant="body2">
            {successMessage}
          </Typography>
        )}
        {errorMessage && (
          <Typography color="error" variant="body2">
            {errorMessage}
          </Typography>
        )}

        <Grid container justifyContent="flex-end" style={{ marginTop: "20px" }}>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Submit"}
          </Button>
        </Grid>
      </form>
    </div>
  );
};

export default RaiseInventory;
