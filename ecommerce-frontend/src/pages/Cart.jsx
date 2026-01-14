import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/axios";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCartItems(res.data); // List<CartItemResponseDTO>
    } catch (err) {
      console.error("Failed to fetch cart", err);
    }
  };

  const increaseQty = async (productId, qty, stock) => {
  if (qty >= stock) return;

  try {
    await api.put(`/cart/${productId}`, null, {
      params: { quantity: qty + 1 },
    });
    fetchCart();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update quantity");
  }
};


  const decreaseQty = async (productId, qty) => {
  if (qty <= 1) return;

  try {
    await api.put(`/cart/${productId}`, null, {
      params: { quantity: qty - 1 },
    });
    fetchCart();
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    alert("Failed to update quantity");
  }
};


  const removeItem = async (productId) => {
    await api.delete(`/cart/${productId}`);
    fetchCart();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Cart
      </Typography>

      {cartItems.length === 0 && (
        <Typography>Your cart is empty</Typography>
      )}

      <Grid container spacing={2}>
        {cartItems.map((item) => (
          <Grid item xs={12} key={item.productId}>
            <Card sx={{ display: "flex", alignItems: "center", p: 2 }}>
              <CardMedia
                component="img"
                image={item.imageUrl}
                sx={{ width: 100, objectFit: "contain" }}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{item.productName}</Typography>
                <Typography>₹ {item.price}</Typography>
                <Typography>Stock: {item.stock}</Typography>

                <IconButton onClick={() => decreaseQty(item.productId, item.quantity)}>
                  −
                </IconButton>

                <Typography component="span" sx={{ mx: 1 }}>
                  {item.quantity}
                </Typography>

                <IconButton onClick={() => increaseQty(item.productId, item.quantity)}>
                  +
                </IconButton>
              </CardContent>

              <Button
                color="error"
                variant="outlined"
                onClick={() => removeItem(item.productId)}
              >
                Remove
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Cart;
