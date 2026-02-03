import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Box,
  CircularProgress,
  Stack,
  Chip,
  Paper,
  Grid,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { paymentService, cartService } from "../api/services";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  return `₹ ${Number(value).toLocaleString("en-IN")}`;
};

const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { cartItems, totalAmount, orderId } = state || {};

  const [method, setMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("PENDING");

  const itemsSubtotal = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((sum, it) => sum + Number(it.itemTotal || it.price * it.quantity || 0), 0);
  }, [cartItems]);

  if (!cartItems || !orderId) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
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
            Invalid session ❌
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Please go back to checkout and try again.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/checkout")}
            sx={{ borderRadius: 2, fontWeight: 900 }}
          >
            Back to Checkout
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleSuccessPayment = async () => {
    try {
      setLoading(true);

      const initRes = await paymentService.initiatePayment(orderId);
      const paymentRef = initRes.data?.paymentReference;

      if (!paymentRef) throw new Error("Payment reference not received");

      await paymentService.markPaymentSuccess(paymentRef);

      const cartRes = await cartService.getCart();
      const items = cartRes.data;

      if (Array.isArray(items)) {
        for (const item of items) {
          await cartService.removeFromCart(item.productId);
        }
      }
      
      setStatus("SUCCESS");

      setTimeout(() => {
        navigate("/orders", { replace: true });
      }, 1200);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setStatus("FAILED");
    } finally {
      setLoading(false);
    }
  };

  const handleFailedPayment = async () => {
    try {
      setLoading(true);

      const initRes = await paymentService.initiatePayment(orderId);
      const paymentRef = initRes.data?.paymentReference;

      if (!paymentRef) throw new Error("Payment reference not received");

      await paymentService.markPaymentFailure(paymentRef);

      setStatus("FAILED");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setStatus("FAILED");
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = () => setStatus("PENDING");

  if (status === "SUCCESS") {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            textAlign: "center",
            boxShadow: "0 16px 60px rgba(0,0,0,0.08)",
          }}
        >
          <CheckCircleRoundedIcon sx={{ fontSize: 56, color: "success.main" }} />
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
            Payment Successful 🎉
          </Typography>
          <Typography sx={{ mt: 1.5, color: "text.secondary", fontWeight: 600 }}>
            Your order has been placed successfully.
          </Typography>
          <Typography sx={{ mt: 2, color: "text.secondary" }}>
            Redirecting to your orders...
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (status === "FAILED") {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            textAlign: "center",
            boxShadow: "0 16px 60px rgba(0,0,0,0.08)",
          }}
        >
          <CancelRoundedIcon sx={{ fontSize: 56, color: "error.main" }} />
          <Typography variant="h4" sx={{ fontWeight: 900, mt: 1 }}>
            Payment Failed
          </Typography>
          <Typography sx={{ mt: 1.5, color: "text.secondary", fontWeight: 600 }}>
            Something went wrong. Please try again.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<ReplayRoundedIcon />}
              onClick={retryPayment}
              sx={{ borderRadius: 2, fontWeight: 900, py: 1.1, flex: 1 }}
            >
              Retry Payment
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
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
            <Stack direction="row" alignItems="center" gap={1}>
              <PaymentsRoundedIcon />
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.4 }}>
                Payment
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.4 }}>
              Order ID: <b>#{orderId}</b>
            </Typography>
          </Box>

          <Chip
            label="Demo Payment"
            variant="outlined"
            sx={{
              borderRadius: 999,
              fontWeight: 900,
              bgcolor: "rgba(33,150,243,0.10)",
              borderColor: "rgba(33,150,243,0.35)",
            }}
          />
        </Stack>
      </Paper>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 14px 50px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" gap={1}>
                  <ShoppingBagOutlinedIcon />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                    Order Summary
                  </Typography>
                </Stack>
                <Typography sx={{ fontWeight: 900 }}>
                  {formatCurrency(totalAmount)}
                </Typography>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.4}>
                {cartItems.map((item) => (
                  <Box
                    key={item.productId}
                    sx={{
                      p: 1.6,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                      bgcolor: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>{item.productName}</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.2 }}>
                          Qty: <b>{item.quantity}</b>
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 900 }}>
                        {formatCurrency(item.itemTotal || item.price * item.quantity)}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>Items Subtotal</Typography>
                  <Typography sx={{ fontWeight: 900 }}>{formatCurrency(itemsSubtotal)}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>Total Amount</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: "1.05rem" }}>
                    {formatCurrency(totalAmount)}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 14px 50px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" gap={1}>
                  <CurrencyRupeeRoundedIcon />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                    Payment Method
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <RadioGroup value={method} onChange={(e) => setMethod(e.target.value)}>
                <FormControlLabel value="COD" control={<Radio />} label="Cash on Delivery" />
                <FormControlLabel value="UPI" control={<Radio />} label="UPI" />
                <FormControlLabel value="CARD" control={<Radio />} label="Card" />
              </RadioGroup>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={handleSuccessPayment}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} /> : <CheckCircleRoundedIcon />}
                  sx={{ borderRadius: 2, fontWeight: 900, py: 1.2, textTransform: "none" }}
                >
                  {loading ? "Processing..." : "Pay Success "}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleFailedPayment}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} /> : <CancelRoundedIcon />}
                  sx={{ borderRadius: 2, fontWeight: 900, py: 1.2, textTransform: "none" }}
                >
                  {loading ? "Processing..." : "Pay Failed "}
                </Button>
              </Stack>

              <Typography variant="caption" sx={{ display: "block", mt: 1.6, color: "text.secondary", textAlign: "center" }}>
                This is a demo payment screen (no real money is processed)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Payment;
