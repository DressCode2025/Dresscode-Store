import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "./api";
import { Link, useNavigate } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import Invoice from "./Invoice";
import { CircularProgress } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Grid,
  TextField,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  TableFooter,
} from "@mui/material";

import { Edit, Delete, Save } from "@mui/icons-material";
import useScanDetection from "use-scan-detection";

const Billing = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  // const { userData } = useAuth();
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [styleCoat, setStyleCoat] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showTable, setShowTable] = useState(true); // New state for table visibility

  const [tableData, setTableData] = useState([]); // Table data state

  // const [isInputFocused, setIsInputFocused] = useState(false);

  const [inputTimeout, setInputTimeout] = useState(null);


  const [formData, setFormData] = useState({
    customerName: "",
    customerMailId: "",
    schoolName: localStorage.getItem("storeName"),
    pStyleCoat: "",
    productId: "",
    variantId: "",
    gender: "",
    color: "",
    price: "",
    productCategory: "",
    productName: "",
    size: "",
    quantity: "",
    billingQuantity: "",
  });

  const [existingQuantity, setExistingQuantity] = useState("");

  const [isEditable, setIsEditable] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [total, setTotal] = useState(0); // Total sum of subtotals
  const [discount, setDiscount] = useState(0); // New state for discount
  const [finalTotal, setFinalTotal] = useState(0); // Total after discount
  const [editingRow, setEditingRow] = useState(null); // Row being edited

  const [paymentMethod, setPaymentMethod] = useState(""); // State for payment method

  useEffect(() => {
    const newTotal = tableData.reduce((acc, item) => acc + item.subTotal, 0);
    setTotal(newTotal);
  }, [tableData]);

  useEffect(() => {
    const discountedTotal = total - total * (discount / 100);
    setFinalTotal(discountedTotal);
  }, [total, discount]);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setPhoneNumber(value);
    }
  };

  useEffect(() => {
    if (styleCoat.length > 0) {
      searchProducts(styleCoat); // Call the search function whenever styleCoat changes
      setShowTable(true); // Ensure the table is displayed while typing
    } else {
      setFilteredProducts([]); // Clear the table if styleCoat is cleared
      setShowTable(false); // Hide the table if there's no input
    }
  }, [styleCoat]); // This useEffect depends on styleCoat changes

  useEffect(() => {
    if (phoneNumber.length === 10) {
      checkPhoneNumber();
    }
  }, [phoneNumber]);

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

      console.log("response", response)

      const data = response.data;
      console.log("API Response:", data); // Log the API response
      setProductData(Array.isArray(data) ? data : []); // Ensure productData is always an array
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to fetch product. Please try again later.");
      setProductData([]); // Set to empty array in case of error
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProductData();
  }, []);

  const saveTableDataToLocalStorage = (data) => {
    localStorage.setItem("tableData", JSON.stringify(data));
  };

  useEffect(() => {
    // Update localStorage whenever tableData changes
    saveTableDataToLocalStorage(tableData);
  }, [tableData]);

  const checkPhoneNumber = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const apiUrl = `/store/get-customer-details/${phoneNumber}`;
    try {
      const response = await api.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        setFormData((prev) => ({
          ...prev,
          customerName: response.data.result.customerName,
          customerMailId: response.data.result.customerEmail,
        }));
      } else {
        setErrorMessage(
          "Phone number not found, please enter details manually."
        );
      }
    } catch (error) {
      console.error("API error:", error);
      setErrorMessage("Error checking phone number.");
    }
  };

  // const handleStyleCoatChange = (input) => {
  //   let value = input;

  //   // If it's an event (manual input), get the value from the event target
  //   if (input?.target?.value) {
  //     value = input.target.value;
  //   }

  //   // Remove "Shift" and "Backspace" characters if they exist
  //   value = value.replace(/Shift|Backspace/g, "");

  //   // console.log("Scanned or input value:", value);

  //   setStyleCoat(value);
  //   if (value === "") {
  //     setFormData({
  //       ...formData,
  //       productId: "",
  //       variantId: "",
  //       gender: "",
  //       color: "",
  //       price: "",
  //       productCategory: "",
  //       productName: "",
  //       size: "",
  //       quantity: "",
  //       billingQuantity: "",
  //     });
  //   }
  // };


  // const handleStyleCoatChange = (input) => {
  //   let value = input;

  //   // If it's an event (manual input), get the value from the event target
  //   if (input?.target?.value !== undefined) {
  //     value = input.target.value;
  //   }

  //   // Update the styleCoat state directly
  //   setStyleCoat(value);

  //   // If the value is empty, reset the form data
  //   if (value === "") {
  //     setFormData({
  //       ...formData,
  //       productId: "",
  //       variantId: "",
  //       gender: "",
  //       color: "",
  //       price: "",
  //       productCategory: "",
  //       productName: "",
  //       size: "",
  //       quantity: "",
  //       billingQuantity: "",
  //     });
  //   }
  // };


  // const handleStyleCoatChange = (input) => {
  //   let value = input;

  //   // If it's an event (manual input), get the value from the event target
  //   if (input?.target?.value !== undefined) {
  //     value = input.target.value;
  //   }

  //   // Update the styleCoat state directly
  //   setStyleCoat(value);

  //   // If the value is empty, reset the form data
  //   if (value === "") {
  //     setFormData({
  //       ...formData,
  //       productId: "",
  //       variantId: "",
  //       gender: "",
  //       color: "",
  //       price: "",
  //       productCategory: "",
  //       productName: "",
  //       size: "",
  //       quantity: "",
  //       billingQuantity: "",
  //     });
  //   }
  // };

  const handleStyleCoatChange = (input) => {
    let value = input;

    // If it's an event (manual input), get the value from the event target
    if (input?.target?.value !== undefined) {
      value = input.target.value;
    }

    // Clear the previous timeout
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }

    const timeout = setTimeout(() => {
      // If the timeout completes, treat the input as manual typing
      setStyleCoat(value);

      // If the value is empty, reset the form data
      if (value === "") {
        setFormData({
          ...formData,
          productId: "",
          variantId: "",
          gender: "",
          color: "",
          price: "",
          productCategory: "",
          productName: "",
          size: "",
          quantity: "",
          billingQuantity: "",
        });
      }
    }, 100); // Adjust the timeout duration as needed (e.g., 100ms)

    setInputTimeout(timeout);

    // If the input includes a "carriage return" or "enter" key, treat it as a barcode scan
    if (value.includes("\n") || value.includes("\r")) {
      // Remove "Backspace" and other unwanted characters from the scanned value
      const cleanedValue = value.replace(/Backspace/g, "").trim();
      setStyleCoat(cleanedValue);
      clearTimeout(timeout); // Clear the timeout for manual input
    }
  };



  // Use the scan detection hook
  // useScanDetection({
  //   onComplete: (scannedValue) => handleStyleCoatChange(scannedValue), // Directly handle the scanned value
  //   // minLength: 3 // EAN13
  // });


  // useScanDetection({
  //   onComplete: (scannedValue) => handleStyleCoatChange(scannedValue), // Directly handle the scanned value
  // });

  // useScanDetection({
  //   onComplete: (scannedValue) => {
  //     if (!isInputFocused) {
  //       handleStyleCoatChange(scannedValue);
  //     }
  //   },
  // });

  // Use the scan detection hook
  useScanDetection({
    onComplete: (scannedValue) => {
      // Remove "Backspace" and other unwanted characters from the scanned value
      const cleanedValue = scannedValue.replace(/Backspace/g, "").trim();
      setStyleCoat(cleanedValue);
    },
  });


  const searchProducts = (styleCoat) => {
    if (!Array.isArray(productData)) {
      console.error("productData is not an array:", productData);
      setFilteredProducts([]);
      return;
    }

    const filtered = productData.filter((product) =>
      product.variants.some((variant) =>
        variant.variantSizes.some((size) =>
          size.styleCoat.toLowerCase().includes(styleCoat.toLowerCase())
        )
      )
    );

    console.log("filtered", filtered);
    setFilteredProducts(filtered);
  };



  const handleRowClick = (product, variant, size) => {
    setFormData({
      ...formData,
      pStyleCoat: size.styleCoat,
      productId: product.productId,
      variantId: variant.variantId,
      gender: product.gender,
      color: variant.color,
      price: product.price,
      productCategory: product.category,
      productName: product.productType,
      size: size.size,
      quantity: size.quantity,
    });
    setShowTable(false); // Hide the table on row click
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Convert billingQuantity to a number to avoid string concatenation
    const billingQuantity = Number(formData.billingQuantity);

    // Assuming `availableQuantity` is fetched from the database and stored in formData
    const availableQuantity = formData.quantity;

    setTableData((prevTableData) => {
      // Check if the same style coat exists
      const existingItemIndex = prevTableData.findIndex(
        (item) => item.pStyleCoat === formData.pStyleCoat
      );

      if (existingItemIndex !== -1) {
        // If the item exists, update its quantity and subtotal
        const updatedTableData = [...prevTableData];
        const existingItem = updatedTableData[existingItemIndex];

        // Calculate the new quantity
        const newQuantity = Number(existingItem.quantity) + billingQuantity;

        // Check if the new quantity exceeds availableQuantity
        if (newQuantity > availableQuantity) {
          toast.error(
            `You cannot add more than ${availableQuantity} units for this product.`
          );
          return prevTableData; // Return original table data without modification
        }

        // Update the quantity and subtotal of the existing item
        const oldSubTotal = existingItem.subTotal;
        existingItem.quantity = newQuantity;
        existingItem.subTotal = existingItem.price * existingItem.quantity;

        // Update the total: Subtract the old subtotal and add the new one
        setTotal(
          (prevTotal) => prevTotal - oldSubTotal + existingItem.subTotal
        );

        return updatedTableData;
      } else {
        // For new item, ensure billingQuantity is within available limits
        if (billingQuantity > availableQuantity) {
          toast.error(
            `You cannot add more than ${availableQuantity} units for this product.`
          );
          return prevTableData;
        }

        // Add a new row
        const subTotal = formData.price * billingQuantity;
        setTotal((prevTotal) => prevTotal + subTotal);

        return [
          ...prevTableData,
          {
            pId: formData.productId,
            variantId: formData.variantId,
            pStyleCoat: formData.pStyleCoat,
            category: formData.productCategory,
            gender: formData.gender,
            name: formData.productName,
            color: formData.color,
            size: formData.size,
            price: formData.price,
            quantity: billingQuantity,
            QuantityInStore: formData.quantity,
            subTotal: subTotal,
          },
        ];
      }
    });

    // Reset form and other states
    setStyleCoat("");
    setFormData({
      ...formData,
      pStyleCoat: "",
      productId: "",
      variantId: "",
      gender: "",
      color: "",
      price: "",
      productCategory: "",
      productName: "",
      size: "",
      quantity: "",
      billingQuantity: "",
    });

    setShowTable(false); // Optionally hide the table after submit
    // console.log("Form Data Submitted", formData);
  };

  const handleDiscountChange = (e) => {
    let discountValue = parseFloat(e.target.value);

    // Check if the discountValue is a valid number
    if (isNaN(discountValue) || discountValue < 0) {
      discountValue = 0; // Set discount to 0 if not available or invalid
    } else if (discountValue > 100) {
      discountValue = 100; // Cap discount at 100%
    }

    setDiscount(discountValue);
    setFinalTotal(total - (total * discountValue) / 100); // Adjust final total
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Handle quantity change during edit
  const handleQuantityChange = (index, newQuantity) => {
    const newTableData = [...tableData];
    newTableData[index].quantity = newQuantity;
    setTableData(newTableData);
  };

  // Automatically save when the quantity input loses focus
  const handleQuantityBlur = (index) => {
    const newTableData = [...tableData];
    const row = newTableData[index];

    // Recalculate subtotal
    row.subTotal = row.price * row.quantity;

    // Update total
    const newTotal = newTableData.reduce((acc, item) => acc + item.subTotal, 0);
    setTotal(newTotal);

    setTableData(newTableData);
    setEditingRow(null); // Exit editing mode
  };

  // Delete a row and update total
  const handleDeleteClick = (index) => {
    const newTableData = tableData.filter((_, i) => i !== index);
    setTableData(newTableData);

    // Update total
    const newTotal = newTableData.reduce((acc, item) => acc + item.subTotal, 0);
    setTotal(newTotal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token found");
      return;
    }

    const apiUrl = `/store/create-bill/${localStorage.getItem("storeId")}`;
    const customerDetails = {
      customerName: formData.customerName,
      customerPhone: phoneNumber,
      customerEmail: formData.customerMailId,
    };

    const products = tableData.map((item) => ({
      productId: item.pId,
      variantId: item.variantId,
      styleCoat: item.pStyleCoat,
      billingQuantity: item.quantity,
    }));

    const requestBody = {
      customerDetails,
      products,
      discountPercentage: discount,
      modeOfPayment: paymentMethod,
    };

    setLoading(true); // Start loading spinner

    try {
      // Step 1: Create the bill
      const billResponse = await api.post(apiUrl, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (billResponse.status === 200) {
        const result = billResponse.data;
        // console.log("Bill created successfully:", result);

        // Clear local storage for table data
        localStorage.removeItem("tableData");

        // Reset form data
        setFormData({
          customerName: "",
          customerPhone: "",
          customerMailId: "",
          productId: "",
          variantId: "",
          gender: "",
          color: "",
          price: "",
          productCategory: "",
          productName: "",
          size: "",
          quantity: "",
          billingQuantity: "",
        });

        // Step 2: Generate the PDF
        const invoiceBlob = await pdf(<Invoice data={result} />).toBlob();
        const invoiceUrl = URL.createObjectURL(invoiceBlob);

        // Create a download link for the invoice PDF
        const invoiceDownloadLink = document.createElement("a");
        invoiceDownloadLink.href = invoiceUrl;
        invoiceDownloadLink.download = `${result.invoiceNo}.pdf`;
        document.body.appendChild(invoiceDownloadLink);
        invoiceDownloadLink.click();
        document.body.removeChild(invoiceDownloadLink); // Clean up

        // Prepare FormData for PDF upload
        const pdfFormData = new FormData();
        pdfFormData.append("pdf", invoiceBlob, `${result.invoiceNo}.pdf`);

        // Step 3: Upload the PDF to S3
        const uploadResponse = await api.post(
          `/uploadToS3/addInvoice/${result.billId}`,
          pdfFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              // Do not set "Content-Type" for FormData; it's automatically handled by the browser
            },
          }
        );

        // Check for successful upload
        if (uploadResponse.status === 200) {
          console.log("PDF successfully uploaded.");

          const whatsappFormData = new FormData();
          whatsappFormData.append(
            "file",
            invoiceBlob,
            `${result.invoiceNo}.pdf`
          );
          whatsappFormData.append("messaging_product", "whatsapp");

          const fbResponse = await fetch(
            `https://graph.facebook.com/v13.0/${import.meta.env.VITE_WHATSAPP_ID
            }/media`,
            {
              method: "POST",
              body: whatsappFormData,
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_WHATSAPP_TOKEN}`,
              },
            }
          );

          if (!fbResponse.ok) {
            console.error(
              `HTTP error during Facebook Graph API request! Status: ${fbResponse.status}`
            );
          }

          const fbData = await fbResponse.json();

          const whatsappData = {
            messaging_product: "whatsapp",
            to: "91" + customerDetails.customerPhone,
            type: "template",
            template: {
              name: "invoice_template",
              language: {
                code: "en",
              },
              components: [
                {
                  type: "header",
                  parameters: [
                    {
                      type: "document",
                      document: {
                        id: fbData.id,
                      },
                    },
                  ],
                },
              ],
            },
          };

          const whatsappResponse = await fetch(
            `https://graph.facebook.com/v18.0/${import.meta.env.VITE_WHATSAPP_ID
            }/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(whatsappData),
            }
          );

          const whatsappResponseData = await whatsappResponse.json();

          if (!whatsappResponse.ok) {
            console.error(
              `Error in sending whatsapp message! status:${whatsappResponse.status}`
            );
            if (whatsappResponseData.error.message.includes("incapable")) {
              toast.error(
                `${customerDetails.customerPhone} incapable of receving WhatsApp message.`
              );
            }
          } else {
            toast.success("Invoice sent successfully via  WhatsApp!");
          }

          // navigate("/bills"); // Navigate to bills page after successful upload
          window.location.reload(); //added to refresh after sucessful bill submission
        } else {
          const errorResponse = await uploadResponse.data;
          console.error(
            `Failed to upload PDF! Status: ${uploadResponse.status}`
          );
          console.error("Error details:", errorResponse);
          toast.error(
            `Failed to upload PDF! Status: ${uploadResponse.status
            }: ${JSON.stringify(errorResponse)}`
          );
        }
      } else {
        console.error("Failed to create bill:", billResponse.status);
        const errorResponse = billResponse.data;
        console.error("Error details:", errorResponse);
        toast.error(
          `Failed to create bill! Status: ${billResponse.status
          }: ${JSON.stringify(errorResponse)}`
        );
      }
    } catch (error) {
      console.error("API error:", error);
      toast.error(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <div className="main-content">
      <form onSubmit={handleSave}>
        <Box sx={{ flexGrow: 1, padding: 2 }}>
          <Grid container spacing={3}>
            {/* Customer Details */}
            <Grid item xs={12}>
              <h3>Customer Details</h3>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <Typography variant="body1" style={{ marginRight: 8 }}>
                  Customer Contact:
                </Typography>
                <TextField
                  variant="outlined"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  required
                  onBlur={() => {
                    if (phoneNumber.length !== 10) {
                      setErrorMessage("Phone number must be 10 digits");
                    }
                  }}
                  error={!!errorMessage}
                  helperText={errorMessage}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <Typography variant="body1" style={{ marginRight: 8 }}>
                  Customer Name:
                </Typography>
                <TextField
                  variant="outlined"
                  value={formData.customerName}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <Typography variant="body1" style={{ marginRight: 8 }}>
                  Customer Mail ID:
                </Typography>
                <TextField
                  variant="outlined"
                  required
                  value={formData.customerMailId}
                  onChange={(e) =>
                    setFormData({ ...formData, customerMailId: e.target.value })
                  }
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <Typography variant="body1" style={{ marginRight: 8 }}>
                  School Name:
                </Typography>
                <TextField
                  variant="outlined"
                  value={formData.schoolName}
                  disabled
                />
              </Box>
            </Grid>

            {/* Billing Details */}
            <Grid item xs={12}>
              <h3>Billing Details</h3>
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* <TextField
                label="Enter Style Coat"
                variant="outlined"
                value={styleCoat}
                onChange={(input) => handleStyleCoatChange(input)} // Handle manual input changes
                fullWidth
              /> */}

              <TextField
                label="Enter Style Coat"
                variant="outlined"
                value={styleCoat}
                onChange={(e) => handleStyleCoatChange(e)}
                fullWidth
              />

              <div
                style={{
                  position: "absolute",
                  width: "fit-content",
                  zIndex: "9",
                }}
              >
                {showTable && filteredProducts.length > 0 ? (
                  <TableContainer
                    component={Paper}
                    sx={{ maxHeight: "70vh", overflowY: "auto" }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product Id</TableCell>
                          <TableCell>Variant Id</TableCell>
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
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product, index) =>
                            product.variants.map((variant) =>
                              variant.variantSizes.map(
                                (size) =>
                                  size.styleCoat === styleCoat && (
                                    <TableRow
                                      key={`${index}-${size.size}`}
                                      onClick={() =>
                                        handleRowClick(product, variant, size)
                                      }
                                    >
                                      <TableCell>{product.productId}</TableCell>
                                      <TableCell>{variant.variantId}</TableCell>
                                      <TableCell>{product.category}</TableCell>
                                      <TableCell>
                                        {product.productType}
                                      </TableCell>
                                      <TableCell>{product.gender}</TableCell>
                                      <TableCell>{product.pattern}</TableCell>
                                      <TableCell>{variant.color}</TableCell>
                                      <TableCell>{size.size}</TableCell>
                                      <TableCell>{product.price}</TableCell>
                                      <TableCell>{size.quantity}</TableCell>
                                    </TableRow>
                                  )
                              )
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
                ) : null}
              </div>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Product Id"
                value={formData.productId}
                disabled={!isEditable}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Variant Id"
                value={formData.variantId}
                disabled={!isEditable}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Gender"
                value={formData.gender}
                disabled={!isEditable}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Color"
                value={formData.color}
                disabled={!isEditable}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Price"
                value={formData.price}
                disabled={!isEditable}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Product Category"
                value={formData.productCategory}
                disabled={!isEditable}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Product Name"
                value={formData.productName}
                disabled={!isEditable}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Size"
                value={formData.size}
                disabled={!isEditable}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Quantity"
                value={formData.quantity}
                disabled={!isEditable}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Billing Quantity"
                value={formData.billingQuantity}
                required
                onChange={(e) =>
                  setFormData({ ...formData, billingQuantity: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="success">
                Save
              </Button>
            </Grid>
          </Grid>
        </Box>
      </form>

      {tableData.length > 0 && (
        <form onSubmit={handleSubmit}>
          <TableContainer component={Paper} sx={{ marginTop: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "StyleCoat",
                    "P Category",
                    "Gender",
                    "P Name",
                    "Color",
                    "Size",
                    "Price",
                    "Billing Quantity",
                    "Quantity in store",
                    "Sub Total",
                    "Actions",
                  ].map((header, index) => (
                    <TableCell key={index}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.pStyleCoat}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.gender}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.color}</TableCell>
                    <TableCell>{row.size}</TableCell>
                    <TableCell>{row.price}</TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <TextField
                          type="number"
                          value={row.quantity}
                          onChange={(e) => {
                            const enteredQuantity = Number(e.target.value);
                            const maxAllowedQuantity = row.QuantityInStore; // Assuming row.QuantityInStore is the quantity in store

                            // Ensure entered quantity is between 1 and max allowed
                            if (
                              enteredQuantity >= 1 &&
                              enteredQuantity <= maxAllowedQuantity
                            ) {
                              handleQuantityChange(index, e.target.value);
                            }
                          }}
                          onBlur={() => {
                            const enteredQuantity = Number(row.quantity);
                            const maxAllowedQuantity = row.QuantityInStore;

                            // Reset to max allowed if greater than allowed or to 1 if less than 1
                            if (enteredQuantity < 1) {
                              handleQuantityChange(index, 1); // Reset to 1
                            } else if (enteredQuantity > maxAllowedQuantity) {
                              handleQuantityChange(index, maxAllowedQuantity); // Reset to max allowed
                            } else {
                              handleQuantityBlur(index);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        row.quantity
                      )}
                    </TableCell>
                    <TableCell>{row.QuantityInStore}</TableCell>
                    <TableCell>{row.subTotal}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => setEditingRow(index)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(index)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={7} align="right">
                    <strong>Total:</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{total}</strong>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>

          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Discount (%)"
                value={discount}
                onChange={handleDiscountChange}
                placeholder="Enter discount percentage"
              />
            </Grid>
            <Grid item xs={12}>
              <h4>Total: {total}</h4>
              <h4>Final Total after Discount: {finalTotal.toFixed(2)}</h4>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Mode of Payment</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  label="Mode of Payment"
                  required
                >
                  {["CASH", "UPI", "CARD"].map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ marginTop: 2, padding: 2 }}>
            <Button
              variant="contained"
              color="success"
              type="submit"
              sx={{ padding: "8px 16px" }}
              disabled={loading} // Disable button during loading
            >
              {loading ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          </Box>
        </form>
      )}
      <ToastContainer />
    </div>
  );
};

export default Billing;
