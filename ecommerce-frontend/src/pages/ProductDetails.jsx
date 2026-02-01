import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { productService, cartService } from "../api/services";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Box,
  Divider,
  Paper,
  Chip,
} from "@mui/material";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const [msg, setMsg] = useState({ text: "", type: "" });

  // ✅ NEW: already in cart state
  const [alreadyInCart, setAlreadyInCart] = useState(false);
  const [checkingCart, setCheckingCart] = useState(false);

  useEffect(() => {
    setLoading(true);
    productService
      .getProductById(id)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ NEW: check if product already in cart
  useEffect(() => {
    const checkCart = async () => {
      try {
        setCheckingCart(true);
        const res = await cartService.getCart();

        const pid = Number(id);
        const found = (res.data || []).some(
          (item) => Number(item.productId) === pid
        );

        setAlreadyInCart(found);
      } catch {
        setAlreadyInCart(false);
      } finally {
        setCheckingCart(false);
      }
    };

    checkCart();
  }, [id]);

  const handleAddToCart = async () => {
    setMsg({ text: "", type: "" });

    try {
      setAddingToCart(true);
      await cartService.addToCart(product.id, 1);

      // ✅ update UI instantly
      setAlreadyInCart(true);

      setMsg({ text: "Added to cart successfully ✅", type: "success" });

      setTimeout(() => {
        navigate("/carts");
      }, 900);
    } catch (error) {
      setMsg({
        text: error.response?.data?.message || "Failed to add to cart",
        type: "error",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)",
          px: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: "1px solid rgba(78,84,200,0.12)",
            boxShadow: "0 16px 60px rgba(78,84,200,0.10)",
            textAlign: "center",
            maxWidth: 520,
            width: "100%",
            background: "rgba(255,255,255,0.92)",
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: 22, color: "#111827" }}>
            Product not found ❌
          </Typography>
          <Typography sx={{ mt: 1, color: "#6b7280", fontWeight: 600 }}>
            This product might be removed or unavailable.
          </Typography>
          <Button
            variant="contained"
            sx={{
              mt: 3,
              borderRadius: 3,
              fontWeight: 900,
              textTransform: "none",
              background: "linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)",
              boxShadow: "0 2px 10px rgba(78,84,200,0.16)",
            }}
            onClick={() => navigate("/products")}
          >
            Back to Products
          </Button>
        </Paper>
      </Box>
    );
  }

  const inStock = Number(product.stock || 0) > 0;

  // ✅ disable add to cart when already in cart / checking cart / adding
  const disableAddToCart =
    !inStock || addingToCart || alreadyInCart || checkingCart;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)",
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 5,
            border: "1px solid rgba(78,84,200,0.12)",
            boxShadow: "0 18px 70px rgba(78,84,200,0.12)",
            overflow: "hidden",
            background: "rgba(255,255,255,0.92)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 3, md: 5 },
              p: { xs: 2.5, md: 4 },
              alignItems: "flex-start",
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", md: 420 },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "rgba(78,84,200,0.05)",
                borderRadius: 4,
                border: "1px solid rgba(78,84,200,0.10)",
                p: { xs: 2, md: 3 },
              }}
            >
              <Box
                component="img"
                src={product.imageUrls?.[0] || "/placeholder.png"}
                alt={product.name}
                sx={{
                  width: "100%",
                  maxWidth: 320,
                  height: { xs: 240, md: 320 },
                  objectFit: "contain",
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: -0.5,
                    color: "#111827",
                    maxWidth: 520,
                  }}
                >
                  {product.name}
                </Typography>
              </Box>

              <Typography
                sx={{
                  mt: 1,
                  fontWeight: 900,
                  fontSize: 28,
                  color: "#4e54c8",
                }}
              >
                ₹ {Number(product.price || 0).toLocaleString("en-IN")}
              </Typography>

              <Typography
                sx={{
                  mt: 0.6,
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: Number(product.stock || 0) > 0 ? "#2e7d32" : "#d32f2f",
                }}
              >
                Stock Available: {Number(product.stock || 0)}
              </Typography>

              <Divider sx={{ my: 2.5, opacity: 0.6 }} />

              <Typography
                sx={{
                  color: "#475569",
                  fontSize: 16,
                  lineHeight: 1.7,
                  fontWeight: 600,
                }}
              >
                {product.description || "No description available."}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  mt: 2.5,
                }}
              >
                <Chip
                  icon={<LocalShippingRoundedIcon />}
                  label="Fast delivery"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 800,
                    bgcolor: "rgba(78,84,200,0.08)",
                    color: "#4e54c8",
                  }}
                />
                <Chip
                  icon={<SecurityRoundedIcon />}
                  label="Secure payment"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 800,
                    bgcolor: "rgba(78,84,200,0.08)",
                    color: "#4e54c8",
                  }}
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={disableAddToCart}
                  onClick={handleAddToCart}
                  startIcon={
                    addingToCart || checkingCart ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <ShoppingCartRoundedIcon />
                    )
                  }
                  sx={{
                    borderRadius: 3,
                    fontWeight: 900,
                    textTransform: "none",
                    py: 1.35,
                    background:
                      !inStock || alreadyInCart
                        ? "linear-gradient(90deg, rgba(148,163,184,0.9) 0%, rgba(203,213,225,0.9) 100%)"
                        : "linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)",
                    boxShadow: "0 2px 12px rgba(78,84,200,0.18)",
                  }}
                >
                  {checkingCart
                    ? "Checking..."
                    : addingToCart
                    ? "Adding..."
                    : alreadyInCart
                    ? "Already in Cart"
                    : "Add to Cart"}
                </Button>

                {/* ✅ OPTIONAL: show go to cart button when already in cart */}
                {alreadyInCart && (
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 1.4,
                      borderRadius: 3,
                      fontWeight: 900,
                      textTransform: "none",
                      borderColor: "rgba(78,84,200,0.35)",
                      color: "#4e54c8",
                      "&:hover": {
                        borderColor: "rgba(78,84,200,0.55)",
                        bgcolor: "rgba(78,84,200,0.06)",
                      },
                    }}
                    onClick={() => navigate("/carts")}
                  >
                    Go to Cart
                  </Button>
                )}

                {msg.text && (
                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: msg.type === "success" ? "#2e7d32" : "#d32f2f",
                    }}
                  >
                    {msg.text}
                  </Typography>
                )}

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    mt: 1.6,
                    borderRadius: 3,
                    fontWeight: 900,
                    textTransform: "none",
                    borderColor: "rgba(78,84,200,0.35)",
                    color: "#4e54c8",
                    "&:hover": {
                      borderColor: "rgba(78,84,200,0.55)",
                      bgcolor: "rgba(78,84,200,0.06)",
                    },
                  }}
                  onClick={() => navigate("/products")}
                >
                  Back to Products
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProductDetails;
