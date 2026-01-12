import { Container, Grid, Pagination, Typography, Select, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [categoryId, setCategoryId] = useState("");

  const fetchProducts = async (pageNumber) => {
    try {
      const res = await api.get("/products", {
        params: {
          page: pageNumber - 1,
          size: 9,
          categoryId: categoryId || undefined,
        },
      });

      setProducts(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProducts(page);
  }, [page, categoryId]);

  const handleAddToCart = (productId) => {
    console.log("Add to cart clicked for product:", productId);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>

      {/* CATEGORY FILTER */}
      <Select
        value={categoryId}
        onChange={(e) => {
          setCategoryId(e.target.value);
          setPage(1);
        }}
        displayEmpty
        sx={{ mb: 3, minWidth: 220 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value={1}>Mobiles</MenuItem>
        <MenuItem value={2}>Laptops</MenuItem>
        <MenuItem value={3}>Accessories</MenuItem>
        <MenuItem value={4}>Smart Devices</MenuItem>
      </Select>

      {/* PRODUCTS GRID */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard
              product={product}
              onAddToCart={handleAddToCart}
            />
          </Grid>
        ))}
      </Grid>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          sx={{ mt: 4, display: "flex", justifyContent: "center" }}
        />
      )}
    </Container>
  );
};

export default Products;
