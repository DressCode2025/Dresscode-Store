import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "./api";
import { useAuth } from "../context/AuthContext";
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
  Pagination,
} from "@mui/material";

const MainScreen = () => {
  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();
  const [error, setError] = useState(null);
  const [inventoryDetails, setInventoryDetails] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 items per page

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Flatten the inventory details for easier pagination
  const flattenedInventory = inventoryDetails.flatMap(product =>
    product.variants.flatMap(variant =>
      variant.variantSizes.map(size => ({
        productId: product.productId,
        category: product.category,
        productType: product.productType,
        gender: product.gender,
        pattern: product.pattern,
        color: variant.color,
        size: size.size,
        price: product.price,
        quantity: size.quantity,
      }))
    )
  );

  // Slice the flattened inventory for current pagination
  const currentInventory = flattenedInventory.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const fetchInventory = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const apiUrl = `store/get-products/${localStorage.getItem("storeId")}`;

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
    setLoading(true);
    try {
      const response = await api.get(
        `/store/downloadInventory/${localStorage.getItem("storeId")}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Create a blob URL from the response
      const blob = new Blob([response.data], { type: response.data.type });
      const downloadUrl = URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "inventory.csv";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error generating label:", error);
      alert("Error generating label.");
    } finally {
      setLoading(false);
    }
  };

  const InventoryTable = ({ data, currentPage, itemsPerPage }) => {
    // Calculate starting index based on current page
    const startingIndex = (currentPage - 1) * itemsPerPage;

    return (
      <Box sx={{ padding: "20px" }}>
        <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
          <Typography variant="h4" component="h1">
            Particular Assigned Inventory Details
          </Typography>
        </Box>

        <TableContainer
          component={Paper}
          // sx={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Product Category</TableCell>
                <TableCell>Garment Name</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Pattern</TableCell>
                <TableCell>Garment Color</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{startingIndex + index + 1}</TableCell> {/* Updated here */}
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.productType}</TableCell>
                    <TableCell>{item.gender}</TableCell>
                    <TableCell>{item.pattern}</TableCell>
                    <TableCell>{item.color}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
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
          <div>
            <button className="btn btn-outline-primary" onClick={handleClick}>
              Download Inventory
            </button>
          </div>
          <div className="table-responsive">
            <InventoryTable data={currentInventory} currentPage={currentPage} itemsPerPage={itemsPerPage} />
          </div>
          {/* Pagination */}
          <Pagination
            count={Math.ceil(flattenedInventory.length / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            sx={{ marginTop: "20px", display: "flex", justifyContent: "center",paddingBottom:"20px" }}
          />
        </>
      )}
    </div>
  );
};

export default MainScreen;
