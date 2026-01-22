import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Divider,
  Box,
} from "@mui/material";
import { Add, Remove, DeleteOutline } from "@mui/icons-material";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCartItems(res.data);
    } catch {
      setCartItems([]);
    }
  };

  const increaseQty = async (productId, qty, stock) => {
    if (qty >= stock) return;
    await api.put(`/cart/${productId}`, null, {
      params: { quantity: qty + 1 },
    });
    fetchCart();
  };

  const decreaseQty = async (productId, qty) => {
    if (qty <= 1) return;
    await api.put(`/cart/${productId}`, null, {
      params: { quantity: qty - 1 },
    });
    fetchCart();
  };

  const removeItem = async (productId) => {
    await api.delete(`/cart/${productId}`);
    fetchCart();
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        My Cart
      </Typography>

      {cartItems.length === 0 && (
        <Typography>Your cart is empty</Typography>
      )}

      <Grid container spacing={3}>
        {cartItems.map((item) => (
          <Grid item xs={12} key={item.productId}>
            <Card sx={{ display: "flex", p: 2, borderRadius: 2 }}>
              {/* IMAGE */}
              <CardMedia
                component="img"
                image={item.imageUrl}
                sx={{
                  width: 120,
                  height: 120,
                  objectFit: "contain",
                  mr: 2,
                }}
              />

              {/* DETAILS */}
              <CardContent sx={{ flexGrow: 1, p: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {item.productName}
                </Typography>

                <Typography sx={{ color: "#1976d2", fontWeight: 700, mt: 0.5 }}>
                  ₹ {item.price}
                </Typography>

                {/* QUANTITY CONTROLS */}
                <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      decreaseQty(item.productId, item.quantity)
                    }
                  >
                    <Remove />
                  </IconButton>

                  <Typography sx={{ mx: 1, fontWeight: 600 }}>
                    {item.quantity}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={() =>
                      increaseQty(
                        item.productId,
                        item.quantity,
                        item.stock
                      )
                    }
                  >
                    <Add />
                  </IconButton>
                </Box>
              </CardContent>

              {/* REMOVE */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ml: 2,
                }}
              >
                <IconButton
                  color="error"
                  onClick={() => removeItem(item.productId)}
                >
                  <DeleteOutline />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* SUMMARY */}
      {cartItems.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Total: ₹ {totalAmount.toLocaleString()}
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/checkout")}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Cart;
