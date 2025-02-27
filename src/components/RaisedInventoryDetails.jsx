import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/AuthContext";
import api from "./api";
import { useParams, useNavigate } from "react-router-dom";
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import BackButton from "./BackButton"

const RaisedInventoryDetails = () => {
  const { raisedInventoryId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [raisedDetails, setRaisedDetails] = useState(null);
  const [filter, setFilter] = useState("All"); // Added filter state

  const fetchInventory = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const apiUrl = `/store/raised-inventory-details/${raisedInventoryId}`;

    try {
      setLoading(true);
      const response = await api.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setRaisedDetails(response.data);
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

  const handleClick = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      setLoading(true);
      await api.patch(
        `/store/receive-inventory-request/${raisedInventoryId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      navigate("/raised-request");
      // window.location.reload();
    } catch (error) {
      console.error("Error receiving:", error);
      setError("Failed receiving. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic for filtering products based on the selected filter
  const filterProducts = (products) => {
    switch (filter) {
      case "Approved":
        return products
          .map((product) => {
            const filteredVariants = product.variants
              .map((variant) => {
                const filteredSizes = variant.variantSizes.filter(
                  (size) => size.isApproved
                );
                return { ...variant, variantSizes: filteredSizes };
              })
              .filter((variant) => variant.variantSizes.length > 0);

            return { ...product, variants: filteredVariants };
          })
          .filter((product) => product.variants.length > 0);

      case "Not Approved":
        return products
          .map((product) => {
            const filteredVariants = product.variants
              .map((variant) => {
                const filteredSizes = variant.variantSizes.filter(
                  (size) => !size.isApproved
                );
                return { ...variant, variantSizes: filteredSizes };
              })
              .filter((variant) => variant.variantSizes.length > 0);

            return { ...product, variants: filteredVariants };
          })
          .filter((product) => product.variants.length > 0);

      case "Approved and Received":
        return products
          .map((product) => {
            const filteredVariants = product.variants
              .map((variant) => {
                const filteredSizes = variant.variantSizes.filter(
                  (size) => size.isApproved && size.isReceived
                );
                return { ...variant, variantSizes: filteredSizes };
              })
              .filter((variant) => variant.variantSizes.length > 0);

            return { ...product, variants: filteredVariants };
          })
          .filter((product) => product.variants.length > 0);

      case "Approved and Not Received":
        return products
          .map((product) => {
            const filteredVariants = product.variants
              .map((variant) => {
                const filteredSizes = variant.variantSizes.filter(
                  (size) => size.isApproved && !size.isReceived
                );
                return { ...variant, variantSizes: filteredSizes };
              })
              .filter((variant) => variant.variantSizes.length > 0);

            return { ...product, variants: filteredVariants };
          })
          .filter((product) => product.variants.length > 0);

      default:
        return products;
    }
  };

  const InventoryTable = ({ data }) => {
    const filteredProducts = filterProducts(data?.products || []);

    return (
      <Box sx={{ padding: "20px" }}>
        <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
          <Typography variant="h4" component="h1">
            Particular Raised Inventory Request
          </Typography>
        </Box>

        {/* Filters dropdown */}
        <Box sx={{ marginBottom: "20px" }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)} // Update filter state
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Not Approved">Not Approved</MenuItem>
              <MenuItem value="Approved and Received">
                Approved and Received
              </MenuItem>
              <MenuItem value="Approved and Not Received">
                Approved and Not Received
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                <TableCell>A I.ID</TableCell>
                <TableCell>Date of request</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{data?.raisedInventoryId || "N/A"}</TableCell>
                <TableCell>
                  {data?.raisedDate
                    ? new Date(data.raisedDate).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>{data?.Status || "N/A"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

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
                <TableCell>isApproved</TableCell>
                <TableCell>isReceived</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, productIndex) =>
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
                        <TableCell>{size.isApproved ? "✓" : "✗"}</TableCell>
                        <TableCell>{size.isReceived ? "✓" : "✗"}</TableCell>
                      </TableRow>
                    ))
                  )
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    No Data Available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ textAlign: "right", marginTop: "20px", fontWeight: "bold" }}>
          <Typography variant="h6">
            Total Price: ₹{data?.totalAmountRaised?.toLocaleString() || "N/A"}
          </Typography>
        </Box>
      </Box>
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
        <>
          <div className="table-responsive">
            <InventoryTable data={raisedDetails} />
          </div>

          {/* Conditionally render the "Receive" button */}
          {raisedDetails?.Status === "APPROVED" ||
            raisedDetails?.Status === "DRAFT" ? (
            <div className="d-flex justify-content-center align-items-center my-3">
              <button
                className="btn btn-outline-primary me-2"
                onClick={handleClick}
              >
                Receive
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default RaisedInventoryDetails;
