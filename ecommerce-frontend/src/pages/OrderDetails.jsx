import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  Chip,
  Paper,
  Stack,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { orderService } from "../api/services";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  return `₹ ${Number(value).toLocaleString("en-IN")}`;
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const STATUS_UI = {
  CREATED: { label: "Created", color: "default" },
  PAYMENT_PENDING: { label: "Payment Pending", color: "warning" },
  PAID: { label: "Paid", color: "primary" },
  SHIPPED: { label: "Shipped", color: "info" },
  DELIVERED: { label: "Delivered", color: "success" },
  CANCELLED: { label: "Cancelled", color: "error" },
  REFUND_INITIATED: { label: "Refund Initiated", color: "warning" },
  REFUNDED: { label: "Refunded", color: "success" },
};

const InfoBox = ({ title, value }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 2.2,
        px: 2,
        py: 1.2,
        minWidth: 170,
      }}
    >
      <Typography
        sx={{
          fontSize: "0.72rem",
          fontWeight: 900,
          color: "text.secondary",
          letterSpacing: 0.6,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontWeight: 900, mt: 0.4 }}>{value}</Typography>
    </Paper>
  );
};

const SectionTitle = ({ title }) => {
  return (
    <Typography sx={{ fontWeight: 900, mb: 1.4, fontSize: "0.95rem" }}>
      {title}
    </Typography>
  );
};

const AdminOrderDetails = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrderById(orderId);
        setOrder(res.data);
      } catch (e) {
        console.error("Admin order fetch error", e);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const statusMeta = STATUS_UI[order?.status] || {
    label: order?.status || "—",
    color: "default",
  };

  const itemsSubtotal = useMemo(() => {
    if (!order?.items?.length) return 0;
    return order.items.reduce((sum, it) => sum + Number(it.itemTotal || 0), 0);
  }, [order]);

  if (loading) {
    return (
      <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, md: 5 } }}>
        <Typography sx={{ fontWeight: 900 }}>Order not found ❌</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, md: 5 } }}>
      {/* HEADER CARD */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          mb: 2,
        }}
      >
        <CardContent sx={{ px: 3, py: 2.4 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.35rem", sm: "1.6rem", md: "1.85rem" },
                }}
              >
                Order Details
            </Typography>


            </Box>

            <Stack direction="row" alignItems="center" gap={1}>
              <Typography sx={{ fontWeight: 800, color: "text.secondary" }}>
                Status :
              </Typography>
              <Chip
                label={statusMeta.label}
                color={statusMeta.color}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 900 }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* MAIN CARD */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ px: 3, py: 3 }}>
          {/* Order Info */}
          <SectionTitle title="Order Info" />

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <InfoBox title="ORDER ID" value={`#${order.orderId}`} />
            <InfoBox title="TOTAL AMOUNT" value={formatCurrency(order.totalAmount)} />
            <InfoBox title="CREATED AT" value={formatDateTime(order.createdAt)} />
          </Stack>

          <Divider sx={{ my: 3 }} />

        

          <Divider sx={{ my: 3 }} />

          {/* Delivery Details */}
          <SectionTitle title="Delivery Details" />

          <Paper
            elevation={0}
            sx={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 2.2,
              px: 2,
              py: 1.6,
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>
              {order?.shippingAddress?.fullName || "—"}
            </Typography>

            <Typography sx={{ color: "text.secondary", fontWeight: 700, mt: 0.6 }}>
              Phone: {order?.shippingAddress?.phoneNumber || "—"}
            </Typography>

            <Typography sx={{ fontWeight: 700, mt: 1 }}>
              {order?.shippingAddress
                ? `${order.shippingAddress.streetAddress}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country} - ${order.shippingAddress.postalCode}`
                : "No shipping address"}
            </Typography>
          </Paper>

          <Divider sx={{ my: 3 }} />

          {/* Items */}
          <SectionTitle title="Items in this Order" />

          <Paper
            elevation={0}
            sx={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 2.2,
              overflow: "hidden",
            }}
          >
            <Table size="small">
              <TableBody>
                {order.items?.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell sx={{ width: 70 }}>
                      <Box
                        component="img"
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.productName}
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          objectFit: "cover",
                          border: "1px solid rgba(0,0,0,0.08)",
                          backgroundColor: "#fff",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontWeight: 900 }}>
                        {item.productName}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.85rem" }}>
                        Product ID: {item.productId}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 900 }}>
                        Qty: {item.quantity}
                      </Typography>
                      <Typography sx={{ fontWeight: 900 }}>
                        {formatCurrency(item.itemTotal)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Divider sx={{ my: 3 }} />

          {/* Payment Summary small */}
          <SectionTitle title="Payment Summary" />

          <Paper
            elevation={0}
            sx={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 2.2,
              px: 2,
              py: 1.4,
            }}
          >
            <Stack direction="row" justifyContent="space-between" sx={{ py: 0.6 }}>
              <Typography sx={{ color: "text.secondary", fontWeight: 800 }}>
                Items Subtotal
              </Typography>
              <Typography sx={{ fontWeight: 900 }}>
                {formatCurrency(itemsSubtotal)}
              </Typography>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" justifyContent="space-between" sx={{ py: 0.6 }}>
              <Typography sx={{ color: "text.secondary", fontWeight: 900 }}>
                Total Amount
              </Typography>
              <Typography sx={{ fontWeight: 900 }}>
                {formatCurrency(order.totalAmount)}
              </Typography>
            </Stack>
          </Paper>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminOrderDetails;
