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
} from "@mui/material";
import { cartService, productService } from "../api/services";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/authUtils";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";

const ProductCard = ({ product, cartItems, refreshCart, refreshProducts }) => {
  const navigate = useNavigate();
  const outOfStock = product.stock === 0;
  const isUserAdmin = isAdmin();
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const addedToCart = cartItems?.some(
    (item) => item.productId === product.id
  );

  const handleAdd = async () => {
    await cartService.addToCart(product.id, 1);
    refreshCart();
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await productService.deleteProduct(product.id);
      alert("Product deleted successfully");
      setOpenDelete(false);
      refreshProducts?.();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          height: 410,
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          transition: "0.25s",
          position: "relative",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 14px 28px rgba(0,0,0,0.14)",
          },
        }}
      >
        {/* ADMIN ACTIONS - TOP RIGHT */}
        {isUserAdmin && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              display: "flex",
              gap: 0.5,
              zIndex: 10,
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 1,
              p: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
              color="primary"
              sx={{ p: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setOpenDelete(true)}
              color="error"
              sx={{ p: 0.5 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* IMAGE */}
        <Box sx={{ position: "relative", cursor: "pointer" }}>
          <CardMedia
            component="img"
            image={product.imageUrls?.[0] || "/placeholder.png"}
            alt={product.name}
            onClick={() => navigate(`/products/${product.id}`)}
            sx={{
              height: 210,
              objectFit: "contain",
              p: 2,
              bgcolor: "#fafafa",
            }}
          />

          {outOfStock && (
            <Chip
              label="Out of Stock"
              color="error"
              size="small"
              sx={{ position: "absolute", top: 12, left: 12 }}
            />
          )}
        </Box>

        {/* CONTENT */}
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography
            variant="subtitle1"
            noWrap
            sx={{ fontWeight: 600, mb: 0.5 }}
          >
            {product.name}
          </Typography>

          {/* STOCK + VIEW DETAILS (FIXED) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flexGrow: 1 }}
            >
              Stock: {product.stock}
            </Typography>

            <Button
              size="small"
              onClick={() => navigate(`/products/${product.id}`)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                p: 0,
                minWidth: "auto",
              }}
            >
              View Details →
            </Button>
          </Box>

          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1976d2" }}
          >
            ₹ {product.price.toLocaleString()}
          </Typography>
        </CardContent>

        {/* ADD TO CART - ONLY FOR NON-ADMINS */}
        {!isUserAdmin && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Button
              variant="contained"
              fullWidth
              disabled={outOfStock}
              onClick={handleAdd}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                py: 1.2,
                bgcolor: addedToCart ? "#4caf50" : "#1976d2",
                "&:hover": {
                  bgcolor: addedToCart ? "#43a047" : "#1565c0",
                },
              }}
            >
              {outOfStock
                ? "Out of Stock"
                : addedToCart
                ? "✓ Added to Cart"
                : "Add to Cart"}
            </Button>
          </Box>
        )}
      </Card>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{product.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;
