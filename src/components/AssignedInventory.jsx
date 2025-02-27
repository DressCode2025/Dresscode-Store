import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/AuthContext";
import api from "./api";
import { useNavigate } from "react-router-dom";
import {
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
} from "@mui/material";

const AssignedInventory = () => {
  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();
  const [error, setError] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ASSIGNED");
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const fetchInventory = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const apiUrl = `/store/assigned-inventories/${localStorage.getItem("storeId")}`;

    try {
      setLoading(true);
      const response = await api.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data.assignedInventories;
      setInventoryData(data);
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

  const handleClick = (assignedInventoryId) => {
    navigate(`/assign-inventory/${assignedInventoryId}`);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPage(0); // Reset to first page on filter change
  };

  const getFilteredData = () => {
    if (filterStatus) {
      return inventoryData.filter((item) => item.status === filterStatus);
    }
    return inventoryData;
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
      <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>A I.ID</TableCell>
              <TableCell>Date Of Assign</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No Data Available
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow
                  key={index}
                  hover
                  onClick={() => handleClick(item.assignedInventoryId)}
                >
                  <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                  <TableCell>{item.assignedInventoryId}</TableCell>
                  <TableCell>{new Date(item.assignedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div className="main-content">
      <header className="d-flex justify-content-between align-items-center my-3">
        <h2 className="mb-0">Welcome Back, {localStorage.getItem("userName")}</h2>
      </header>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <div className="d-flex gap-2 mb-3">
            <button
              className={`btn ${filterStatus === "ASSIGNED" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => handleFilterChange("ASSIGNED")}
            >
              Assigned
            </button>
            <button
              className={`btn ${filterStatus === "RECEIVED" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => handleFilterChange("RECEIVED")}
            >
              Received
            </button>
          </div>

          <div className="table-responsive">
            <InventoryTable data={getPaginatedData(getFilteredData())} />
          </div>

          <div className="d-flex justify-content-between align-items-center p-3">
            <button
              className="btn btn-secondary"
              disabled={page === 0}
              onClick={handleBackPage}
            >
              Back
            </button>
            <span>Page {page + 1}</span>
            <button
              className="btn btn-secondary"
              disabled={(page + 1) * rowsPerPage >= getFilteredData().length}
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AssignedInventory;
