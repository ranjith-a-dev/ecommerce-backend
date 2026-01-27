import {
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "../api/services";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter) {
        params.status = filter;
      }
      const res = await orderService.getMyOrders(params);
      // Handle both paginated response (res.data.content) and direct array response
      const orderData = res.data?.content || res.data || [];
      console.log("Order response:", res.data); // Debug log
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "CONFIRMED":
        return "info";
      case "SHIPPED":
        return "primary";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "error";
      case "REFUND_REQUESTED":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await orderService.cancelOrder(orderId);
        alert("Order cancelled successfully");
        fetchOrders();
      } catch (err) {
        alert("Failed to cancel order: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleRefundRequest = async (orderId) => {
    if (window.confirm("Request refund for this order?")) {
      try {
        await orderService.requestRefund(orderId);
        alert("Refund request submitted successfully");
        fetchOrders();
      } catch (err) {
        alert("Failed to request refund: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        My Orders
      </Typography>

      {/* FILTER BUTTONS */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          variant={filter === null ? "contained" : "outlined"}
          onClick={() => setFilter(null)}
        >
          All Orders
        </Button>
        <Button
          variant={filter === "PENDING" ? "contained" : "outlined"}
          onClick={() => setFilter("PENDING")}
        >
          Pending
        </Button>
        <Button
          variant={filter === "CONFIRMED" ? "contained" : "outlined"}
          onClick={() => setFilter("CONFIRMED")}
        >
          Confirmed
        </Button>
        <Button
          variant={filter === "SHIPPED" ? "contained" : "outlined"}
          onClick={() => setFilter("SHIPPED")}
        >
          Shipped
        </Button>
        <Button
          variant={filter === "DELIVERED" ? "contained" : "outlined"}
          onClick={() => setFilter("DELIVERED")}
        >
          Delivered
        </Button>
        <Button
          variant={filter === "CANCELLED" ? "contained" : "outlined"}
          onClick={() => setFilter("CANCELLED")}
        >
          Cancelled
        </Button>
      </Box>

      {orders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography color="textSecondary">
              No orders found
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {Array.isArray(orders) && orders.length > 0 ? (
            orders.map((order) => (
              <Box key={order.orderId}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                  {/* ORDER HEADER */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography fontWeight={600}>
                        Order #{order.orderId}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      variant="outlined"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* ORDER SUMMARY */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography color="textSecondary">Total Items:</Typography>
                      <Typography fontWeight={600}>{order.totalItems}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography color="textSecondary">Order Amount:</Typography>
                      <Typography fontWeight={600}>
                        ₹ {typeof order.totalAmount === 'number' ? order.totalAmount.toLocaleString() : order.totalAmount}
                      </Typography>
                    </Box>
                  </Box>

                  {/* ORDER FOOTER */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 2,
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      Order placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>

                    {/* ACTION BUTTONS */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/orders/${order.orderId}`)}
                      >
                        View Details
                      </Button>

                      {order.status === "PENDING" && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleCancelOrder(order.orderId)}
                        >
                          Cancel
                        </Button>
                      )}

                      {order.status === "DELIVERED" && (
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          onClick={() => handleRefundRequest(order.orderId)}
                        >
                          Request Refund
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            ))
          ) : (
            <Typography sx={{ mt: 2 }}>No orders found</Typography>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Orders;
