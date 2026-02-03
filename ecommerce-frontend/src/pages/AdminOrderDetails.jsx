import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Button,
  Chip,
  Stack,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminOrderService } from "../api/services";
import { isAdmin } from "../utils/authUtils";

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

const STATUS_COLORS = {
  CREATED: { text: "#616161" },
  PAYMENT_PENDING: { text: "#e65100" },
  PAID: { text: "#1565c0" },
  SHIPPED: { text: "#006064" },
  DELIVERED: { text: "#1b5e20" },
  CANCELLED: { text: "#b71c1c" },
  REFUND_INITIATED: { text: "#e65100" },
  REFUNDED: { text: "#1b5e20" },
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  return `₹ ${Number(value).toLocaleString("en-IN")}`;
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const StatusChip = ({ status }) => {
  const palette = STATUS_COLORS[status] || STATUS_COLORS.CREATED;
  const label = STATUS_LABELS[status] || status || "—";

  return (
    <Chip
      label={label}
      variant="outlined"
      sx={{
        height: 30,
        borderRadius: 999,
        fontWeight: 900,
        fontSize: "0.78rem",
        color: palette.text,
        borderColor: "rgba(0,0,0,0.15)",
        bgcolor: "rgba(0,0,0,0.02)",
      }}
    />
  );
};

const InfoCard = ({ label, value }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.07)",
        bgcolor: "rgba(0,0,0,0.015)",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.78rem",
          fontWeight: 900,
          color: "text.secondary",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography sx={{ mt: 0.6, fontWeight: 900, fontSize: "1.05rem", color: "#111827" }}>
        {value}
      </Typography>
    </Paper>
  );
};

const SectionTitle = ({ title }) => {
  return (
    <Typography
      sx={{
        fontWeight: 900,
        fontSize: "0.95rem",
        color: "#111827",
        letterSpacing: 0.2,
        mb: 1.3,
      }}
    >
      {title}
    </Typography>
  );
};

const AdminOrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      alert("You are not authorized to access this page");
      navigate("/");
      return;
    }
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await adminOrderService.getAdminOrderById(orderId);
      setOrder(res.data);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to load order details");
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const getAllowedNextStatuses = (currentStatus, refundRequested) => {
    if (currentStatus === "CREATED") return ["CANCELLED"];
    if (currentStatus === "PAYMENT_PENDING") return ["CANCELLED"];
    if (currentStatus === "PAID") return ["SHIPPED", "CANCELLED"];
    if (currentStatus === "SHIPPED") return ["DELIVERED"];
    if (currentStatus === "DELIVERED") return refundRequested ? ["REFUND_INITIATED"] : [];
    if (currentStatus === "REFUND_INITIATED") return ["REFUNDED"];
    return [];
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await adminOrderService.updateOrderStatus(order.orderId, newStatus);
      await fetchOrder();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(0,0,0,0.01)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!order) return null;

  const allowedStatuses = getAllowedNextStatuses(order.status, order.refundRequested);

  return (
    <Box sx={{ bgcolor: "rgba(0,0,0,0.015)", minHeight: "calc(100vh - 64px)" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.2, md: 3 },
            borderRadius: 4,
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            mb: 3,
            bgcolor: "rgba(255,255,255,0.9)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={2}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#111827" }}>
                Order Details
              </Typography>
              <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
                Order #{order.orderId}
              </Typography>
            </Box>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 1 }}
                >
                <Typography
                    sx={{
                    fontWeight: 900,
                    fontSize: "0.95rem",
                    color: "text.secondary",
                    }}
                >
                    Status :&nbsp;&nbsp;
                </Typography>

                <Box>
                    <StatusChip status= {order.status} />
                </Box>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.2, md: 3 },
            borderRadius: 4,
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            bgcolor: "rgba(255,255,255,0.92)",
          }}
        >
          <SectionTitle title="Order Info" />
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <InfoCard label="ORDER ID" value={`#${order.orderId}`} />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoCard label="TOTAL AMOUNT" value={formatCurrency(order.totalAmount)} />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoCard label="CREATED AT" value={formatDateTime(order.createdAt)} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <SectionTitle title="Customer (Account)" />
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.07)",
              bgcolor: "rgba(0,0,0,0.015)",
            }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: "1rem", color: "#111827" }}>
              {order.userBasicDTO?.username || "—"}
            </Typography>

            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.88rem",
                color: "text.secondary",
                mt: 0.4,
              }}
            >
              User ID: {order.userId ?? "—"}
            </Typography>
          </Paper>

          <Divider sx={{ my: 3 }} />

          <SectionTitle title="Delivery Details" />
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.07)",
              bgcolor: "rgba(0,0,0,0.015)",
            }}
          >
            {order.shippingAddressDTO ? (
              <Box>
                <Typography sx={{ fontWeight: 900, color: "#111827" }}>
                  {order.shippingAddressDTO.fullName || "—"}
                </Typography>

                <Typography sx={{ fontWeight: 700, color: "text.secondary", mt: 0.5 }}>
                  Phone: {order.shippingAddressDTO.phoneNumber || "—"}
                </Typography>

                <Typography sx={{ fontWeight: 800, mt: 0.8, color: "#111827" }}>
                  {order.shippingAddressDTO.streetAddress},{" "}
                  {order.shippingAddressDTO.city}, {order.shippingAddressDTO.state},{" "}
                  {order.shippingAddressDTO.country} - {order.shippingAddressDTO.postalCode}
                </Typography>

                {order.shippingAddressDTO.deliveryInstructions && (
                  <Typography sx={{ fontWeight: 700, color: "text.secondary", mt: 0.8 }}>
                    Instructions: {order.shippingAddressDTO.deliveryInstructions}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography sx={{ fontWeight: 700, color: "text.secondary" }}>—</Typography>
            )}
          </Paper>

          <Divider sx={{ my: 3 }} />

          <SectionTitle title="Items in this Order" />
          {order.items?.length ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
              {order.items.map((it) => (
                <Paper
                  key={it.productId}
                  elevation={0}
                  sx={{
                    p: 1.6,
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,0.08)",
                    bgcolor: "rgba(0,0,0,0.015)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.6, minWidth: 0 }}>
                    <img
                      src={it.imageUrl || "/placeholder.png"}
                      alt={it.productName}
                      style={{
                        width: 62,
                        height: 62,
                        objectFit: "contain",
                        borderRadius: 14,
                        background: "#fff",
                        border: "1px solid rgba(0,0,0,0.10)",
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />

                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900, color: "#111827" }} noWrap>
                        {it.productName}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.85rem" }} noWrap>
                        Product ID: {it.productId}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontWeight: 900, color: "#111827" }}>
                      Qty: {it.quantity}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: "text.secondary", fontSize: "0.85rem", mt: 0.2 }}>
                      {formatCurrency(it.priceAtPurchase)}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography sx={{ fontWeight: 700, color: "text.secondary" }}>
              No items found
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          <SectionTitle title="Update Order Status" />

          <Stack direction="row" gap={1} flexWrap="wrap">
            {["SHIPPED", "DELIVERED", "CANCELLED", "REFUND_INITIATED", "REFUNDED"].map((st) => {
              const allowed = allowedStatuses.includes(st);
              const isActive = order.status === st;

              return (
                <Button
                  key={st}
                  variant={isActive ? "contained" : "outlined"}
                  disabled={!allowed || updating}
                  onClick={() => handleUpdateStatus(st)}
                  sx={{
                    borderRadius: 999,
                    fontWeight: 900,
                    textTransform: "none",
                    px: 2,
                    bgcolor: isActive ? "#111827" : "transparent",
                    color: isActive ? "#fff" : "#111827",
                    borderColor: "rgba(0,0,0,0.18)",
                    "&:hover": {
                      bgcolor: isActive ? "#111827" : "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  {STATUS_LABELS[st]}
                </Button>
              );
            })}
          </Stack>

          {updating && (
            <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 2 }}>
              <CircularProgress size={18} />
              <Typography sx={{ fontWeight: 800, color: "text.secondary" }}>
                Updating status...
              </Typography>
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminOrderDetails;
