import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { cartService, productService } from "../api/services";
import { useNavigate, useLocation } from "react-router-dom";
import { isAdmin } from "../utils/authUtils";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";

const ProductCard = ({ product, cartItems, refreshCart, refreshProducts }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isUserAdmin = isAdmin();

  const outOfStock = Number(product?.stock || 0) === 0;
  const addedToCart = cartItems?.some((item) => item.productId === product.id);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);

  const [msg, setMsg] = useState({ text: "", type: "" });
  const clearMsg = () => setMsg({ text: "", type: "" });

  const handleAdd = async () => {
    clearMsg();

    const token = localStorage.getItem("token");

    if (!token || token === "null" || token === "undefined") {
      setMsg({ text: "Please login to add items to cart", type: "error" });

      setTimeout(() => {
        clearMsg();
        navigate("/login", { state: { from: location.pathname } });
      }, 2000);

      return;
    }

    if (adding || outOfStock || addedToCart) return;

    try {
      setAdding(true);
      await cartService.addToCart(product.id, 1);

      setMsg({ text: "Added to cart", type: "success" });

      setTimeout(() => {
        clearMsg();
      }, 2000);

      refreshCart?.();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to add to cart";

      const isUnauthorized =
        err.response?.status === 401 ||
        errorMsg.toLowerCase().includes("invalid") ||
        errorMsg.toLowerCase().includes("expired");

      if (isUnauthorized) {
        localStorage.removeItem("token");

        setMsg({ text: "Please login to add items to cart", type: "error" });

        setTimeout(() => {
          clearMsg();
          navigate("/login", { state: { from: location.pathname } });
        }, 2000);

        return;
      }

      setMsg({ text: errorMsg, type: "error" });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      await productService.deleteProduct(product.id);
      setOpenDelete(false);
      refreshProducts?.();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(78,84,200,0.14)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.9) 100%)",
          boxShadow: "0 18px 60px rgba(78,84,200,0.10)",
          transition: "0.25s",
          position: "relative",
          "&:hover": {
            transform: "translateY(-7px)",
            boxShadow: "0 30px 95px rgba(78,84,200,0.18)",
          },
        }}
      >
        {isUserAdmin && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              display: "flex",
              gap: 0.8,
              zIndex: 10,
              backgroundColor: "rgba(255,255,255,0.92)",
              borderRadius: 999,
              px: 0.8,
              py: 0.4,
              border: "1px solid rgba(78,84,200,0.18)",
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/products/edit/${product.id}`);
              }}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 999,
                border: "1px solid rgba(78,84,200,0.35)",
                bgcolor: "rgba(78,84,200,0.10)",
                color: "#4e54c8",
              }}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDelete(true);
              }}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 999,
                border: "1px solid rgba(244,67,54,0.30)",
                bgcolor: "rgba(244,67,54,0.08)",
                color: "error.main",
              }}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <Box
          sx={{ cursor: "pointer", bgcolor: "rgba(78,84,200,0.06)" }}
          onClick={() => navigate(`/products/${product.id}`)}
        >
          <CardMedia
            component="img"
            image={product.imageUrls?.[0] || "/placeholder.png"}
            alt={product.name}
            sx={{ height: 220, objectFit: "contain", p: 2.2 }}
          />

          {outOfStock && (
            <Chip
              label="Out of Stock"
              color="error"
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                fontWeight: 900,
                borderRadius: 999,
              }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            sx={{
              fontWeight: 900,
              mb: 0.7,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 44,
            }}
          >
            {product.name}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            {isUserAdmin ? (
              <Typography sx={{ fontWeight: 700, color: "#64748b" }}>
                Stock: {product.stock}
              </Typography>
            ) : (
              <Chip
                label="Free Delivery"
                size="small"
                sx={{
                  borderRadius: 999,
                  fontWeight: 900,
                  bgcolor: "rgba(34,197,94,0.12)",
                  color: "#166534",
                  border: "1px solid rgba(34,197,94,0.25)",
                }}
              />
            )}

            <Button
              size="small"
              onClick={() => navigate(`/products/${product.id}`)}
              sx={{
                fontWeight: 900,
                textTransform: "none",
                borderRadius: 999,
                px: 1.6,
                color: "#4e54c8",
                "&:hover": { bgcolor: "rgba(78,84,200,0.10)" },
              }}
            >
              View →
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.2,
              mt: 0.4,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: "#4e54c8",
                letterSpacing: -0.3,
              }}
            >
              ₹ {Number(product.price || 0).toLocaleString("en-IN")}
            </Typography>

            {msg.type === "success" && (
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 900,
                  color: "#2e7d32",
                  px: 1.2,
                  py: 0.35,
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                }}
              >
                Added to cart
              </Typography>
            )}
          </Box>

          {msg.text && msg.type === "error" && (
            <Typography
              sx={{
                mt: 1,
                fontSize: "0.82rem",
                fontWeight: 800,
                color: "#d32f2f",
              }}
            >
              {msg.text}
            </Typography>
          )}
        </CardContent>

        {!isUserAdmin && (
          <Box sx={{ px: 2, pb: 2.2 }}>
            <Button
              variant="contained"
              fullWidth
              disabled={outOfStock || addedToCart || adding}
              onClick={handleAdd}
              startIcon={<ShoppingCartRoundedIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 3,
                py: 1.15,
                boxShadow: "0 2px 10px rgba(78,84,200,0.20)",
                background:
                  outOfStock || addedToCart
                    ? "linear-gradient(90deg, rgba(148,163,184,0.9) 0%, rgba(203,213,225,0.9) 100%)"
                    : "linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)",
              }}
            >
              {outOfStock
                ? "Out of Stock"
                : addedToCart
                ? "Added to cart"
                : "Add to Cart"}
            </Button>
          </Box>
        )}
      </Card>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ fontWeight: 900 }}>Delete Product</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#64748b", fontWeight: 600 }}>
            Are you sure you want to delete <b>{product.name}</b>?
          </Typography>
          <Typography sx={{ color: "#64748b", mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDelete(false)}
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 900, textTransform: "none" }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{ borderRadius: 2, fontWeight: 900, textTransform: "none" }}
            startIcon={
              deleting ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;
