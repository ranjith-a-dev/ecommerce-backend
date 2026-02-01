import {
  Container,
  Grid,
  Pagination,
  Typography,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { productService, cartService } from "../api/services";
import ProductCard from "../components/ProductCard";
import { useSearchParams } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);

  const [cartItems, setCartItems] = useState([]);

  const [searchParams] = useSearchParams();
  const search = searchParams.get("search");

  const fetchProducts = async (pageNumber) => {
    try {
      const filters = {
        categoryId: categoryId ? Number(categoryId) : undefined,
        name: search || undefined,
        minPrice: minPrice !== "" ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== "" ? Number(maxPrice) : undefined,
        inStock: inStock ? true : undefined,
      };

      const res = await productService.getAllProducts(pageNumber - 1, 10, filters);

      // ✅ Support both backend formats:
      // 1) Pagination: { content: [...], totalPages: n }
      // 2) Direct Array: [ ... ]
      const data = res.data;
      const productList = Array.isArray(data) ? data : data?.content || [];

      setProducts(productList);
      setTotalPages(Array.isArray(data) ? 1 : data?.totalPages || 0);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setProducts([]);
      setTotalPages(0);
    }
  };

  const fetchCarts = async () => {
    try {
      const res = await cartService.getCart();
      setCartItems(res.data || []);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchProducts(page);
    fetchCarts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryId, search, minPrice, maxPrice, inStock]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 700, mb: 4, color: "#1a1a1a" }}
      >
        Products
      </Typography>

      {/* FILTERS */}
      <Grid
        container
        spacing={2}
        sx={{ mb: 4, p: 2, backgroundColor: "#f9f9f9", borderRadius: 2 }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            displayEmpty
            fullWidth
            size="small"
            sx={{ backgroundColor: "white" }}
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="1">Mobiles</MenuItem>
            <MenuItem value="2">Laptops</MenuItem>
            <MenuItem value="3">Accessories</MenuItem>
            <MenuItem value="4">Smart Devices</MenuItem>
          </Select>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Min Price"
            type="number"
            size="small"
            fullWidth
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            sx={{ backgroundColor: "white" }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Max Price"
            type="number"
            size="small"
            fullWidth
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            sx={{ backgroundColor: "white" }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ display: "flex", alignItems: "center" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={inStock}
                onChange={(e) => {
                  setInStock(e.target.checked);
                  setPage(1);
                }}
                size="small"
              />
            }
            label="In Stock Only"
            sx={{ width: "100%" }}
          />
        </Grid>
      </Grid>

      {/* PRODUCTS LIST */}
      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} lg={4} key={product.id} sx={{ display: "flex" }}>
            <Box sx={{ width: "100%" }}>
              <ProductCard
                product={product}
                cartItems={cartItems}
                refreshCart={fetchCarts}
                refreshProducts={() => fetchProducts(page)}
              />
            </Box>
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
