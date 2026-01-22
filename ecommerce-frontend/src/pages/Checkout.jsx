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
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Checkout = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCartItems(res.data);
    } catch {
      setCartItems([]);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCart();
  }, []);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleProceed = () => {
  if (!address.trim()) {
    alert("Please enter shipping address");
    return;
  }

  navigate("/payment", {
    state: {
      cartItems,
      totalAmount,
      shippingAddress: address,
    },
  });
};


  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Checkout
      </Typography>

      <Grid container spacing={3}>
        {/* LEFT - ADDRESS */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Shipping Address
              </Typography>

              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="Enter full delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT - ORDER SUMMARY */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Order Summary
              </Typography>

              {cartItems.map((item) => (
                <Box
                  key={item.productId}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">
                    {item.productName} × {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    ₹ {(item.price * item.quantity).toLocaleString()}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                }}
              >
                <Typography>Total</Typography>
                <Typography>₹ {totalAmount.toLocaleString()}</Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3, py: 1.4, fontWeight: 600 }}
                disabled={cartItems.length === 0}
                onClick={handleProceed}
              >
                Place Order
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
