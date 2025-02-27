import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import api from "../api"; // Update with your API module path

const DeletedBills = () => {
  const [deletedBills, setDeletedBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]); // To store bills based on selected tab
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10); // Keep rows per page fixed at 10
  const [selectedTab, setSelectedTab] = useState(0); // To track selected tab
  const navigate = useNavigate(); // Hook to access the navigate function

  useEffect(() => {
    const fetchDeletedBills = async () => {
      const storeId = localStorage.getItem("storeId");
      const token = localStorage.getItem("authToken"); // Get the token from local storage
      if (!storeId || !token) return;

      try {
        const response = await api.get(`/store/get-deleted-bills/${storeId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the request headers
            "Content-Type": "application/json",
          },
        });
        if (response.status === 200) {
          setDeletedBills(response.data.deletedBills);
          setFilteredBills(
            response.data.deletedBills.filter(
              (bill) => bill.deleteReqStatus === "PENDING"
            )
          ); // Initially filter for PENDING bills
        } else {
          setError("Failed to fetch deleted bills.");
        }
      } catch (err) {
        setError("An error occurred while fetching deleted bills.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedBills();
  }, []);

  const handleRowClick = (billId) => {
    // Navigate to the detailed view of the clicked bill
    navigate(`/deleted-bill-details/${billId}`); // Update with the desired route for bill details
  };

  const handleNextPage = () => {
    if ((page + 1) * rowsPerPage < filteredBills.length) {
      setPage(page + 1);
    }
  };

  const handleBackPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPage(0); // Reset page to 0 when switching tabs

    // Filter bills based on selected tab
    let status = "";
    if (newValue === 0) status = "PENDING";
    else if (newValue === 1) status = "REJECTED";
    else if (newValue === 2) status = "APPROVED";

    const filtered = deletedBills.filter(
      (bill) => bill.deleteReqStatus === status
    );
    setFilteredBills(filtered);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // Slice the filteredBills for pagination
  const currentBills = filteredBills.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="main-content">
      <header className="d-flex justify-content-between align-items-center my-3">
        <h2 className="mb-0">
          Welcome Back, {localStorage.getItem("userName")}
        </h2>
      </header>

      <Paper>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Deleted Bills
        </Typography>

        {/* Tabs for filtering by status */}
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="PENDING" />
          <Tab label="REJECTED" />
          <Tab label="APPROVED" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bill ID</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Discount Percentage</TableCell>
                <TableCell>Price After Discount</TableCell>
                <TableCell>Date of Bill</TableCell>
                <TableCell>Request Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentBills.map((bill) => (
                <TableRow
                  key={bill._id}
                  onClick={() => handleRowClick(bill.billId)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>{bill.billId}</TableCell>
                  <TableCell>{bill.TotalAmount}</TableCell>
                  <TableCell>{bill.discountPercentage}%</TableCell>
                  <TableCell>{bill.priceAfterDiscount}</TableCell>
                  <TableCell>
                    {new Date(bill.dateOfBill).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(bill.dateOfDeleteBillReq).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {filteredBills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>No bills available for this status.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="d-flex justify-content-between align-items-center p-3">
          <Button
            variant="contained"
            disabled={page === 0} // Disable the back button on the first page
            onClick={handleBackPage}
          >
            Back
          </Button>
          <Typography>Page {page + 1}</Typography>
          <Button
            variant="contained"
            disabled={(page + 1) * rowsPerPage >= filteredBills.length} // Disable if no more pages
            onClick={handleNextPage}
          >
            Next
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default DeletedBills;
