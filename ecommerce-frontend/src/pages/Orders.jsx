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
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "../api/services";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

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
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const Orders = () => {
  const navigate = useNavigate();

  const [refundLoading, setRefundLoading] = useState({});
  const [cancelLoading, setCancelLoading] = useState({});

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);

  const [searchId, setSearchId] = useState("");

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const [confirmBox, setConfirmBox] = useState({
    open: false,
    title: "",
    message: "",
    action: null,
  });

  const openConfirm = ({ title, message, action }) => {
    setConfirmBox({ open: true, title, message, action });
  };

  const closeConfirm = () => {
    setConfirmBox({ open: false, title: "", message: "", action: null });
  };

  const handleConfirmYes = async () => {
    try {
      if (confirmBox.action) await confirmBox.action();
    } finally {
      closeConfirm();
    }
  };

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
      showToast("Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

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
    openConfirm({
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order?",
      action: async () => {
        try {
          setCancelLoading((prev) => ({ ...prev, [orderId]: true }));
          await orderService.cancelOrder(orderId);
          showToast("Order cancelled successfully", "success");
          await fetchOrders();
        } catch (err) {
          showToast(err.response?.data?.message || err.message, "error");
        } finally {
          setCancelLoading((prev) => ({ ...prev, [orderId]: false }));
        }
      },
    });
  };

  const handleRefundRequest = async (orderId) => {
    openConfirm({
      title: "Return Product",
      message: "Return product and get refund for this order?",
      action: async () => {
        try {
          setRefundLoading((prev) => ({ ...prev, [orderId]: true }));
          await orderService.requestRefund(orderId);
          setOrders((prev) =>
            prev.map((o) =>
              o.orderId === orderId ? { ...o, refundRequested: true } : o
            )
          );
          showToast("Refund request submitted successfully", "success");
          await fetchOrders();
        } catch (err) {
          showToast(err.response?.data?.message || err.message, "error");
        } finally {
          setRefundLoading((prev) => ({ ...prev, [orderId]: false }));
        }
      },
    });
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

  const filteredOrders = orders.filter((order) => {
    if (!searchId.trim()) return true;
    const id = String(order.orderId ?? "");
    return id.includes(searchId.trim());
  });

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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.4 }}>
              My Orders
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.4 }}>
              Track your purchases, payments, and delivery updates
            </Typography>
          </Box>

          <Box sx={{ width: { xs: "100%", sm: 340 } }}>
            <TextField
              fullWidth
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Search by Order ID..."
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
                endAdornment: searchId ? (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchId("")} size="small">
                      <CloseRoundedIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontWeight: 900,
                },
              }}
            />
          </Box>
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

      {filteredOrders.length === 0 ? (
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
            sx={{
              mt: 2.5,
              px: 4,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 900,
              textTransform: "none",
            }}
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filteredOrders.map((order) => (
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
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  gap={1.5}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: "1.05rem" }}>
                      Order #{order.orderId}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mt: 0.2 }}
                    >
                      Placed on {formatDateLong(order.createdAt)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: "text.secondary",
                      }}
                    >
                      Status :
                    </Typography>

                    <Chip
                      label={STATUS_LABELS[order.status] || order.status}
                      color={getChipColor(order.status)}
                      variant="outlined"
                      sx={{ borderRadius: 999, fontWeight: 900, px: 0.8 }}
                    />
                  </Box>
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
                      <Typography
                        sx={{ color: "text.secondary", fontWeight: 700 }}
                      >
                        Total Items
                      </Typography>
                      <Typography sx={{ fontWeight: 900 }}>
                        {order.totalItems ?? "—"}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography
                        sx={{ color: "text.secondary", fontWeight: 700 }}
                      >
                        Order Amount
                      </Typography>
                      <Typography sx={{ fontWeight: 900 }}>
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography
                        sx={{ color: "text.secondary", fontWeight: 700 }}
                      >
                        Order Date
                      </Typography>
                      <Typography sx={{ fontWeight: 900 }}>
                        {formatDate(order.createdAt)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  gap={1.2}
                  sx={{ mt: 2 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={() => navigate(`/orders/${order.orderId}`)}
                    sx={{ borderRadius: 2, fontWeight: 900, textTransform: "none" }}
                  >
                    View Details
                  </Button>

                  <Stack
                    direction="row"
                    gap={1}
                    flexWrap="wrap"
                    justifyContent="flex-end"
                  >
                    {(order.status === "CREATED" ||
                      order.status === "PAYMENT_PENDING" ||
                      order.status === "PAID") && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelRoundedIcon />}
                        onClick={() => handleCancelOrder(order.orderId)}
                        disabled={cancelLoading[order.orderId]}
                        sx={{ borderRadius: 2, fontWeight: 900, textTransform: "none" }}
                      >
                        {cancelLoading[order.orderId] ? "Cancelling..." : "Cancel"}
                      </Button>
                    )}

                    {order.status === "DELIVERED" && !order.refundRequested && (
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<ReplayRoundedIcon />}
                        onClick={() => handleRefundRequest(order.orderId)}
                        disabled={refundLoading[order.orderId]}
                        sx={{ borderRadius: 2, fontWeight: 900, textTransform: "none" }}
                      >
                        {refundLoading[order.orderId] ? "Requesting..." : "Return Product"}
                      </Button>
                    )}

                    {(order.status === "REFUND_INITIATED" || order.refundRequested) && (
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: "0.9rem",
                          color: "#e65100",
                        }}
                      >
                        Refund Processing...
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{ fontWeight: 900, borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Dialog open={confirmBox.open} onClose={closeConfirm} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>{confirmBox.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontWeight: 600 }}>
            {confirmBox.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeConfirm}
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 900, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmYes}
            variant="contained"
            color="warning"
            sx={{ borderRadius: 2, fontWeight: 900, textTransform: "none" }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;
