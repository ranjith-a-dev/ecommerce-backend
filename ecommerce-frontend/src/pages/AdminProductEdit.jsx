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
  CircularProgress,
  Paper,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  Chip,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService, categoryService } from "../api/services";
import { isAdmin } from "../utils/authUtils";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

const toTitleCase = (str = "") =>
  str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

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

  const [formMsg, setFormMsg] = useState({ text: "", type: "" });

  const showMsg = (text, type = "info") => {
    setFormMsg({ text, type });
    setTimeout(() => {
      setFormMsg({ text: "", type: "" });
    }, 2500);
  };

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/", { replace: true });
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        const categoryRes = await categoryService.getAllCategories();
        setCategories(categoryRes.data || []);

        if (!isCreate) {
          const productRes = await productService.getProductById(productId);
          const product = productRes.data;

          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price ?? "",
            stock: product.stock ?? "",
            categoryId: product.categoryId
              ? String(product.categoryId)
              : product.category?.id
              ? String(product.category.id)
              : "",
            imageUrls: product.imageUrls?.join("\n") || "",
          });
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        showMsg("Failed to load data", "error");
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

  const imageUrlCount = useMemo(() => {
    return formData.imageUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean).length;
  }, [formData.imageUrls]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMsg({ text: "", type: "" });

    if (
      !formData.name?.trim() ||
      !formData.price ||
      !formData.stock ||
      !formData.categoryId
    ) {
      showMsg("Please fill in all required fields ⚠️", "error");
      return;
    }

    try {
      setSubmitting(true);
      showMsg(isCreate ? "Creating product..." : "Updating product...", "info");

      const submitData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId),
        imageUrls: formData.imageUrls
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
      };

      if (isCreate) {
        await productService.createProduct(submitData);
        showMsg("Product created successfully", "success");
      } else {
        await productService.updateProduct(productId, submitData);
        showMsg("Product updated successfully", "success");
      }

      setTimeout(() => {
        navigate("/products");
      }, 900);
    } catch (error) {
      showMsg(
        error.response?.data?.message || "Failed to save product",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getMsgColor = (type) => {
    if (type === "success") return "#2e7d32";
    if (type === "error") return "#d32f2f";
    return "#64748b";
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
    <Container maxWidth="md" sx={{ py: { xs: 2.5, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 14px 50px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
          >
            <Stack direction="row" alignItems="center" gap={1.5}>
              <IconButton
                onClick={() => navigate("/products")}
                sx={{
                  borderRadius: 2,
                  border: "1px solid rgba(0,0,0,0.12)",
                  bgcolor: "rgba(0,0,0,0.02)",
                }}
              >
                <ArrowBackRoundedIcon />
              </IconButton>

              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 900, letterSpacing: -0.4 }}
                >
                  {isCreate ? "Create Product" : "Edit Product"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.25 }}
                >
                  {isCreate
                    ? "Add a new product to your store catalog"
                    : `Update product details (ID: ${productId})`}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" gap={1}>
              <Chip
                label={`${imageUrlCount} image URL${
                  imageUrlCount === 1 ? "" : "s"
                }`}
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  fontWeight: 800,
                  bgcolor: "rgba(0,0,0,0.03)",
                  borderColor: "rgba(0,0,0,0.12)",
                }}
              />
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
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
                  inputProps={{ step: "0.01", min: 0 }}
                  value={formData.price}
                  onChange={handleChange}
                  fullWidth
                  required
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Stock *"
                  name="stock"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.stock}
                  onChange={handleChange}
                  fullWidth
                  required
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Inventory2OutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small" required>
                  <Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "rgba(0,0,0,0.02)",
                      "& .MuiSelect-select": {
                        fontWeight: 700,
                        color: formData.categoryId
                          ? "inherit"
                          : "text.secondary",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          mt: 1,
                          border: "1px solid rgba(0,0,0,0.08)",
                          boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
                        },
                      },
                    }}
                    renderValue={(selected) => {
                      if (!selected) return "Select Category";
                      const cat = categories.find(
                        (c) => String(c.id) === String(selected)
                      );
                      return cat ? toTitleCase(cat.name) : "Select Category";
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select Category
                    </MenuItem>

                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={String(cat.id)}>
                        {toTitleCase(cat.name)}
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
                  rows={5}
                  size="small"
                  placeholder={
                    "https://example.com/image1.jpg\nhttps://example.com/image2.jpg"
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ImageOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                  <Box sx={{ flex: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        fontWeight: 900,
                        py: 1.1,
                      }}
                    >
                      {submitting
                        ? "Saving..."
                        : isCreate
                        ? "Create Product"
                        : "Update Product"}
                    </Button>

                    {formMsg.text && (
                      <Typography
                        sx={{
                          mt: 1,
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          color: getMsgColor(formMsg.type),
                        }}
                      >
                        {formMsg.text}
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={() => navigate("/products")}
                    disabled={submitting}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      fontWeight: 900,
                      py: 1.1,
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminProductEdit;
