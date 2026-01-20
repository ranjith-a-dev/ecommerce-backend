import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, cartItems, refreshCart }) => {
  const navigate = useNavigate();
  const outOfStock = product.stock === 0;

  const addedToCart = cartItems?.some(
    (item) => item.productId === product.id
  );

  const handleAdd = async () => {
    await api.post("/cart", null, {
      params: {
        productId: product.id,
        quantity: 1,
      },
    });
    refreshCart();
  };

  return (
    <Card
      sx={{
        height: 410,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        transition: "0.25s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 14px 28px rgba(0,0,0,0.14)",
        },
      }}
    >
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
            gap: 1.5,            // ✅ guaranteed spacing
            mb: 1,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexGrow: 1 }} // ✅ pushes button right
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

      {/* ADD TO CART */}
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
    </Card>
  );
};

export default ProductCard;
