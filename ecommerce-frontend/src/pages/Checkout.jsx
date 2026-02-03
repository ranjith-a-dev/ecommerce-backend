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

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

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

  const applyBackendFieldErrors = (backendErrors) => {
    if (!backendErrors || typeof backendErrors !== "object") return;

    const mapped = {};

    Object.keys(backendErrors).forEach((key) => {
      const msg = backendErrors[key];

      const cleanKey = key.includes(".") ? key.split(".").pop() : key;

      mapped[cleanKey] = msg;
    });

    setErrors(mapped);
  };

  const handleProceed = async () => {
    setPlaceOrderError("");
    setErrors({});

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

      navigate("/payment", {
        state: {
          cartItems,
          totalAmount,
          shippingAddress: trimmedFormData,
          orderId: orderResponse.data?.orderId,
        },
      });
    } catch (error) {
      const data = error.response?.data;

      if (data && typeof data === "object" && !Array.isArray(data)) {
        applyBackendFieldErrors(data);
        setPlaceOrderError("Please fix the highlighted fields");
      } else {
        const msg =
          data?.message ||
          error.message ||
          "Failed to place order. Please try again.";
        setPlaceOrderError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const requiredFieldSx = {
    mb: 2,
    "& .MuiFormLabel-asterisk": {
      color: "error.main",
      fontWeight: 900,
      ml: 0.2,
    },
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
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
                required
                label="Full Name"
                fullWidth
                variant="outlined"
                placeholder="John Doe"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
                sx={requiredFieldSx}
              />

              <TextField
                required
                label="Phone Number"
                fullWidth
                variant="outlined"
                placeholder="9876543210"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                sx={requiredFieldSx}
              />

              <TextField
                required
                label="Street Address"
                fullWidth
                variant="outlined"
                placeholder="123 Main St, Apt 4B"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                error={!!errors.streetAddress}
                helperText={errors.streetAddress}
                sx={requiredFieldSx}
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    label="City"
                    fullWidth
                    variant="outlined"
                    placeholder="New York"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={!!errors.city}
                    helperText={errors.city}
                    sx={{
                      "& .MuiFormLabel-asterisk": {
                        color: "error.main",
                        fontWeight: 900,
                        ml: 0.2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    label="State"
                    fullWidth
                    variant="outlined"
                    placeholder="TN"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    error={!!errors.state}
                    helperText={errors.state}
                    sx={{
                      "& .MuiFormLabel-asterisk": {
                        color: "error.main",
                        fontWeight: 900,
                        ml: 0.2,
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    label="Postal Code"
                    fullWidth
                    variant="outlined"
                    placeholder="641001"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    error={!!errors.postalCode}
                    helperText={errors.postalCode}
                    sx={{
                      "& .MuiFormLabel-asterisk": {
                        color: "error.main",
                        fontWeight: 900,
                        ml: 0.2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    label="Country"
                    fullWidth
                    variant="outlined"
                    placeholder="India"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    error={!!errors.country}
                    helperText={errors.country}
                    sx={{
                      "& .MuiFormLabel-asterisk": {
                        color: "error.main",
                        fontWeight: 900,
                        ml: 0.2,
                      },
                    }}
                  />
                </Grid>
              </Grid>
                    <Grid item xs={12} sm={6}>
                      <Divider sx={{ my: 1 }} />
              </Grid>
                {placeOrderError && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "error.main",
                      fontWeight: 700,
                      mt: 1,
                      mb: 2,
                    }}
                  >
                    {placeOrderError}
                  </Typography>
                )}
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
              minHeight: 520,
            }}
          >
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
