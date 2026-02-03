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
  Paper,
  Chip,
} from "@mui/material";
import { Add, Remove, DeleteOutline, ShoppingCartCheckout } from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { cartService } from "../api/services";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      const res = await cartService.getCart();
      setCartItems(res.data);
    } catch {
      setCartItems([]);
    }
  }, []);

  const increaseQty = async (productId, qty, stock) => {
    if (qty >= stock) return;
    await cartService.updateCartItem(productId, qty + 1);
    fetchCart();
  };

  const decreaseQty = async (productId, qty) => {
    if (qty <= 1) return;
    await cartService.updateCartItem(productId, qty - 1);
    fetchCart();
  };

  const removeItem = async (productId) => {
    await cartService.removeFromCart(productId);
    fetchCart();
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            color: "#1a1a1a"
          }}
        >
          🛒 My Cart
        </Typography>
        <Typography 
          variant="body1" 
          color="textSecondary"
          sx={{ fontSize: "1.1rem" }}
        >
          {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
        </Typography>
      </Box>

      {cartItems.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: 2,
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ mb: 2, color: "textSecondary" }}
          >
            Your cart is empty
          </Typography>
          <Typography 
            variant="body1" 
            color="textSecondary"
            sx={{ mb: 3 }}
          >
            Add some items to get started!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/products")}
            sx={{ borderRadius: 2 }}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {cartItems.map((item) => (
                <Card 
                  key={item.productId}
                  sx={{ 
                    display: "flex", 
                    p: 2.5, 
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                      transform: "translateY(-2px)",
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    image={item.imageUrl}
                    alt={item.productName}
                    sx={{
                      width: 140,
                      height: 140,
                      objectFit: "contain",
                      mr: 3,
                      borderRadius: 1,
                      backgroundColor: "#f9f9f9",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                      }
                    }}
                    onClick={() => navigate(`/products/${item.productId}`)}
                  />

                  <CardContent sx={{ flexGrow: 1, p: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          mb: 0.5,
                          color: "#1a1a1a",
                          cursor: "pointer",
                          "&:hover": { color: "#1976d2" }
                        }}
                        onClick={() => navigate(`/products/${item.productId}`)}
                      >
                        {item.productName}
                      </Typography>
                      <Typography 
                        variant="h6"
                        sx={{ 
                          color: "#1976d2", 
                          fontWeight: 700,
                          mb: 2
                        }}
                      >
                        ₹ {item.price.toLocaleString()}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => decreaseQty(item.productId, item.quantity)}
                          disabled={item.quantity <= 1}
                          sx={{
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            backgroundColor: "#f5f5f5",
                            "&:hover": {
                              backgroundColor: "#eeeeee",
                            }
                          }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>

                        <Typography 
                          sx={{ 
                            mx: 1.5, 
                            fontWeight: 700,
                            minWidth: "30px",
                            textAlign: "center"
                          }}
                        >
                          {item.quantity}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={() => increaseQty(item.productId, item.quantity, item.stock)}
                          disabled={item.quantity >= item.stock}
                          sx={{
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            backgroundColor: "#f5f5f5",
                            "&:hover": {
                              backgroundColor: "#eeeeee",
                            }
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>

                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{ ml: 2 }}
                        >
                          Subtotal: <span style={{ fontWeight: 700, color: "#000" }}>₹ {(item.price * item.quantity).toLocaleString()}</span>
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <Box sx={{ display: "flex", alignItems: "flex-start", ml: 2 }}>
                    <IconButton
                      color="error"
                      onClick={() => removeItem(item.productId)}
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "#ffebee",
                          transform: "scale(1.1)",
                        }
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
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
              <Typography 
                variant="h6"
                sx={{ 
                  fontWeight: 700,
                  mb: 2.5,
                  color: "#1a1a1a"
                }}
              >
                Order Summary
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography color="textSecondary">
                    Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
                  </Typography>
                  <Typography fontWeight={600}>
                    ₹ {totalAmount.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography color="textSecondary">Shipping</Typography>
                  <Typography fontWeight={600} color="success.main">
                    Free
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography color="textSecondary">Taxes</Typography>
                  <Typography fontWeight={600}>Calculated at checkout</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography 
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1a1a1a" }}
                >
                  Total
                </Typography>
                <Typography 
                  variant="h6"
                  sx={{ 
                    fontWeight: 700, 
                    color: "#1976d2",
                    fontSize: "1.5rem"
                  }}
                >
                  ₹ {totalAmount.toLocaleString()}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => navigate("/checkout")}
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
                  }
                }}
                startIcon={<ShoppingCartCheckout />}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate("/products")}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 1.5,
                  textTransform: "none",
                }}
              >
                Continue Shopping
              </Button>

              <Paper
                sx={{
                  p: 2,
                  mt: 3,
                  backgroundColor: "#e3f2fd",
                  border: "1px solid #90caf9",
                  borderRadius: 1,
                }}
              >
                <Typography 
                  variant="body2"
                  sx={{ color: "#1565c0", lineHeight: 1.6 }}
                >
                  ✓ Free shipping on all orders<br/>
                  ✓ Easy returns within 30 days<br/>
                  ✓ Secure checkout
                </Typography>
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Cart;
