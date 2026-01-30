import {
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  Button,
  Divider,
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
      if (filter) params.status = filter;

      const res = await orderService.getMyOrders(params);

      // ✅ supports backend Page response OR array response
      const orderData = res.data?.content || res.data || [];

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
      case "PAYMENT_PENDING":
        return "warning";
      case "CREATED":
        return "default";
      case "PAID":
        return "info";
      case "SHIPPED":
        return "primary";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "error";
      case "REFUND_INITIATED":
        return "secondary";
      case "REFUNDED":
        return "success";
      default:
        return "default";
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await orderService.cancelOrder(orderId);
        alert("Order cancelled successfully ✅");
        fetchOrders();
      } catch (err) {
        alert(
          "Failed to cancel order: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleRefundRequest = async (orderId) => {
    if (window.confirm("Request refund for this order?")) {
      try {
        await orderService.requestRefund(orderId);
        alert("Refund request submitted successfully ✅");
        fetchOrders();
      } catch (err) {
        alert(
          "Failed to request refund: " +
            (err.response?.data?.message || err.message)
        );
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
      <Typography variant="h4" fontWeight={700} gutterBottom align="center" color="#222">
        My Orders
      </Typography>

      {/* FILTER BUTTONS */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
        <Button
          variant={filter === null ? "contained" : "outlined"}
          onClick={() => setFilter(null)}
        >
          All Orders
        </Button>

        <Button
          variant={filter === "CREATED" ? "contained" : "outlined"}
          onClick={() => setFilter("CREATED")}
        >
          Created
        </Button>

        <Button
          variant={filter === "PAYMENT_PENDING" ? "contained" : "outlined"}
          onClick={() => setFilter("PAYMENT_PENDING")}
        >
          Payment Pending
        </Button>

        <Button
          variant={filter === "PAID" ? "contained" : "outlined"}
          onClick={() => setFilter("PAID")}
        >
          Paid
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

        <Button
          variant={filter === "REFUND_INITIATED" ? "contained" : "outlined"}
          onClick={() => setFilter("REFUND_INITIATED")}
        >
          Refund Initiated
        </Button>

        <Button
          variant={filter === "REFUNDED" ? "contained" : "outlined"}
          onClick={() => setFilter("REFUNDED")}
        >
          Refunded
        </Button>
      </Box>

      {orders.length === 0 ? (
        <Card sx={{ boxShadow: 1, borderRadius: 2, background: "#fafbfc" }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography color="textSecondary" fontSize={20} fontWeight={500}>
              No orders found
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3, px: 4, py: 1.5, fontWeight: 500, borderRadius: 2, boxShadow: 0, background: "#1976d2" }}
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {orders.map((order) => (
            <Box key={order.orderId}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: 1,
                  transition: "box-shadow 0.2s",
                  background: "#fff",
                  border: "1px solid #e0e0e0"
                }}
              >
                <CardContent>
                  {/* ORDER HEADER */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Box>
                      <Typography fontWeight={600} fontSize={17} color="#222">
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
                      sx={{ fontWeight: 500, px: 2, fontSize: 15, borderRadius: 1, background: "#f5f5f5", color: "#333" }}
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  {/* ORDER SUMMARY */}
                  <Box sx={{ mb: 2, background: "#fafbfc", borderRadius: 1, p: 2, boxShadow: 0, border: "1px solid #ececec" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography color="textSecondary" fontWeight={500}>Total Items:</Typography>
                      <Typography fontWeight={600}>{order.totalItems}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography color="textSecondary" fontWeight={500}>Order Amount:</Typography>
                      <Typography fontWeight={600} color="#1976d2">
                        ₹ {typeof order.totalAmount === "number" ? order.totalAmount.toLocaleString() : order.totalAmount}
                      </Typography>
                    </Box>
                  </Box>
                  {/* ORDER FOOTER */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </Typography>
                    {/* ACTION BUTTONS */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ fontWeight: 500, px: 2, boxShadow: 0, borderRadius: 2, background: "#1976d2" }}
                        onClick={() => navigate(`/orders/${order.orderId}`)}
                      >
                        View Details
                      </Button>
                      {(order.status === "CREATED" || order.status === "PAYMENT_PENDING" || order.status === "PAID") && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          sx={{ fontWeight: 500, px: 2, borderRadius: 2, border: "1px solid #e57373" }}
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
                          sx={{ fontWeight: 500, px: 2, borderRadius: 2, border: "1px solid #ffb300" }}
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
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Orders;
