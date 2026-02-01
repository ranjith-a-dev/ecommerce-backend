import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  Chip,
  Button,
  CircularProgress,
  Stack,
  Paper,
  Grid,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { orderService } from "../api/services";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

const STATUS_UI = {
  CREATED: { label: "Created", variant: "outlined" },
  PAYMENT_PENDING: { label: "Payment Pending", variant: "outlined" },
  PAID: { label: "Paid", variant: "filled" },
  SHIPPED: { label: "Shipped", variant: "filled" },
  DELIVERED: { label: "Delivered", variant: "filled" },
  CANCELLED: { label: "Cancelled", variant: "outlined" },
  REFUND_INITIATED: { label: "Refund Initiated", variant: "outlined" },
  REFUNDED: { label: "Refunded", variant: "filled" },
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  return `₹ ${Number(value).toLocaleString("en-IN")}`;
};

const SummaryRow = ({ label, value, bold = false }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 3,
        py: 0.8,
      }}
    >
      <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
        {label}
      </Typography>

      <Typography
        sx={{
          fontWeight: bold ? 900 : 800,
          fontSize: bold ? "1.05rem" : "0.98rem",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrderById(orderId);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to load order", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const itemsSubtotal = useMemo(() => {
    if (!order?.items?.length) return 0;
    return order.items.reduce((sum, it) => sum + Number(it.itemTotal || 0), 0);
  }, [order]);

  const showPayButton =
    order?.status === "CREATED" || order?.status === "PAYMENT_PENDING";

  const handleRetryPayment = () => {
    navigate("/payment", {
      state: {
        cartItems: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        orderId: order.orderId,
      },
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
            Order not found ❌
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            The order you are trying to view may not exist or you may not have
            access.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/orders")}
            sx={{ borderRadius: 2, fontWeight: 900 }}
          >
            Back to Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  const statusMeta = STATUS_UI[order.status] || {
    label: order.status,
    variant: "outlined",
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
      {/* HEADER */}
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
            <Stack direction="row" alignItems="center" gap={1}>
              <ReceiptLongRoundedIcon />
              <Typography
                variant="h5"
                sx={{ fontWeight: 900, letterSpacing: -0.4 }}
              >
                Order Details
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.4, fontWeight: 700 }}
            >
              Order ID: <b>#{order.orderId}</b>
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" gap={1}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "text.secondary" }}>
              Status :
            </Typography>

            <Chip
              label={statusMeta.label}
              variant={statusMeta.variant}
              color={
                order.status === "CANCELLED"
                  ? "error"
                  : order.status === "DELIVERED"
                  ? "success"
                  : "primary"
              }
              sx={{
                borderRadius: 999,
                fontWeight: 900,
                px: 0.7,
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* CONTENT */}
      <Grid container spacing={2.5} alignItems="stretch">
        {/* ITEMS CARD */}
        <Grid item xs={12} md={7}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 14px 50px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                Items
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.4}>
                {order.items?.map((item) => (
                  <Box
                    key={item.productId}
                    sx={{
                      p: 1.6,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                      bgcolor: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={2}
                    >
              
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          component="img"
                          src={item.imageUrl || "/placeholder.png"}
                          alt={item.productName}
                          sx={{
                            width: 55,
                            height: 55,
                            borderRadius: 2,
                            objectFit: "cover",
                            border: "1px solid rgba(0,0,0,0.10)",
                            backgroundColor: "#fff",
                          }}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.png";
                          }}
                        />

                        <Box>
                          <Typography sx={{ fontWeight: 900 }}>
                            {item.productName}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              mt: 0.2,
                              fontWeight: 700,
                            }}
                          >
                            Qty: <b>{item.quantity}</b>
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography sx={{ fontWeight: 900 }}>
                        {formatCurrency(item.itemTotal)}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 14px 50px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                Payment Summary
              </Typography>

              <Divider sx={{ my: 2 }} />

              <SummaryRow
                label="Items Subtotal"
                value={formatCurrency(itemsSubtotal)}
              />

              <SummaryRow
                label="Total Amount"
                value={formatCurrency(order.totalAmount)}
                bold
              />

              {showPayButton && (
                <>
                  <Divider sx={{ my: 2.2 }} />

                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={handleRetryPayment}
                    startIcon={
                      order.status === "CREATED" ? (
                        <PaymentsRoundedIcon />
                      ) : (
                        <ReplayRoundedIcon />
                      )
                    }
                    sx={{
                      borderRadius: 2,
                      fontWeight: 900,
                      py: 1.2,
                      textTransform: "none",
                    }}
                  >
                    {order.status === "CREATED" ? "Pay Now" : "Retry Payment"}
                  </Button>

                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 1.2,
                      color: "text.secondary",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    Complete payment to confirm your order
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetails;
