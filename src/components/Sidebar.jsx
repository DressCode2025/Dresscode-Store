import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Sidebar.css";
import Images from "./Images/Logo.svg";
import arrow from "./Images/arrow.svg";
import {
  overview,
  inventory,
  uploadedHistory,
  storeCreation,
  assignInventory,
  raisedRequests,
  onlineOrders,
  qoute,
  assignedInventory,
  discountCodes,
  editBills,
  deletedBills,
  logout,
  handburger,
} from "./icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logoutFunction } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutFunction();
    navigate("/login");
  };
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { name: "Overview", icon: overview, path: "/overview" },
    { name: "Inventory", icon: inventory, path: "/inventory" },
    { name: "Billing", icon: uploadedHistory, path: "/billing" },
    { name: "Bills", icon: storeCreation, path: "/bills" },
    {
      name: "Raise an Inventory Requests",
      icon: assignInventory,
      path: "/raise-inventory",
    },
    {
      name: "Raised Inventory Requests",
      icon: assignInventory,
      path: "/raised-request",
    },
    {
      name: "Assigned Inventory",
      icon: raisedRequests,
      path: "/assign-inventory",
    },
    { name: "Request Bill Edit", icon: onlineOrders, path: "/req-bills-edit" },
    { name: "Deleted Bills", icon: qoute, path: "/deleted-bills" },
    // { name: 'Requested Refund Online Orders', icon: refundRequests, path: '/refund-requests' },
  ];

  return (
    <div>
      <button className="hamburger-menu" onClick={toggleSidebar}>
        <img src={handburger} alt="Open Menu" className="hamburger-icon" />
      </button>
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={toggleSidebar}>
          <img
            src={arrow}
            alt="Collapse"
            className="arrowClose"
            width="200"
            height="30"
          />
        </button>
        <div className="sidebar-header">
          <button className="shrink-sidebar" onClick={toggleSidebar}>
            <img
              src={arrow}
              alt="Shrink"
              className="arrowShrink"
              width="16"
              height="16"
            />
          </button>
          <div className="sidebar-logo">
            <img src={Images} alt="Logo" className="Logopng" />
          </div>
        </div>
        <nav className="nav flex-column">
          {navItems.map((item) => (
            <Link
              key={item.name}
              className={`nav-link d-flex align-items-center ${
                location.pathname === item.path ? "active" : ""
              }`}
              to={item.path}
              onClick={toggleSidebar}
            >
              <img src={item.icon} alt={item.name} className="me-2 icon" />
              {item.name}
            </Link>
          ))}
          <button
            className="nav-link mt-auto d-flex align-items-center"
            href="#"
            onClick={handleLogout}
          >
            <img src={logout} alt="Logout" className="me-2 icon" href="#" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
