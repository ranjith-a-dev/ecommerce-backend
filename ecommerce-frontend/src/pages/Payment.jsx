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
import { paymentService, cartService } from "../api/services";

const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { cartItems, totalAmount, orderId } = state || {};
  const [method, setMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("PENDING");
  // PENDING | SUCCESS | FAILED

  if (!cartItems || !orderId) {
    return <Typography sx={{ mt: 4 }}>Invalid session</Typography>;
  }

  /* ---------------- SUCCESS PAYMENT ---------------- */
  const handleSuccessPayment = async () => {
    try {
      setLoading(true);

      // Step 1: Check if payment already exists, otherwise initiate it
      let paymentRef = null;
      
      try {
        // Try to initiate payment (first attempt)
        console.log("Attempting to initiate payment for orderId:", orderId);
        const paymentInitRes = await paymentService.initiatePayment(orderId);
        console.log("Payment initiated successfully:", paymentInitRes.data);
        paymentRef = paymentInitRes.data?.paymentReference;
      } catch (err) {
        // If payment already initiated, fetch the existing payment using the new endpoint
        console.log("Payment already initiated, error:", err.message);
        console.log("Fetching existing payment for order:", orderId);
        try {
          const paymentRes = await paymentService.getPaymentByOrderId(orderId);
          console.log("Found existing payment:", paymentRes.data);
          paymentRef = paymentRes.data?.paymentReference;
        } catch (fetchErr) {
          console.error("Failed to fetch payment:", fetchErr);
          throw new Error("Could not find payment to process");
        }
      }

      if (paymentRef) {
        console.log("Processing payment with reference:", paymentRef);
        // Step 2: Mark payment as success
        const successRes = await paymentService.markPaymentSuccess(paymentRef);
        console.log("Payment marked as success:", successRes.data);

        // Step 3: Clear cart after successful payment
        try {
          const cartRes = await cartService.getCart();
          const cartItems = cartRes.data;
          if (Array.isArray(cartItems)) {
            for (const item of cartItems) {
              await cartService.removeFromCart(item.productId);
            }
          }
        } catch (cartErr) {
          console.error("Error clearing cart:", cartErr);
        }

        console.log("Setting status to SUCCESS");
        setStatus("SUCCESS");

        // Navigate to orders page after 1.5 seconds
        setTimeout(() => {
          navigate("/orders");
        }, 1500);
      } else {
        throw new Error("No payment reference obtained");
      }
    } catch (err) {
      console.error("Payment error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setStatus("FAILED");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FAILED PAYMENT ---------------- */
  const handleFailedPayment = async () => {
    try {
      setLoading(true);

      // Step 1: Check if payment already exists, otherwise initiate it
      let paymentRef = null;

      try {
        // Try to initiate payment (first attempt)
        const paymentInitRes = await paymentService.initiatePayment(orderId);
        paymentRef = paymentInitRes.data?.paymentReference;
      } catch (err) {
        // If payment already initiated, fetch the existing payment using the new endpoint
        try {
          const paymentRes = await paymentService.getPaymentByOrderId(orderId);
          paymentRef = paymentRes.data?.paymentReference;
        } catch (fetchErr) {
          throw new Error("Could not find payment to process");
        }
      }

      if (paymentRef) {
        // Mark payment as failed
        await paymentService.markPaymentFailure(paymentRef);

        setStatus("FAILED");
      }
    } catch (err) {
      console.error("Payment failure error:", err);
      setStatus("FAILED");
    } finally {
      setLoading(false);
    }
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
                ₹ {item.itemTotal || (item.price * item.quantity)}
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
