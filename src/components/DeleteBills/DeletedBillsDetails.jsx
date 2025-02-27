import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../../context/AuthContext";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import BackButton from "../BackButton";
import {
  Paper,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";

const DeletedBillDetails = () => {
  const { billId } = useParams(); // Get billId from the URL
  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();
  const [error, setError] = useState(null);
  const [billData, setBillData] = useState(null);
  const navigate = useNavigate();

  const fetchDeletedBillData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const apiUrl = `/store/get-bill-details/${billId}`;

    try {
      setLoading(true);
      const response = await api.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data.result;
      setBillData(data);
    } catch (error) {
      console.error("Error fetching Deleted Bill Data:", error);
      setError("Failed to fetch Deleted Bill Data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedBillData();
  }, []);

  const DeletedBillTable = ({ data }) => {
    return (
      <>

        <Paper sx={{ mt: 4, p: 3 }}>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">
                <strong>Customer Name:</strong> {data?.customer?.customerName || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">
                <strong>Customer Phone:</strong> {data?.customer?.customerPhone || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">
                <strong>Customer Email:</strong> {data?.customer?.customerEmail || "N/A"}
              </Typography>
            </Grid>
          </Grid>

          {/* <div className="d-flex gap-4 flex-wrap">
            <h4 className="fs-6">
              Customer Name: {data?.customer?.customerName || "N/A"}
            </h4>
            <h4 className="fs-6">
              Customer Phone no: {data?.customer?.customerPhone || "N/A"}
            </h4>
            <h4 className="fs-6">
              Customer Email ID: {data?.customer?.customerEmail || "N/A"}
            </h4>
          </div> */}

          <Box sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}>

            <Typography variant="h6" gutterBottom>
              Particular Bill Details
            </Typography>

            <Divider />


            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <Typography variant="body2">Billing ID</Typography>
                <Typography variant="body1">{data?.billId || "N/A"}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">Date Of Bill</Typography>
                <Typography variant="body1">
                  {data?.dateOfBill
                    ? new Date(data.dateOfBill).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">Date Of Bill Delete Request</Typography>
                <Typography variant="body1">
                  {data?.dateOfDeleteBillReq
                    ? new Date(data.dateOfDeleteBillReq).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">Delete Request Status</Typography>
                <Typography variant="body1">
                  {data?.deleteReqStatus || "N/A"}
                </Typography>
              </Grid>
            </Grid>

          </Box>

          {/* <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                    <TableCell>Billing ID</TableCell>
                    <TableCell>Date Of Bill</TableCell>
                    <TableCell>Date Of Bill Delete Request</TableCell>
                    <TableCell>Delete Request Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{data?.billId || "N/A"}</TableCell>
                    <TableCell>
                      {data?.dateOfBill
                        ? new Date(data.dateOfBill).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {data?.dateOfDeleteBillReq
                        ? new Date(data.dateOfDeleteBillReq).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>{data?.deleteReqStatus || "N/A"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer> */}

          {/* Product Table */}
          <Typography variant="h6" sx={{ mt: 3 }}>
            Products
          </Typography>

          <TableContainer
            component={Paper} sx={{ mt: 1 }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: "#333" }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>P ID</TableCell>
                  <TableCell sx={{ color: "#fff" }}>P Category</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Gender</TableCell>
                  <TableCell sx={{ color: "#fff" }}>P Name</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Color</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Size</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Price</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Quantity</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Sub Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.products?.length > 0 ? (
                  data.products.map((product) =>
                    product.variants.map((variant) =>
                      variant.variantSizes.map((size) => (
                        <TableRow
                          key={`${product.productId}-${variant.color.name}-${size.size}`}
                        >
                          <TableCell>{product.productId}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.gender}</TableCell>
                          <TableCell>{product.productType}</TableCell>
                          <TableCell>{variant.color.name}</TableCell>
                          <TableCell>{size.size}</TableCell>
                          <TableCell>{product.price}</TableCell>
                          <TableCell>{size.billedQuantity}</TableCell>
                          <TableCell>
                            {product.price * size.billedQuantity}
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No Data Available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Typography variant="body1">
              <strong>Total Price:</strong> {data?.TotalAmount || "N/A"}
            </Typography>

            <Typography variant="body1">
              <strong>Discount %:</strong> {data?.discountPercentage || "N/A"}
            </Typography>

            <Typography variant="body1">
              <strong>Note:</strong> {data?.RequestedBillDeleteNote || "N/A"}
            </Typography>

            <Typography variant="body1">
              <strong>Price After Discount:</strong> {data?.priceAfterDiscount || "N/A"}
            </Typography>
          </Box>
        </Paper >
      </>
    );
  };

  return (
    <div className="main-content">
      <BackButton></BackButton>
      <header className="d-flex justify-content-between align-items-center my-3">
        <h2 className="mb-0">
          Welcome Back, {localStorage.getItem("userName")}
        </h2>
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
        <div className="table-responsive">
          <DeletedBillTable data={billData} />
        </div>
      )}
    </div>
  );
};

export default DeletedBillDetails;
