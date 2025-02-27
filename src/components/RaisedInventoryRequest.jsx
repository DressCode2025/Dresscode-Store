import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "./api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";

const RaisedInventoryRequest = () => {
  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [inventoryDetails, setInventoryDetails] = useState([]);
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const fetchInventory = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const apiUrl = `/store/raised-inventory-requests-by-store/${localStorage.getItem("storeId")}`;

    try {
      setLoading(true);
      const response = await api.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setInventoryDetails(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setError("Failed to fetch inventory. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleClick = (raisedInventoryId) => {
    navigate(`/raised-inventory-details/${raisedInventoryId}`);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPage(0); // Reset to first page on filter change
  };

  const getFilteredData = () => {
    return filterStatus
      ? inventoryDetails.filter((item) => item.status === filterStatus)
      : inventoryDetails;
  };

  const getPaginatedData = (data) => {
    const startIndex = page * rowsPerPage;
    return data.slice(startIndex, startIndex + rowsPerPage);
  };

  const handleNextPage = () => {
    if ((page + 1) * rowsPerPage < getFilteredData().length) {
      setPage(page + 1);
    }
  };

  const handleBackPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const InventoryTable = ({ data }) => {
    return (
      <Box sx={{ padding: "20px" }}>
        <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
          <Typography variant="h4" component="h1">
            Raised Inventory Requests
          </Typography>
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>RI.ID</TableCell>
                <TableCell>Date of request</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((product, productIndex) => (
                  <TableRow
                    key={productIndex}
                    onClick={() => handleClick(product.raisedInventoryId)}
                  >
                    <TableCell>{productIndex + 1 + page * rowsPerPage}</TableCell>
                    <TableCell>{product.raisedInventoryId}</TableCell>
                    <TableCell>
                      {new Date(product.raisedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{product.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No Data Available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <div className="main-content">
      <header className="d-flex justify-content-between align-items-center my-3">
        <h2 className="mb-0">Welcome Back, {localStorage.getItem("userName")}</h2>
      </header>
      <p className="text-muted">Here is the information about all your orders</p>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <div className="d-flex gap-2 mb-3">
            {["PENDING", "APPROVED", "REJECTED", "RECEIVED", "DRAFT"].map((status) => (
              <button
                key={status}
                className={`btn ${filterStatus === status ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => handleFilterChange(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="table-responsive">
            <InventoryTable data={getPaginatedData(getFilteredData())} />
          </div>

          <div className="d-flex justify-content-between align-items-center p-3">
            <Button
              variant="contained"
              disabled={page === 0}
              onClick={handleBackPage}
            >
              Back
            </Button>
            <Typography>Page {page + 1}</Typography>
            <Button
              variant="contained"
              disabled={(page + 1) * rowsPerPage >= getFilteredData().length}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default RaisedInventoryRequest;
