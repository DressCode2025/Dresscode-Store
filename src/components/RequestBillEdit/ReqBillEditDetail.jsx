import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CircularProgress,
  Typography,
  Paper,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import api from "../api"; // Assuming axios instance is set up
import BackButton from "../BackButton";

const ReqBillEditDetail = () => {
  const { editBillReqId } = useParams(); // Get the editBillReqId from the route
  const [billDetails, setBillDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken"); // Get token from local storage

    const fetchBillDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/store/get-bill-edit-req-details/${editBillReqId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass token in headers
            },
          }
        );
        setBillDetails(response.data.result); // Store both current and requested bills
      } catch (err) {
        setError("Failed to fetch bill details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (editBillReqId) {
      fetchBillDetails();
    }
  }, [editBillReqId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!billDetails) {
    return <Typography>No bill details found.</Typography>;
  }

  const { currentBill, requestedBillEdit } = billDetails;

  const handleDownloadInvoice = async (invoiceUrl) => {
    if (invoiceUrl) {
      try {
        const response = await fetch(invoiceUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", `${currentBill.invoiceNo}.pdf`); // Set the desired file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up by removing the link
      } catch (error) {
        alert("Failed to download invoice: " + error.message);
      }
    } else {
      alert("Invoice URL not available.");
    }
  };

  return (
    <div className="main-content">

      <BackButton></BackButton>

      <header className="d-flex justify-content-between align-items-center my-3">
        <h2 className="mb-0">
          Welcome Back, {localStorage.getItem("userName")}
        </h2>
      </header>

      <Paper sx={{ padding: "20px", marginTop: "20px" }}>
        <Typography variant="h6" gutterBottom>
          Bill Edit Request Details
        </Typography>

        {/* Current Bill Details */}
        <Box mb={2}>
          <Typography variant="h6">Current Bill</Typography>
          <Typography>
            <strong>Store ID:</strong> {currentBill.storeId}
          </Typography>
          <Typography>
            <strong>Date of Bill:</strong>{" "}
            {new Date(currentBill.dateOfBill).toLocaleString()}
          </Typography>
          <Typography>
            <strong>Total Amount:</strong> ₹{currentBill.TotalAmount}
          </Typography>
          <Typography>
            <strong>Discount Percentage:</strong>{" "}
            {currentBill.discountPercentage}%
          </Typography>
          <Typography>
            <strong>Price After Discount:</strong> ₹
            {currentBill.priceAfterDiscount}
          </Typography>
          <Typography>
            <strong>Edit Status:</strong> {currentBill.editStatus}
          </Typography>
          <Button
            sx={{
              backgroundColor: "green",
              color: "white",
              "&:hover": { backgroundColor: "darkgreen" },
            }}
            onClick={() => handleDownloadInvoice(currentBill.invoiceUrl)}
          >
            {requestedBillEdit.isApproved
              ? "Download Old Invoice"
              : "Download Current Invoice"}
          </Button>
        </Box>

        {/* Current Bill Product Details */}
        <Box mb={2}>
          <Typography variant="h6">Current Bill Product Details</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Product</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Category</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Sub-category</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Fit</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Material</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Color</strong>
                  </TableCell>
                  <TableCell>
                    <strong>StyleCoat</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Size</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Billed Quantity</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentBill.products.map((product) =>
                  product.variants.map((variant) =>
                    variant.variantSizes.map((size) => (
                      <TableRow key={size._id}>
                        <TableCell>{product.productType}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.subCategory}</TableCell>
                        <TableCell>{product.fit}</TableCell>
                        <TableCell>{product.material}</TableCell>
                        <TableCell>{variant.color.name}</TableCell>
                        <TableCell>{size.styleCoat}</TableCell>
                        <TableCell>{size.size}</TableCell>
                        <TableCell>{size.billedQuantity}</TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Requested Bill Edit Details */}
        <Box mb={2}>
          <Typography variant="h6">Requested Bill Edit</Typography>
          <Typography>
            <strong>Store ID:</strong> {requestedBillEdit.storeId}
          </Typography>
          <Typography>
            <strong>Date of Bill Edit Request:</strong>{" "}
            {new Date(requestedBillEdit.dateOfBillEditReq).toLocaleString()}
          </Typography>
          <Typography>
            <strong>Total Amount:</strong> ₹{requestedBillEdit.TotalAmount}
          </Typography>
          <Typography>
            <strong>Discount Percentage:</strong>{" "}
            {requestedBillEdit.discountPercentage}%
          </Typography>
          <Typography>
            <strong>Price After Discount:</strong> ₹
            {requestedBillEdit.priceAfterDiscount}
          </Typography>
          <Typography>
            <strong>Is Approved:</strong>{" "}
            {requestedBillEdit.isApproved === null
              ? "Pending"
              : requestedBillEdit.isApproved
                ? "Approved"
                : "Rejected"}
          </Typography>
          {requestedBillEdit.isApproved && (
            <Button
              sx={{
                backgroundColor: "green",
                color: "white",
                "&:hover": { backgroundColor: "darkgreen" },
              }}
              onClick={() =>
                handleDownloadInvoice(requestedBillEdit.approvedInvoiceUrl)
              }
            >
              Download Requested New Invoice
            </Button>
          )}
        </Box>

        {/* Requested Bill Edit Product Details */}
        <Box mb={2}>
          <Typography variant="h6">
            Requested Bill Edit Product Details
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Product</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Category</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Sub-category</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Fit</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Material</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Color</strong>
                  </TableCell>
                  <TableCell>
                    {" "}
                    <strong>StyleCoat</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Size</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Billed Quantity</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requestedBillEdit.products.map((product) =>
                  product.variants.map((variant) =>
                    variant.variantSizes.map((size) => (
                      <TableRow key={size._id}>
                        <TableCell>{product.productType}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.subCategory}</TableCell>
                        <TableCell>{product.fit}</TableCell>
                        <TableCell>{product.material}</TableCell>
                        <TableCell>{variant.color.name}</TableCell>
                        <TableCell>{size.styleCoat}</TableCell>
                        <TableCell>{size.size}</TableCell>

                        <TableCell>{size.billedQuantity}</TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box
          sx={{
            padding: 2,
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            marginTop: "16px",
          }}
        >
          <div>
            <h5>Note:</h5>
            {currentBill.editStatus === "PENDING" && (
              <h6>{requestedBillEdit.reqNote}</h6>
            )}
            {requestedBillEdit.isApproved && (
              <h6>{requestedBillEdit.validateNote}</h6>
            )}
          </div>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => window.history.back()} // Navigate back to the previous page
        >
          Go Back
        </Button>
      </Paper>
    </div>
  );
};

export default ReqBillEditDetail;
