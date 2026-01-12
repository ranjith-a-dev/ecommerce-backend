import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from "@mui/material";

const ProductCard = ({ product, onAddToCart }) => {
  const outOfStock = product.stock === 0;

  return (
    <Card sx={{ height: 320, display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        image={product.imageUrl}
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
        onClick={() => onAddToCart(product.id)}
        sx={{ m: 1 }}
      >
        {outOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>
    </Card>
  );
};

export default ProductCard;
