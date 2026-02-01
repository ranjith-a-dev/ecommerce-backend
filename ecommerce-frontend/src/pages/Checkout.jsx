import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cartService, orderService } from "../api/services";
import { ShoppingBag, LocalShipping, CreditCard } from "@mui/icons-material";

const Checkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    deliveryInstructions: "",
  });
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ NEW: place order error message
  const [placeOrderError, setPlaceOrderError] = useState("");

  const fetchCart = useCallback(async () => {
    try {
      const res = await cartService.getCart();
      setCartItems(res.data);
    } catch {
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // ✅ clear field error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // ✅ clear place order error while typing
    if (placeOrderError) {
      setPlaceOrderError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.streetAddress.trim())
      newErrors.streetAddress = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.postalCode.trim())
      newErrors.postalCode = "Postal code is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() &&
      formData.phoneNumber.trim() &&
      formData.streetAddress.trim() &&
      formData.city.trim() &&
      formData.state.trim() &&
      formData.postalCode.trim() &&
      formData.country.trim()
    );
  };

  const handleProceed = async () => {
    // ✅ clear old error message
    setPlaceOrderError("");

    if (!validateForm()) {
      setPlaceOrderError("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const trimmedFormData = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        streetAddress: formData.streetAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim(),
        deliveryInstructions: formData.deliveryInstructions.trim(),
      };

      const orderResponse = await orderService.checkout({
        shippingAddress: trimmedFormData,
      });

      // ✅ no alert - direct navigation
      navigate("/payment", {
        state: {
          cartItems,
          totalAmount,
          shippingAddress: trimmedFormData,
          orderId: orderResponse.data?.orderId,
        },
      });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to place order. Please try again.";

      // ✅ show below the button
      setPlaceOrderError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: "#1a1a1a",
          }}
        >
          🛍️ Checkout
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ fontSize: "1.1rem" }}
        >
          Complete your purchase in 2 easy steps
        </Typography>
      </Box>

      {/* PROGRESS INDICATOR */}
      <Stepper activeStep={0} sx={{ mb: 4 }}>
        <Step completed>
          <StepLabel>Shipping Address</StepLabel>
        </Step>
        <Step>
          <StepLabel>Payment</StepLabel>
        </Step>
      </Stepper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <LocalShipping
                  sx={{ mr: 1.5, color: "#1976d2", fontSize: "1.8rem" }}
                />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1a1a1a" }}
                >
                  Shipping Address
                </Typography>
              </Box>

              <TextField
                label="Full Name"
                fullWidth
                variant="outlined"
                placeholder="John Doe"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Phone Number"
                fullWidth
                variant="outlined"
                placeholder="9876543210"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Street Address"
                fullWidth
                variant="outlined"
                placeholder="123 Main St, Apt 4B"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                error={!!errors.streetAddress}
                helperText={errors.streetAddress}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    fullWidth
                    variant="outlined"
                    placeholder="New York"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={!!errors.city}
                    helperText={errors.city}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="State"
                    fullWidth
                    variant="outlined"
                    placeholder="NY"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    error={!!errors.state}
                    helperText={errors.state}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Postal Code"
                    fullWidth
                    variant="outlined"
                    placeholder="10001"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    error={!!errors.postalCode}
                    helperText={errors.postalCode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Country"
                    fullWidth
                    variant="outlined"
                    placeholder="India"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    error={!!errors.country}
                    helperText={errors.country}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <TextField
                label="Delivery Instructions (Optional)"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Leave at door, call on arrival, etc."
                name="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: "#f9f9f9",
              border: "1px solid #e0e0e0",
              position: "sticky",
              top: 20,
            }}
          >
            {/* ORDER ITEMS */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ShoppingBag sx={{ mr: 1, color: "#1976d2" }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1a1a1a" }}
                >
                  Order Summary
                </Typography>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#fff",
                  p: 2,
                  borderRadius: 1,
                  mb: 2,
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {cartItems.length === 0 ? (
                  <Typography
                    color="textSecondary"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    No items in cart
                  </Typography>
                ) : (
                  cartItems.map((item) => (
                    <Box
                      key={item.productId}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        pb: 1.5,
                        mb: 1.5,
                        borderBottom: "1px solid #eee",
                        "&:last-child": {
                          borderBottom: "none",
                          mb: 0,
                          pb: 0,
                        },
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {item.productName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Qty: {item.quantity}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "#1976d2" }}
                      >
                        ₹ {(item.price * item.quantity).toLocaleString()}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography fontWeight={600}>
                  ₹ {totalAmount.toLocaleString()}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography color="textSecondary">Shipping</Typography>
                <Typography fontWeight={600} color="success.main">
                  Free
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography color="textSecondary">Taxes</Typography>
                <Typography fontWeight={600} color="textSecondary">
                  Calculated at payment
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* TOTAL */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1a1a1a" }}
              >
                Total Amount
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#1976d2",
                }}
              >
                ₹ {totalAmount.toLocaleString()}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={!isFormValid() || cartItems.length === 0 || loading}
              onClick={handleProceed}
              sx={{
                py: 1.8,
                fontWeight: 700,
                fontSize: "1.1rem",
                borderRadius: 1.5,
                mb: 1.5,
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(135deg, #1565c0 0%, #1565c0 100%)",
                },
                "&:disabled": {
                  background: "#ccc",
                },
              }}
              startIcon={<CreditCard />}
            >
              {loading ? "Processing..." : "Place Order"}
            </Button>

            {/* ✅ SIMPLE TEXT MESSAGE BELOW BUTTON */}
            {placeOrderError && (
              <Typography
                variant="body2"
                sx={{
                  mt: -0.5,
                  mb: 1.5,
                  textAlign: "center",
                  fontWeight: 600,
                  color: "error.main",
                }}
              >
                {placeOrderError}
              </Typography>
            )}

            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={() => navigate("/carts")}
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderRadius: 1.5,
                textTransform: "none",
              }}
            >
              Back to Cart
            </Button>

            <Paper
              sx={{
                p: 2,
                mt: 2.5,
                backgroundColor: "#e8f5e9",
                border: "1px solid #81c784",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#2e7d32",
                  lineHeight: 1.6,
                  fontSize: "0.95rem",
                }}
              >
                ✓ Secure checkout
                <br />
                ✓ Your data is encrypted
                <br />
                ✓ Easy returns available
              </Typography>
            </Paper>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
