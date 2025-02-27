import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/AuthContext";
import api from "./api";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { toast } from "react-toastify";
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
  Box,
  CircularProgress,
  Alert,
  TextField,
  Button,
  tableBodyClasses,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import AddProductModal from "./AddProductModal";
import DeleteIcon from "@mui/icons-material/Delete";

const BillDetails = () => {
  const { billId } = useParams();
  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();
  const [error, setError] = useState(null);
  const [billData, setBillData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const [editRequestSuccessful, setEditRequestSuccessful] = useState(false); // Track edit request success

  const [tableData, setTableData] = useState([]); // Table data state

  const [total, setTotal] = useState(0); // Total sum of subtotals
  const [discount, setDiscount] = useState(0); // New state for discount
  const [finalTotal, setFinalTotal] = useState(0); // Total after discount

  useEffect(() => {
    const newTotal = tableData.reduce((acc, item) => acc + item.subTotal, 0);
    setTotal(newTotal);
  }, [tableData]);

  useEffect(() => {
    const discountedTotal = total - total * (discount / 100);
    setFinalTotal(discountedTotal);
  }, [total, discount]);

  const fetchBillData = async () => {
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

      console.log(data);

      const productData = data.products.flatMap((product) =>
        product.variants.flatMap((variant) =>
          variant.variantSizes.map((size) => ({
            productId: product.productId,
            variantId: variant.variantId,
            category: product.category,
            gender: product.gender,
            productType: product.productType,
            color: variant.color.name,
            size: size.size,
            styleCoat: size.styleCoat,
            price: product.price,
            billedQuantity: size.billedQuantity,
            quantityInStore: size.quantityInStore,
            subTotal: product.price * size.billedQuantity,
          }))
        )
      );
      setTableData(productData);
      setDiscount(data.discountPercentage);
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

  const downloadPDF = async (url, fileName) => {
    if (!url) {
      console.error("Invalid URL provided for download.");
      return;
    }

    try {
      setLoading(true); // Start loading spinner

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      const blobUrl = window.URL.createObjectURL(blob);

      link.href = blobUrl;
      link.download = fileName; // Use invoice number as the filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Clean up

      // Cleanup
      window.URL.revokeObjectURL(blobUrl);
      console.log("Invoice downloaded successfully.");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error(`Error downloading invoice: ${error.message}`); // Notify user of error
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };
  const saveTableDataToLocalStorage = (data) => {
    localStorage.setItem("tableData", JSON.stringify(data));
  };

  useEffect(() => {
    // Update localStorage whenever tableData changes
    saveTableDataToLocalStorage(tableData);
  }, [tableData]);

  const handleDownloadInvoice = (e) => {
    e.preventDefault(); // Prevent the default form submission

    if (!billData || !billData.invoiceUrl) {
      console.error("No invoice URL available for download.");
      return;
    }

    const invoiceUrl = billData.invoiceUrl; // Assuming invoiceUrl is part of your billData
    const fileName = `${billData.invoiceNo}.pdf`; // Use invoice number as the filename
    downloadPDF(invoiceUrl, fileName);
  };

  const validationSchema = Yup.object().shape({
    customer: Yup.object({
      customerName: Yup.string().required("Customer Name is required"),
      customerPhone: Yup.string().required("Customer Phone is required"),
      customerEmail: Yup.string()
        .email("Invalid email")
        .required("Email is required"),
    }),
    products: Yup.array().of(
      Yup.object({
        billingQuantities: Yup.object().shape({
          // Add validation for billing quantities if needed
        }),
      })
    ),
    discountPercentage: Yup.number().required(
      "Discount percentage is required"
    ),
    note: Yup.string().required("Note is required"), // Add required validation for note
  });

  const handleEdit = async (values) => {
    const token = localStorage.getItem("authToken");
    const storeId = localStorage.getItem("storeId");
    const apiUrl = `/store/create-bill-edit-req/?storeId=${storeId}&billId=${billData.billId}`;

    const payload = {
      customerDetails: {
        customerName: values.customer.customerName,
        customerPhone: values.customer.customerPhone,
        customerEmail: values.customer.customerEmail,
      },

      products: values.productData.map((product) => {
        return {
          productId: product.productId,
          variantId: product.variantId || "",
          styleCoat: product.styleCoat || "",
          billingQuantity: product.billedQuantity,
        };
      }),

      // products: values.products.flatMap((product) =>
      //   product.variants.flatMap((variant) =>
      //     variant.variantSizes.map((size) => {
      //       const editedBillingQuantity =
      //         product.billingQuantities?.[size._id] || size.billedQuantity;
      //       return {
      //         productId: product.productId,
      //         variantId: variant.variantId || "",
      //         styleCoat: size.styleCoat || "",
      //         billingQuantity: editedBillingQuantity,
      //       };
      //     })
      //   )
      // ),
      discountPercentage: values.discountPercentage,
      reqNote: values.note,
    };

    try {
      const response = await api.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Swal.fire("Success!", "Bill Edit Request has been Submitted.", "success");
      setEditMode(false);
      setEditRequestSuccessful(true); // Mark edit request as successful
      const editBillReqId = response.data.editBillReqId;

      navigate(`/req-bills-edit/${editBillReqId}`);
    } catch (error) {
      console.error("Error updating BillData:", error);
    }
  };

  const handleDeleteBills = async (billId, event) => {
    event.preventDefault(); // Prevent form submission
    const token = localStorage.getItem("authToken");
    if (!token) return; // Ensure token exists
    const storeId = localStorage.getItem("storeId");
    const apiUrl = `/store/create-bill-delete-req?storeId=${storeId}&billId=${billId}`;

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success me-3",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: true,
    });

    // Prompt the user to input a note
    const { value: note } = await Swal.fire({
      title: "Enter a reason for bill deletion",
      input: "textarea",
      inputPlaceholder: "Enter your note here...",
      showCancelButton: true,
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "You need to provide a reason!";
        }
      },
    });

    // If the user cancels or doesn't input a note, stop the execution
    if (!note) return;

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await api.patch(
              apiUrl,
              {
                RequestedBillDeleteNote: note,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            swalWithBootstrapButtons.fire({
              title: "Deleted!",
              text: "Your bill deletion request has been submitted.",
              icon: "success",
              showCancelButton: false,
              showConfirmButton: false,
              timer: 1000,
            });

            navigate("/bills");
          } catch (error) {
            console.error("Error deleting BillData:", error);
            setError(
              "Failed to submit bill deletion request. Please try again later."
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire({
            title: "Cancelled",
            text: "Your bill deletion request was not submitted.",
            icon: "error",
            showConfirmButton: false,
            timer: 1000,
          });
        }
      });
  };

  // const calculateDiscountedPrice = (totalAmount, discountPercentage) => {
  //   if (!totalAmount || discountPercentage === undefined) return totalAmount;

  //   const discountAmount = (totalAmount * discountPercentage) / 100;
  //   return totalAmount - discountAmount;
  // };

  const BillTable = ({
    total,
    finalTotal,
    setFinalTotal,
    data,
    productData,
    setTableData,
    discount,
    setDiscount,
  }) => {
    const [openModal, setOpenModal] = useState(false);

    const handleAddProduct = (newProduct) => {
      console.log("newProduct", newProduct);

      // Convert billingQuantity to a number to avoid string concatenation
      const billingQuantity = Number(newProduct.billedQuantity);

      // Assuming `availableQuantity` is fetched from the database and stored in formData
      const availableQuantity = newProduct.quantityInStore;

      setTableData((prevTableData) => {
        // Check if the same style coat exists
        const existingItemIndex = prevTableData.findIndex(
          (item) => item.styleCoat === newProduct.styleCoat
        );

        if (existingItemIndex !== -1) {
          // If the item exists, update its quantity and subtotal
          const updatedTableData = [...prevTableData];
          const existingItem = updatedTableData[existingItemIndex];

          // Calculate the new quantity
          const newQuantity =
            Number(existingItem.billedQuantity) + billingQuantity;

          // Check if the new quantity exceeds availableQuantity
          if (newQuantity > availableQuantity) {
            toast.error(
              `You cannot add more than ${availableQuantity} units for this product.`
            );
            return prevTableData; // Return original table data without modification
          }

          // Update the quantity and subtotal of the existing item
          const oldSubTotal = existingItem.subTotal;
          existingItem.billedQuantity = newQuantity;
          existingItem.subTotal =
            existingItem.price * existingItem.billedQuantity;

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
          const subTotal = newProduct.price * billingQuantity;
          setTotal((prevTotal) => prevTotal + subTotal);

          return [
            ...prevTableData,
            {
              productId: newProduct.productId,
              variantId: newProduct.variantId,
              category: newProduct.category,
              gender: newProduct.gender,
              productType: newProduct.productType,
              color: newProduct.color,
              size: newProduct.size,
              styleCoat: newProduct.styleCoat,
              price: newProduct.price,
              billedQuantity: newProduct.billedQuantity,
              quantityInStore: newProduct.quantityInStore,
              subTotal: subTotal,
            },
          ];
        }
      });
    };

    // Handle quantity change during edit
    const handleQuantityChange = (index, newQuantity) => {
      const newTableData = [...productData];
      newTableData[index].billedQuantity = newQuantity;
      newTableData[index].subTotal = newTableData[index].price * newQuantity;
      setTableData(newTableData);
    };

    // const handleDelete = (pIndex, variantId, sizeId) => {
    //   // Update the state to remove the specific product/variant/size
    //   setBillData((prevData) => {
    //     const updatedProducts = prevData.products.map((product, index) => {
    //       if (index !== pIndex) return product; // Return unmodified product if not matched

    //       return {
    //         ...product,
    //         variants: product.variants.map((variant) => {
    //           if (variant.variantId !== variantId) return variant; // Return unmodified variant if not matched

    //           // Filter out the size based on sizeId
    //           return {
    //             ...variant,
    //             variantSizes: variant.variantSizes.filter(
    //               (size) => size._id !== sizeId
    //             ),
    //           };
    //         }),
    //       };
    //     });

    //     return { ...prevData, products: updatedProducts };
    //   });
    // };

    const handleDelete = (rowIndex) => {
      setTableData((prevTableData) => {
        // Filter out the row by its index
        return prevTableData.filter((_, index) => index !== rowIndex);
      });
      toast.success("Product removed successfully.");
    };

    return (
      <Formik
        initialValues={{
          customer: {
            customerName: data.customer?.customerName || "",
            customerPhone: data.customer?.customerPhone || "",
            customerEmail: data.customer?.customerEmail || "",
          },
          productData: productData || [], // Pass the productData here
          // products: data.products || [],
          discountPercentage: discount || 0,
          note: data.note || "",
        }}
        validationSchema={validationSchema} // Apply validation schema
        onSubmit={handleEdit}
      >
        {({ values, handleChange, errors, touched }) => (
          <Form>
            <div className="d-flex gap-4 flex-wrap">
              <h4 className="fs-6">
                Customer Name:
                <Field
                  as={TextField}
                  name="customer.customerName"
                  disabled={!editMode}
                  fullWidth
                  error={
                    touched.customer?.customerName &&
                    Boolean(errors.customer?.customerName)
                  }
                  helperText={
                    touched.customer?.customerName &&
                    errors.customer?.customerName
                  }
                />
              </h4>
              <h4 className="fs-6">
                Customer Phone no:
                <Field
                  as={TextField}
                  name="customer.customerPhone"
                  disabled={!editMode}
                  fullWidth
                  error={
                    touched.customer?.customerPhone &&
                    Boolean(errors.customer?.customerPhone)
                  }
                  helperText={
                    touched.customer?.customerPhone &&
                    errors.customer?.customerPhone
                  }
                />
              </h4>
              <h4 className="fs-6">
                Customer Email ID:
                <Field
                  as={TextField}
                  name="customer.customerEmail"
                  disabled={!editMode}
                  fullWidth
                  error={
                    touched.customer?.customerEmail &&
                    Boolean(errors.customer?.customerEmail)
                  }
                  helperText={
                    touched.customer?.customerEmail &&
                    errors.customer?.customerEmail
                  }
                />
              </h4>
            </div>

            <Box sx={{ padding: "20px" }}>
              <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
                <Typography variant="h4" component="h1">
                  Particular Bill Details
                </Typography>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                      <TableCell>Billing ID</TableCell>
                      <TableCell>Date Of Bill</TableCell>
                      <TableCell>Edit Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{data?.billId ?? "N/A"}</TableCell>
                      <TableCell>
                        {data?.dateOfBill
                          ? new Date(data.dateOfBill).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {data?.editStatus ? data.editStatus : "Not Edited"}
                      </TableCell>
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
                      <TableCell>School Name</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>P Name</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>StyleCoat</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Quantity Available</TableCell>
                      <TableCell>Sub Total</TableCell>
                      {editMode && <TableCell>Actions</TableCell>}{" "}
                      {/* Add Actions column in edit mode */}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {values.productData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.productId}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>
                          {localStorage.getItem("storeName")}
                        </TableCell>
                        <TableCell>{row.gender}</TableCell>
                        <TableCell>{row.productType}</TableCell>
                        <TableCell>{row.color}</TableCell>
                        <TableCell>{row.size}</TableCell>
                        <TableCell>{row.styleCoat}</TableCell>
                        <TableCell>{row.price}</TableCell>
                        <TableCell>
                          {editMode ? (
                            <Field
                              as={TextField}
                              name={`billedQuantity`}
                              type="number"
                              value={row.billedQuantity || ""}
                              onChange={(e) => {
                                const enteredQuantity = Number(e.target.value);
                                if (
                                  enteredQuantity > 0 &&
                                  enteredQuantity <= row.quantityInStore
                                ) {
                                  handleQuantityChange(index, enteredQuantity); // Pass rowIndex here
                                } else {
                                  toast.error(
                                    "Quantity must be greater than zero and not exceed available stock."
                                  );
                                }
                              }}
                              error={row.billedQuantity > row.quantityInStore}
                              helperText={
                                row.billedQuantity > row.quantityInStore
                                  ? "Exceeds available stock"
                                  : ""
                              }
                            />
                          ) : (
                            row.billedQuantity
                          )}
                        </TableCell>
                        <TableCell>{row.quantityInStore}</TableCell>
                        <TableCell>{row.subTotal}</TableCell>
                        {editMode && (
                          <TableCell>
                            <DeleteIcon
                              onClick={() => handleDelete(index)}
                              sx={{
                                color: "error.main", // Set color for the icon
                                cursor: "pointer", // Change cursor to pointer for better UX
                                "&:hover": {
                                  color: "error.dark", // Change color on hover
                                },
                                fontSize: "24px", // Set size of the icon
                              }}
                            />
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <div className="container-fluid">
              <div className="row">
                {/* Row showing Actual Price */}
                <p className="fs-5 text-end">
                  Actual Price ₹<strong>{total}</strong>
                </p>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                {" "}
                {/* Flex container */}
                <div>
                  {/* Conditionally render Add Product button in edit mode */}
                  {editMode && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setOpenModal(true)}
                      style={{ marginBottom: "8px" }}
                    >
                      Add Product
                    </Button>
                  )}
                  {/* Add Product Modal */}
                  <AddProductModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onAddProduct={handleAddProduct} // Pass the function to handle adding products
                    // existingProducts={data.products} // Pass the existing table products to the modal
                  />
                </div>
                <p className="fs-5 text-end mb-0">
                  {" "}
                  {/* Remove margin-bottom for proper alignment */}
                  Price After Discount ₹{finalTotal.toFixed(2)}
                </p>
              </div>

              <div className="row">
                <p className="fs-5">
                  Discount %:
                  {editMode ? (
                    <Field name="discountPercentage">
                      {({ field, form }) => (
                        <TextField
                          {...field}
                          type="number"
                          InputProps={{
                            inputProps: { min: 0, max: 100 },
                          }}
                          onChange={(e) => {
                            let value = e.target.value;

                            // Remove leading zeros
                            if (value.length > 1 && value.startsWith("0")) {
                              value = value.replace(/^0+/, "");
                            }

                            // Convert value to number and ensure it's within the range of 0-100
                            let discountValue = Math.max(
                              0,
                              Math.min(Number(value), 100)
                            );

                            // Update the field value using Formik's setFieldValue
                            form.setFieldValue(field.name, discountValue);

                            // Update discount and final total
                            setDiscount(discountValue);
                            setFinalTotal(
                              total - (total * discountValue) / 100
                            );
                          }}
                        />
                      )}
                    </Field>
                  ) : (
                    data?.discountPercentage ?? "N/A"
                  )}
                </p>
              </div>

              {/* <div className="row">
                <p className="fs-5">
                  Discount %:
                  {editMode ? (
                    <Field name="discountPercentage">
                      {({ field, form }) => (
                        <TextField
                          {...field}
                          type="number"
                          InputProps={{
                            inputProps: { min: 0, max: 100 },
                          }}
                          // onChange={handleDiscountChange}
                          onChange={(e) => {
                            let value = e.target.value;

                            // Remove leading zeros
                            if (value.length > 1 && value.startsWith("0")) {
                              value = value.replace(/^0+/, "");
                            }

                            // Convert value to number and ensure it's within the range of 0-100
                            value = Number(value);
                            if (value < 0) value = 0;
                            if (value > 100) value = 100;

                            // Update the field value using Formik's setFieldValue
                            form.setFieldValue(field.name, value);
                          }}
                        />
                      )}
                    </Field>

                    // <TextField
                    //   variant="outlined"
                    //   label="Discount (%)"
                    //   value={values.discountPercentage}
                    //   onChange={handleDiscountChange}
                    //   placeholder="Enter discount percentage"
                    // />


                  ) : (
                    data?.discountPercentage ?? "N/A"
                  )}
                </p>
              </div> */}
              <div className="row">
                <p className="fs-5">
                  Requested Note:
                  {editMode ? (
                    <Field
                      as={TextField}
                      name="note"
                      type="text"
                      required
                      error={touched.note && Boolean(errors.note)}
                      helperText={touched.note && errors.note}
                      fullWidth
                    />
                  ) : (
                    data?.note ?? "No note provided"
                  )}
                </p>
                <Box>
                  {!editMode &&
                    data?.editStatus !== "PENDING" && ( //data?.editStatus !== "PENDING" && show that during edit request is submitted then  download invoice is not available
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleDownloadInvoice}
                        disabled={loading} // Disable button if submitting
                        style={{ marginTop: "16px" }}
                        size="medium" // Optional: add some margin
                      >
                        {loading ? "Downloading..." : "Download Invoice"}
                      </Button>
                    )}
                </Box>
              </div>
              <div className="row">
                <div className="col text-end">
                  {editMode && (
                    <Button
                      variant="outlined" // Use outlined for the Cancel button
                      color="secondary" // Choose a suitable color for the button
                      // onClick={() => setEditMode(false)} // Handler to exit edit mode

                      onClick={() => {
                        setEditMode(false);
                        // window.location.reload();
                        fetchBillData();
                      }}
                      style={{ marginRight: "8px" }} // Optional: add margin for spacing
                    >
                      Cancel
                    </Button>
                  )}
                  {data.editStatus === null &&
                    !editRequestSuccessful && ( // Conditionally render the edit button
                      <Button
                        variant="contained"
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                          editMode &&
                          (!values.note ||
                            errors.note ||
                            tableData.length == 0 ||
                            loading)
                        }
                        onClick={() => {
                          if (editMode) {
                            handleEdit(values);
                          } else {
                            setEditMode(true);
                          }
                        }}
                      >
                        {editMode ? "Raise an Edit Request " : "Edit"}
                      </Button>
                    )}
                  <Button
                    variant="contained" // Use 'outlined' or 'contained' based on your preference
                    color="error" // Use Material-UI's color prop for danger
                    onClick={(event) => handleDeleteBills(data.billId, event)} // Prevent default
                    style={{ marginLeft: "8px" }} // Add margin to the left
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    );
  };

  if (loading) {
    return (
      <div className="text-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  return (
    <>
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
              <BillTable
                total={total}
                finalTotal={finalTotal}
                setFinalTotal={setFinalTotal}
                productData={tableData}
                data={billData}
                setTableData={setTableData}
                discount={discount}
                setDiscount={setDiscount}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BillDetails;
