import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import useScanDetection from "use-scan-detection";
import api from "./api"; // Ensure this is your API setup

const AddProductModal = ({ open, onClose, onAddProduct }) => {
  const [newProduct, setNewProduct] = useState({
    productId: "",
    category: "",
    gender: "",
    color: "",
    productType: "",
    price: 0,
    billedQuantity: 0,
    size: "",
    styleCoat: "",
    quantityInStore: 0,
    variantId: "",
  });

  const [styleCoat, setStyleCoat] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchProductData = async () => {
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
      setProductData(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to fetch products. Please try again later.");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  const handleStyleCoatChange = (input) => {
    let value = input?.target?.value || input;
    value = value.replace(/Shift|Backspace/g, "");
    setStyleCoat(value);

    if (value === "") {
      resetForm();
    } else {
      searchProducts(value);
    }
  };

  const searchProducts = (styleCoat) => {
    const filtered = productData.filter((product) =>
      product.variants.some((variant) =>
        variant.variantSizes.some((size) =>
          size.styleCoat.toLowerCase().includes(styleCoat.toLowerCase())
        )
      )
    );
    // console.log("filtered", filtered);
    setFilteredProducts(filtered);
  };



  const handleProductSelect = (product, variant, size) => {
    setNewProduct({
      productId: product.productId,
      category: product.category,
      gender: product.gender,
      productType: product.productType,
      price: product.price,
      color: variant.color,
      billedQuantity: newProduct.billedQuantity,
      size: size.size,
      styleCoat: size.styleCoat,
      quantityInStore: size.quantity,
      variantId: variant.variantId,
    });

    setFilteredProducts([]);
  };

  const resetForm = () => {
    setNewProduct({
      productId: "",
      category: "",
      gender: "",
      color: "",
      productType: "",
      price: 0,
      billedQuantity: 0,
      size: "",
      styleCoat: "",
      quantityInStore: 0,
      variantId: "",
    });
    setStyleCoat("");
  };

  useScanDetection({
    onComplete: (scannedValue) => handleStyleCoatChange(scannedValue),
    minLength: 1,
  });
  const isStyleCoatValid = () => {
    return productData.some(
      (
        product //checks weather styleCoat is available in the product data
      ) =>
        product.variants.some((variant) =>
          variant.variantSizes.some(
            (size) => size.styleCoat.toLowerCase() === styleCoat.toLowerCase()
          )
        )
    );
  };
  const handleAdd = () => {
    // Check if the entered style coat is valid
    if (!isStyleCoatValid()) {
      setError("The entered style coat does not match any available styles.");
      setOpenSnackbar(true);
      return; // Prevent adding if style coat is not valid
    }
    // Check if there are variants selected
    // if (newProduct.variants.length === 0) {
    //   setError("Please select a product variant before adding.");
    //   setOpenSnackbar(true);
    //   return;
    // }

    // const availableQuantity =
    //   newProduct.variants[0].variantSizes[0].availableQuantity;

    if (newProduct.billedQuantity > newProduct.quantityInStore) {
      setError("Quantity cannot exceed available stock.");
      setOpenSnackbar(true);
      return;
    }

    const productToAdd = {
      productId: newProduct.productId,
      category: newProduct.category,
      gender: newProduct.gender,
      productType: newProduct.productType,
      color: newProduct.color,
      size: newProduct.size,
      styleCoat: newProduct.styleCoat,
      billedQuantity: newProduct.billedQuantity,
      quantityInStore: newProduct.quantityInStore,
      price: newProduct.price
    };

    console.log("Adding Product:", productToAdd);

    onAddProduct(productToAdd);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <TextField
              label="Product ID"
              value={newProduct.productId}
              onChange={(e) =>
                setNewProduct({ ...newProduct, productId: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Category"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Gender"
              value={newProduct.gender}
              onChange={(e) =>
                setNewProduct({ ...newProduct, gender: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Color"
              value={newProduct.color}
              onChange={(e) => {
                const value = e.target.value;
                setNewProduct((prev) => {
                  const updatedVariants = prev.variants.map(
                    (variant, index) => {
                      if (index === 0) {
                        return {
                          ...variant,
                          color: { name: value },
                        };
                      }
                      return variant;
                    }
                  );
                  return {
                    ...prev,
                    variants: updatedVariants,
                  };
                });
              }}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Product Type"
              value={newProduct.productType}
              onChange={(e) =>
                setNewProduct({ ...newProduct, productType: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Price"
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Quantity"
              type="number"
              value={newProduct.billedQuantity}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 0) {
                  setNewProduct({
                    ...newProduct,
                    billedQuantity: value,
                  });
                }
              }}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Style Coat"
              value={styleCoat}
              onChange={handleStyleCoatChange}
              fullWidth
              margin="normal"
            />

            {filteredProducts.length > 0 && (
              <TableContainer
                component={Paper}
                sx={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>P ID</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Product Type</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Style Coat</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Available Quantity</TableCell>
                      <TableCell>Select</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map((product) =>
                      product.variants.map((variant) =>
                        variant.variantSizes
                          .filter(
                            (size) =>
                              size.styleCoat.toLowerCase() ===
                              styleCoat.toLowerCase()
                          ) // Filter sizes matching style coat
                          .map((size) => (
                            <TableRow
                              key={`${product.productId}-${variant.variantId}-${size.size}`}
                            >
                              <TableCell>{product.productId}</TableCell>
                              <TableCell>{product.category}</TableCell>
                              <TableCell>{product.gender}</TableCell>
                              <TableCell>{product.productType}</TableCell>
                              <TableCell>{variant.color}</TableCell>
                              <TableCell>{size.size}</TableCell>
                              <TableCell>{size.styleCoat}</TableCell>
                              <TableCell>{product.price}</TableCell>
                              <TableCell>{size.quantity}</TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  onClick={() =>
                                    handleProductSelect(product, variant, size)
                                  }
                                >
                                  Select
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          color="primary"
          disabled={!isStyleCoatValid()}
        >
          Add Product
        </Button>
      </DialogActions>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={error}
      />
    </Dialog>
  );
};

export default AddProductModal;