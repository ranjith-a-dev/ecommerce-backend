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
  Paper,
  Stack,
  IconButton,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "../api/services";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

const STATUS_LABELS = {
  CREATED: "Created",
  PAYMENT_PENDING: "Payment Pending",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUND_INITIATED: "Refund Initiated",
  REFUNDED: "Refunded",
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  return `₹ ${Number(value).toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
};

const formatDateLong = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;

      const res = await orderService.getMyOrders(params);
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

  const totals = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const pending = orders.filter((o) => o.status === "PAYMENT_PENDING").length;
    const cancelled = orders.filter((o) => o.status === "CANCELLED").length;
    return { total, delivered, pending, cancelled };
  }, [orders]);

  const getChipColor = (status) => {
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
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await orderService.cancelOrder(orderId);
      alert("Order cancelled successfully ✅");
      fetchOrders(true);
    } catch (err) {
      alert("Failed to cancel order: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRefundRequest = async (orderId) => {
    if (!window.confirm("Request refund for this order?")) return;

    try {
      await orderService.requestRefund(orderId);
      alert("Refund request submitted successfully ✅");
      fetchOrders(true);
    } catch (err) {
      alert("Failed to request refund: " + (err.response?.data?.message || err.message));
    }
  };

  const FilterButton = ({ value, label }) => {
    const active = filter === value;
    return (
      <Button
        onClick={() => setFilter(value)}
        variant={active ? "contained" : "outlined"}
        sx={{
          borderRadius: 999,
          fontWeight: 900,
          textTransform: "none",
          px: 2,
        }}
      >
        {label}
      </Button>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 14px 50px rgba(0,0,0,0.06)",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.4 }}>
              My Orders
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.4 }}>
              Track your purchases, payments, and delivery updates
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" gap={1}>
            <Chip
              label={`${totals.total} Orders`}
              variant="outlined"
              sx={{ borderRadius: 999, fontWeight: 900 }}
            />
            <Chip
              label={`${totals.delivered} Delivered`}
              color="success"
              variant="outlined"
              sx={{ borderRadius: 999, fontWeight: 900 }}
            />
            <Chip
              label={`${totals.pending} Pending`}
              color="warning"
              variant="outlined"
              sx={{ borderRadius: 999, fontWeight: 900 }}
            />
          </Stack>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <FilterButton value={null} label="All" />
          <FilterButton value="CREATED" label="Created" />
          <FilterButton value="PAYMENT_PENDING" label="Payment Pending" />
          <FilterButton value="PAID" label="Paid" />
          <FilterButton value="SHIPPED" label="Shipped" />
          <FilterButton value="DELIVERED" label="Delivered" />
          <FilterButton value="CANCELLED" label="Cancelled" />
          <FilterButton value="REFUND_INITIATED" label="Refund Initiated" />
          <FilterButton value="REFUNDED" label="Refunded" />
        </Box>
      </Paper>

      {orders.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            textAlign: "center",
            boxShadow: "0 14px 50px rgba(0,0,0,0.06)",
          }}
        >
          <ShoppingBagOutlinedIcon sx={{ fontSize: 54, opacity: 0.7 }} />
          <Typography variant="h6" sx={{ fontWeight: 900, mt: 1 }}>
            No orders found
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.6 }}>
            Start shopping and your orders will appear here.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2.5, px: 4, py: 1.2, borderRadius: 2, fontWeight: 900, textTransform: "none" }}
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {orders.map((order) => (
            <Card
              key={order.orderId}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 14px 50px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1.5}>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: "1.05rem" }}>
                      Order #{order.orderId}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.2 }}>
                      Placed on {formatDateLong(order.createdAt)}
                    </Typography>
                  </Box>

                  <Stack direction="row" alignItems="center" gap={1}>
                    <Chip
                      label={STATUS_LABELS[order.status] || order.status}
                      color={getChipColor(order.status)}
                      variant="outlined"
                      sx={{
                        borderRadius: 999,
                        fontWeight: 900,
                        px: 0.8,
                      }}
                    />
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.08)",
                    bgcolor: "rgba(0,0,0,0.02)",
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>Total Items</Typography>
                      <Typography sx={{ fontWeight: 900 }}>{order.totalItems ?? "—"}</Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>Order Amount</Typography>
                      <Typography sx={{ fontWeight: 900 }}>{formatCurrency(order.totalAmount)}</Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>Order Date</Typography>
                      <Typography sx={{ fontWeight: 900 }}>{formatDate(order.createdAt)}</Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} gap={1.2} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={() => navigate(`/orders/${order.orderId}`)}
                    sx={{ borderRadius: 2, fontWeight: 900, textTransform: "none" }}
                  >
                    View Details
                  </Button>

                  <Stack direction="row" gap={1} justifyContent={{ xs: "flex-end", sm: "flex-end" }} flexWrap="wrap">
                    {(order.status === "CREATED" || order.status === "PAYMENT_PENDING" || order.status === "PAID") && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelRoundedIcon />}
                        onClick={() => handleCancelOrder(order.orderId)}
                        sx={{ borderRadius: 2, fontWeight: 900, textTransform: "none" }}
                      >
                        Cancel
                      </Button>
                    )}

                    {order.status === "DELIVERED" && (
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<ReplayRoundedIcon />}
                        onClick={() => handleRefundRequest(order.orderId)}
                        sx={{ borderRadius: 2, fontWeight: 900, textTransform: "none" }}
                      >
                        Request Refund
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default Orders;
