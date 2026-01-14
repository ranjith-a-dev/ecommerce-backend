import { Container, Grid, Pagination, Typography, Select, MenuItem, TextField, Checkbox, FormControlLabel } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { useSearchParams } from "react-router-dom";

const Products = () => {
  
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [searchParams] = useSearchParams();
  const [minPrice,setMinPrice] = useState("");
  const [maxPrice,setMaxPrice] = useState("");
  const [inStock,setInStock] = useState(false);
  const [cartItems,setCartItems] = useState([]);

  const search = searchParams.get("search");

  const fetchProducts = async (pageNumber) => {
    try {
      const res = await api.get("/products", {
        params: {
          page: pageNumber - 1,
          size: 9,
          categoryId: categoryId || undefined,
          name: search || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          inStock: inStock ? true : undefined,
        },
      });

      setProducts(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const fetchCarts = async () => {
    try{
      const res = await api.get("/cart");
      setCartItems(res.data);
    }
    catch{
      setCartItems([]);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProducts(page);
    fetchCarts();
  }, [page, categoryId, search,minPrice,maxPrice,inStock]);

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

       <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Min Price"
            type="number"
            fullWidth
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Max Price"
            type="number"
            fullWidth
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4} sx={{ display: "flex", alignItems: "center" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={inStock}
                onChange={(e) => {
                  setInStock(e.target.checked);
                  setPage(1);
                }}
              />
            }
            label="In Stock Only"
          />
        </Grid>
      </Grid>
 
      
      {/* PRODUCTS GRID */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard
              product={product}
              cartItems={cartItems}
              refreshCart={fetchCarts}
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
