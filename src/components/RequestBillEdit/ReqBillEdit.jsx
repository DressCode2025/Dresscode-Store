import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Assuming you're using react-router for navigation
import api from "../api"; // Assuming you have an axios instance setup

const ReqBillEdit = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [billsPerPage] = useState(10); // 10 items per page
  const [storeId, setStoreId] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0); // Tab index (0: Pending, 1: Approved, 2: Rejected)

  const navigate = useNavigate(); // useNavigate hook for navigation

  useEffect(() => {
    // Get storeId and token from local storage
    const storedStoreId = localStorage.getItem("storeId");
    const token = localStorage.getItem("authToken"); // Assuming token is stored under 'token'
    setStoreId(storedStoreId);

    if (storedStoreId && token) {
      const fetchBills = async () => {
        setLoading(true);
        try {
          const response = await api.get(
            `/store/get-bill-edit-reqs/${storedStoreId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`, // Pass token in headers
              },
            }
          );
          setBills(response.data.Bills);
        } catch (error) {
          console.error("Error fetching bills:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchBills();
    } else {
      console.error("No storeId or token found in localStorage");
      setLoading(false);
    }
  }, []);

  // Filter bills based on selected tab
  const filteredBills = bills.filter((bill) => {
    if (selectedTab === 0) return bill.isApproved === null; // Pending
    if (selectedTab === 1) return bill.isApproved === true; // Approved
    return bill.isApproved === false; // Rejected
  });

  // Pagination Logic
  const indexOfLastBill = currentPage * billsPerPage;
  const indexOfFirstBill = indexOfLastBill - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Handle row click and navigate to a detailed view page
  const handleRowClick = (editBillReqId) => {
    navigate(`/req-bills-edit/${editBillReqId}`); // Assuming you have a route to view bill details
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setCurrentPage(1); // Reset to the first page when switching tabs
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!storeId) {
    return <Typography>No storeId found in local storage.</Typography>;
  }

  return (
    <div className="main-content">
      <header className="d-flex justify-content-between align-items-center my-3">
        <h2 className="mb-0">
          Welcome Back, {localStorage.getItem("userName")}
        </h2>
      </header>

      <Paper sx={{ padding: "20px" }}>
        <Typography variant="h6" gutterBottom>
          Bill Edit Requests
        </Typography>

        {/* Tabs for Pending, Approved, and Rejected */}
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>

        {/* Table with filtered data */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Date of Bill</TableCell>
                <TableCell>Date of Bill Edit Request</TableCell>
                <TableCell>Is Approved</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentBills.map((bill) => (
                <TableRow
                  key={bill.editBillReqId}
                  onClick={() => handleRowClick(bill.editBillReqId)}
                  sx={{ cursor: "pointer" }} // Changes cursor to pointer on hover
                  hover
                >
                  <TableCell>{bill.editBillReqId}</TableCell>
                  <TableCell>
                    {new Date(bill.dateOfBill).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(bill.dateOfBillEditReq).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {bill.isApproved === null
                      ? "Pending"
                      : bill.isApproved
                      ? "Approved"
                      : "Rejected"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Pagination
          count={Math.ceil(filteredBills.length / billsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          sx={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
        />
      </Paper>
    </div>
  );
};

export default ReqBillEdit;
