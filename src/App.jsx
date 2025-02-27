import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Login from "./components/Auth/Login";
import RedirectIfAuthenticated from "./components/Auth/RedirectIfAuthenticated";
import { Typography, Container, Button, Link, Box } from "@mui/material";
import AssignedInventory from "./components/AssignedInventory";
import AssignedInventoryDetails from "./components/AssignedInventoryDetails";

import MainScreen from "./components/MainScreen";
import RaiseInventory from "./components/RaiseInventory";
import RaisedInventoryRequest from "./components/RaisedInventoryRequest";
import RaisedInventoryDetails from "./components/RaisedInventoryDetails";
import Billing from "./components/Billing";
import Billls from "./components/Billls";
import BillDetails from "./components/BillDetails";
import NotFoundPage from "./NotFound";

import DeletedBills from "./components/DeleteBills/DeleteBills";
import DeletedBillsDetails from "./components/DeleteBills/DeletedBillsDetails";
import ReqBillEdit from "./components/RequestBillEdit/ReqBillEdit";
import ReqBillEditDetail from "./components/RequestBillEdit/ReqBillEditDetail";
import Overview from "./components/OverView/OverView";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="d-flex">
      {isAuthenticated && <Sidebar />}
      <div className="container-fluid" style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/login"
            element={<RedirectIfAuthenticated element={<Login />} />}
          />
          <Route
            path="/overview"
            element={<ProtectedRoute element={Overview} />}
          />
          <Route
            path="/inventory"
            element={<ProtectedRoute element={MainScreen} />}
          />
          <Route
            path="/raise-inventory"
            element={<ProtectedRoute element={RaiseInventory} />}
          />
          <Route
            path="/assign-inventory"
            element={<ProtectedRoute element={AssignedInventory} />}
          />
          <Route
            path="/assign-inventory/:assignedInventoryId"
            element={<ProtectedRoute element={AssignedInventoryDetails} />}
          />
          <Route
            path="/raised-request"
            element={<ProtectedRoute element={RaisedInventoryRequest} />}
          />
          <Route
            path="/raised-inventory-details/:raisedInventoryId"
            element={<ProtectedRoute element={RaisedInventoryDetails} />}
          />
          <Route
            path="/billing"
            element={<ProtectedRoute element={Billing} />}
          />
          <Route path="/bills" element={<ProtectedRoute element={Billls} />} />
          <Route
            path="/get-bill-details/:billId"
            element={<ProtectedRoute element={BillDetails} />}
          />
          <Route
            path="/deleted-bills"
            element={<ProtectedRoute element={DeletedBills} />}
          />
          <Route
            path="/deleted-bill-details/:billId"
            element={<ProtectedRoute element={DeletedBillsDetails} />}
          />
          <Route
            path="/req-bills-edit"
            element={<ProtectedRoute element={ReqBillEdit} />}
          />
          <Route
            path="/req-bills-edit/:editBillReqId"
            element={<ProtectedRoute element={ReqBillEditDetail} />}
          />
          <Route path="/" element={<ProtectedRoute element={Overview}/> } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
};

const EmptyScreen = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh", // Full viewport height
        textAlign: "center",
        padding: "2rem",
      }}
    >
      {/* Logo */}
      <Box sx={{ mb: 4 }}>
        <img src="/DressCode.svg" alt="Logo" width={150} />
      </Box>

      {/* Welcome Message */}
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to the Store Dashboard
      </Typography>

      {isAuthenticated ? (
        <Typography variant="body1">
          Select an option from the sidebar to get started.
        </Typography>
      ) : (
        <Link href="/login" underline="none">
          <Button variant="contained" color="primary">
            Login
          </Button>
        </Link>
      )}
    </Container>
  );
};

export default App;
