import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService, categoryService } from "../api/services";
import { isAdmin } from "../utils/authUtils";

const AdminProductEdit = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isCreate = !productId;
  const [loading, setLoading] = useState(!isCreate);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrls: "",
  });

  useEffect(() => {
    if (!isAdmin()) {
      alert("You are not authorized to access this page");
      navigate("/");
      return;
    }

    const loadData = async () => {
      try {
        // Load categories
        const categoryRes = await categoryService.getAllCategories();
        setCategories(categoryRes.data || []);

        // Load product if editing
        if (!isCreate) {
          const productRes = await productService.getProductById(productId);
          const product = productRes.data;
          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price || "",
            stock: product.stock || "",
            categoryId: product.categoryId || "",
            imageUrls: product.imageUrls?.join("\n") || "",
          });
        }
      } catch (error) {
        alert("Failed to load data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId, isCreate, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.categoryId
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const submitData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId),
        imageUrls: formData.imageUrls
          .split("\n")
          .map((url) => url.trim())
          .filter((url) => url),
      };

      if (isCreate) {
        await productService.createProduct(submitData);
        alert("Product created successfully");
      } else {
        await productService.updateProduct(productId, submitData);
        alert("Product updated successfully");
      }

      navigate("/products");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save product");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        {isCreate ? "Create Product" : "Edit Product"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Product Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Price *"
              name="price"
              type="number"
              inputProps={{ step: "0.01" }}
              value={formData.price}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Stock *"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Category *</InputLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                label="Category *"
              >
                <MenuItem value="">Select Category</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Image URLs (one per line)"
              name="imageUrls"
              value={formData.imageUrls}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              size="small"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ flex: 1 }}
              >
                {submitting ? "Saving..." : isCreate ? "Create" : "Update"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/products")}
                disabled={submitting}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AdminProductEdit;
