import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from "@mui/material";
import api from "../api/axios";

const ProductCard = ({ product, cartItems, refreshCart }) => {
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
    <Card sx={{ height: 320, display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        image={product.imageUrls?.[0]}
        alt={product.name}
        sx={{ height: 160, objectFit: "contain", p: 1 }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" noWrap>
          {product.name}
        </Typography>
        <Typography color="text.secondary">
          ₹ {product.price}
        </Typography>
      </CardContent>

      <Button
        variant="contained"
        disabled={outOfStock}
        onClick={handleAdd}
        sx={{
          m: 1,
          bgcolor: addedToCart ? "success.main" : "primary.main",
        }}
      >
        {outOfStock
          ? "Out of Stock"
          : addedToCart
          ? "Added to Cart"
          : "Add to Cart"}
      </Button>
    </Card>
  );
};

export default ProductCard;
