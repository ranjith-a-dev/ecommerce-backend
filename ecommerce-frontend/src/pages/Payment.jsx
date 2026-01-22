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
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";

const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { cartItems, totalAmount, shippingAddress } = state || {};
  const [method, setMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("PENDING");
  // PENDING | SUCCESS | FAILED

  if (!cartItems) {
    return <Typography sx={{ mt: 4 }}>Invalid session</Typography>;
  }

  /* ---------------- SUCCESS PAYMENT ---------------- */
  const handleSuccessPayment = async () => {
    try {
      setLoading(true);

      // Step 1: Create order via /orders/checkout
      const orderRes = await api.post("/orders/checkout", {
        shippingAddress,
      });

      if (orderRes.data && orderRes.data.orderId) {
        const orderId = orderRes.data.orderId;

        // Step 2: Initiate payment for the created order
        const paymentInitRes = await api.post("/payments/initiate", null, {
          params: { orderId },
        });

        if (paymentInitRes.data && paymentInitRes.data.paymentReference) {
          const paymentRef = paymentInitRes.data.paymentReference;

          // Step 3: Mark payment as success
          await api.post("/payments/success", null, {
            params: { paymentRef },
          });

          // Step 4: Clear cart after successful order
          try {
            // Get all cart items and delete them
            const cartRes = await api.get("/cart");
            const cartItems = cartRes.data;
            if (Array.isArray(cartItems)) {
              for (const item of cartItems) {
                await api.delete(`/cart/${item.productId}`);
              }
            }
          } catch (cartErr) {
            console.error("Error clearing cart:", cartErr);
          }

          setStatus("SUCCESS");

          // Navigate to orders page after 1.5 seconds
          setTimeout(() => {
            navigate("/orders");
          }, 1500);
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      setStatus("FAILED");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FAILED PAYMENT ---------------- */
  const handleFailedPayment = () => {
    setStatus("FAILED");
  };

  /* ---------------- RETRY PAYMENT ---------------- */
  const retryPayment = () => {
    setStatus("PENDING");
  };

  /* ================= SUCCESS UI ================= */
  if (status === "SUCCESS") {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" color="success.main" fontWeight={600}>
          🎉 Payment Successful
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Your order has been placed successfully.
        </Typography>
      </Container>
    );
  }

  /* ================= FAILED UI ================= */
  if (status === "FAILED") {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" color="error.main" fontWeight={600}>
          ❌ Payment Failed
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Something went wrong. Please try again.
        </Typography>

        <Button
          variant="contained"
          sx={{ mt: 3, mr: 2 }}
          onClick={retryPayment}
        >
          Retry Payment
        </Button>

        <Button
          variant="outlined"
          sx={{ mt: 3 }}
          onClick={() => navigate("/checkout")}
        >
          Back to Checkout
        </Button>
      </Container>
    );
  }

  /* ================= PAYMENT PAGE ================= */
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Payment
      </Typography>

      {/* ORDER SUMMARY */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography fontWeight={600}>Order Summary</Typography>
          <Divider sx={{ my: 1 }} />

          {cartItems.map((item) => (
            <Box
              key={item.productId}
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>
                {item.productName} × {item.quantity}
              </Typography>
              <Typography>
                ₹ {item.price * item.quantity}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ my: 1 }} />
          <Typography fontWeight={600}>Total: ₹ {totalAmount}</Typography>
        </CardContent>
      </Card>

      {/* PAYMENT METHOD */}
      <Card>
        <CardContent>
          <Typography fontWeight={600}>Payment Method</Typography>

          <RadioGroup
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <FormControlLabel value="COD" control={<Radio />} label="Cash on Delivery" />
            <FormControlLabel value="UPI" control={<Radio />} label="UPI (Demo)" />
            <FormControlLabel value="CARD" control={<Radio />} label="Card (Demo)" />
          </RadioGroup>
        </CardContent>
      </Card>

      {/* DEMO PAYMENT BUTTONS */}
      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3, py: 1.5 }}
        onClick={handleSuccessPayment}
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay Success (Demo)"}
      </Button>

      <Button
        fullWidth
        variant="outlined"
        color="error"
        sx={{ mt: 2, py: 1.5 }}
        onClick={handleFailedPayment}
        disabled={loading}
      >
        Pay Failed (Demo)
      </Button>
    </Container>
  );
};

export default Payment;
