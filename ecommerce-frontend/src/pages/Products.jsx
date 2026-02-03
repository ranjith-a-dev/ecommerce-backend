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
  Button,
  Paper,
  Stack,
} from "@mui/material";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import { useEffect, useState } from "react";
import { productService, cartService } from "../api/services";
import ProductCard from "../components/ProductCard";
import { useNavigate, useSearchParams } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);

  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();
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

      const data = res.data;
      const productList = Array.isArray(data) ? data : data?.content || [];

      setProducts(productList);
      setTotalPages(Array.isArray(data) ? 1 : data?.totalPages || 0);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
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
        sx={{ fontWeight: 900, mb: 3.5, color: "#111827" }}
      >
        Products
      </Typography>

      <Grid
        container
        spacing={2}
        sx={{
          mb: 4,
          p: 2,
          backgroundColor: "#f9f9f9",
          borderRadius: 2,
        }}
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
            label="Available products only"
            sx={{ width: "100%" }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
  {products.length === 0 ? (
    <Grid item xs={12} sx={{ width: "100%" }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          mt: 6,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 680,
            borderRadius: 4,
            p: { xs: 4, sm: 6 },
            border: "1px solid rgba(0,0,0,0.08)",
            bgcolor: "#fff",
            textAlign: "center",
          }}
        >
          <Stack alignItems="center" spacing={2.2}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(78,84,200,0.10)",
                color: "#4e54c8",
              }}
            >
              <SearchOffRoundedIcon sx={{ fontSize: 34 }} />
            </Box>

            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
                color: "#111827",
              }}
            >
              {search ? "No results found" : "No products found"}
            </Typography>

            <Typography
              sx={{
                fontWeight: 700,
                color: "#6b7280",
                maxWidth: 520,
                fontSize: { xs: "0.9rem", sm: "1rem" },
              }}
            >
              {search
                ? `We couldn't find any product for "${search}". Try another keyword.`
                : "Start shopping and products will appear here."}
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/products")}
              sx={{
                mt: 1,
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 2.5,
                px: 3,
                py: 1.1,
                boxShadow: "0 10px 25px rgba(78,84,200,0.25)",
                background: "linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)",
              }}
            >
              {search ? "Clear Search" : "Browse Products"}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Grid>
  ) : (
    products.map((product) => (
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
    ))
  )}
</Grid>


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
