import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { productService, cartService } from "../api/services";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Box,
  Divider,
} from "@mui/material";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    productService.getProductById(id)
      .then(res => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await cartService.addToCart(product.id, 1);
      alert("Added to cart successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (!product) return <Typography>Product not found</Typography>;

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" gap={5} flexWrap="wrap">
        
        {/* LEFT: Product Image */}
        <Box>
          <img
            src={product.imageUrls?.[0] || "/placeholder.png"}
            alt={product.name}
            width="320"
            style={{ borderRadius: 10 }}
          />
        </Box>

        {/* RIGHT: Product Info */}
        <Box maxWidth="500px">
          <Typography variant="h4">{product.name}</Typography>

          <Typography variant="h5" color="green" mt={1}>
            ₹{product.price}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1">
            {product.description}
          </Typography>

          <Typography
            mt={2}
            fontWeight="bold"
            color={product.stock > 0 ? "green" : "red"}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </Typography>

          <Button
            variant="contained"
            sx={{ mt: 3 }}
            disabled={product.stock === 0 || addingToCart}
            onClick={handleAddToCart}
          >
            {addingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ProductDetails;
