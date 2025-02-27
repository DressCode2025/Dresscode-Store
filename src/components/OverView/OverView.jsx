import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
} from "@mui/material";
import api from "../api";

const Overview = () => {
  const [storeOverview, setStoreOverview] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Get data from local storage
  const storeId = localStorage.getItem("storeId");
  const storeName = localStorage.getItem("storeName");
  const userName = localStorage.getItem("userName");
  const authToken = localStorage.getItem("authToken");

  // Fetch store overview from the API
  const fetchStoreOverview = async () => {
    try {
      const response = await api.get(`/store/get-store-overview/${storeId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setStoreOverview(response.data.result);
    } catch (error) {
      console.error("Error fetching store overview:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update current time every second
  useEffect(() => {
    fetchStoreOverview();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    ); // Show loading spinner
  }

  if (!storeOverview) {
    return <div>No store data available</div>; // Handle no data case
  }

  const { totalBilledAmount, activeBillCount, deletedBillCount, commissionPercentage, commissionEarned } =
    storeOverview;

  return (
    <div className="main-content">
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h6" align="right" sx={{ mb: 2 }}>
          Current Time: {currentTime.toLocaleTimeString()}
        </Typography>

        <Typography variant="h4" align="center" sx={{ mb: 1 }}>
          Welcome, {userName}!
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
          Store Name: {storeName}
        </Typography>
        <Typography variant="subtitle2" align="center" sx={{ mb: 4 }}>
          Store ID: {storeId}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "200px",
                bgcolor: "grey.300",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CardHeader title="Total Billed Amount" />
              <CardContent>

                <Typography variant="h5">{totalBilledAmount.toLocaleString("en-us", { style: "currency", currency: "INR" })}</Typography>

              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "200px",
                bgcolor: "grey.300",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CardHeader title="Active Bill Count" />
              <CardContent>
                <Typography variant="h5">{activeBillCount}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "200px",
                bgcolor: "grey.300",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CardHeader title="Deleted Bill Count" />
              <CardContent>
                <Typography variant="h5">{deletedBillCount}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "200px",
                bgcolor: "grey.300",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CardHeader title="Commission Percentage" />
              <CardContent>
                <Typography variant="h5">{commissionPercentage}%</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "200px",
                bgcolor: "grey.300",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CardHeader title="Commission Earned" />
              <CardContent>
                <Typography variant="h5">{commissionEarned.toLocaleString("en-us", { style: "currency", currency: "INR" })}</Typography>
              </CardContent>
            </Card>
          </Grid>


        </Grid>
      </Container>
    </div>
  );
};

export default Overview;
