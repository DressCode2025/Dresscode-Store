import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/AuthContext";
import api from "./api";
import { Link, useParams, useNavigate } from "react-router-dom";
import BackButton from "./BackButton";

import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

const AssignedInventoryDetails = () => {
  const { assignedInventoryId } = useParams(); // Get groupName from the URL

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();
  const [error, setError] = useState(null);

  const [inventoryDetails, setInventoryDetails] = useState();

  const fetchInventory = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const apiUrl = `/store/assigned-inventory-details/${assignedInventoryId}`;

    try {
      setLoading(true);
      const response = await api.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data;

      setInventoryDetails(data);
      // console.log("inventory", data)
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

  const InventoryTable = ({ data }) => {
    // Check if data is defined and has products
    const totalPrice =
      data && data.products
        ? data.products.reduce((total, product) => {
          const variantTotal = product.variants.reduce(
            (variantSum, variant) => {
              const sizeTotal = variant.variantSizes.reduce(
                (sizeSum, size) => {
                  return sizeSum + size.quantity * product.price;
                },
                0
              );
              return variantSum + sizeTotal;
            },
            0
          );

          return total + variantTotal;
        }, 0)
        : 0; // Default totalPrice to 0 if data or products are undefined

    return (
      <Box sx={{ padding: "20px" }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
          <Typography variant="h4" component="h1">
            Particular Assigned Inventory Details
          </Typography>
        </Box>

        {/* Inventory Details */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                <TableCell>A I.ID</TableCell>
                <TableCell>Date Of Assign</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  {data?.assignedInventoryId ? data.assignedInventoryId : "N/A"}
                </TableCell>
                <TableCell>
                  {data?.assignedDate
                    ? new Date(data.assignedDate).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>{data?.Status ? data.Status : "N/A"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Product Table */}
        <TableContainer
          component={Paper}
          sx={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>P ID</TableCell>
                <TableCell>P Category</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>P Name</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Sub Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.products ? (
                data.products.map((product, productIndex) =>
                  product.variants.map((variant, variantIndex) =>
                    variant.variantSizes.map((size, sizeIndex) => (
                      <TableRow
                        key={`${productIndex}-${variantIndex}-${sizeIndex}`}
                      >
                        <TableCell>{product.productId}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.gender}</TableCell>
                        <TableCell>{product.productType}</TableCell>
                        <TableCell>{variant.color}</TableCell>
                        <TableCell>{size.size}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>{size.quantity}</TableCell>
                        <TableCell>{product.price * size.quantity}</TableCell>
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

        {/* Total Price */}
        <Box sx={{ textAlign: "right", marginTop: "20px", fontWeight: "bold" }}>
          <Typography variant="h6">
            Total Price: ₹{totalPrice.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    );
  };

  const handleClick = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return; // Exit if token doesn't exist

    try {
      setLoading(true);

      // Correctly structure the axios request
      await api.patch(
        `/store/receive-inventory/${assignedInventoryId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Navigate after successful patch request
      navigate("/assign-inventory");
    } catch (error) {
      console.error("Error receiving:", error);
      setError("Failed receiving. Please try again later.");
    } finally {
      setLoading(false);
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
          <div className="table-responsive">
            <InventoryTable data={inventoryDetails} />
          </div>
          <div className="d-flex justify-content-center align-items-center my-3">
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => handleClick()}
            >
              Receive
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AssignedInventoryDetails;
