import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/AuthContext";
import api from "./api";
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
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Alert,
  TablePagination,
} from "@mui/material";

const Bills = () => {
  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();
  const [error, setError] = useState(null);
  const [billData, setBillData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tabValue, setTabValue] = useState(0); // 0 for Not Edited, 1 for Pending, 2 for Approved, 3 for Rejected
  const [page, setPage] = useState(0); // For pagination
  const [rowsPerPage, setRowsPerPage] = useState(5); // Number of rows per page

  const navigate = useNavigate();

  const fetchBillData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const apiUrl = `/store/get-bills/${localStorage.getItem("storeId")}`;

    try {
      setLoading(true);
      const response = await api.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data.Bills;
      setBillData(data);
      filterData(tabValue, data); // Filter data based on the initial tab value
    } catch (error) {
      console.error("Error fetching BillData:", error);
      setError("Failed to fetch BillData. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillData();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    filterData(newValue, billData); // Filter data based on selected tab
    setPage(0); // Reset to first page on tab change
  };

  // Filter data based on tab selection (0: Not Edited, 1: Pending, 2: Approved, 3: Rejected)
  const filterData = (tabValue, data) => {
    if (tabValue === 0) {
      setFilteredData(data.filter((bill) => bill.editStatus === null)); // Not Edited bills
    } else if (tabValue === 1) {
      setFilteredData(data.filter((bill) => bill.editStatus === "PENDING")); // Pending bills
    } else if (tabValue === 2) {
      setFilteredData(data.filter((bill) => bill.editStatus === "APPROVED")); // Approved bills
    } else if (tabValue === 3) {
      setFilteredData(data.filter((bill) => bill.editStatus === "REJECTED")); // Rejected bills
    }
  };

  const handleClick = (billId) => {
    navigate(`/get-bill-details/${billId}`);
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const BillTable = ({ data }) => {
    return (
      <Box sx={{ padding: "20px" }}>
        <TableContainer
          component={Paper}
          sx={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Billing ID</TableCell>
                <TableCell>Date Of Bill</TableCell>
                <TableCell>Edit Status</TableCell>
                <TableCell>Total Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No Data Available
                  </TableCell>
                </TableRow>
              ) : (
                data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item, index) => (
                    <TableRow
                      key={index}
                      hover
                      onClick={() => handleClick(item.billId)}
                    >
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{item.billId}</TableCell>
                      <TableCell>
                        {new Date(item.dateOfBill).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {item.editStatus === null
                          ? "Not Edited"
                          : item.editStatus === "PENDING"
                          ? "Pending"
                          : item.editStatus === "APPROVED"
                          ? "Approved"
                          : "Rejected"}
                      </TableCell>
                      <TableCell>{item.priceAfterDiscount}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    );
  };

  return (
    <div className="main-content">
      <header className="d-flex justify-content-between align-items-center my-3">
        <h2 className="mb-0">Welcome Back, {userData.name}</h2>
      </header>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="70vh"
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Not Edited" />
            <Tab label="Pending" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
          </Tabs>

          <div className="table-responsive">
            <BillTable data={filteredData} />
          </div>
        </>
      )}
    </div>
  );
};

export default Bills;
