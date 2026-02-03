import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAdmin, isLoggedIn, logout } from "../utils/authUtils";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const loggedIn = isLoggedIn();
  const userIsAdmin = isAdmin();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(q);
  }, [location.search]);

  const handleSearch = () => {
    const q = search.trim();
    if (q) navigate(`/products?search=${encodeURIComponent(q)}`);
    else navigate("/products");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openMobile = Boolean(mobileMenuAnchor);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)",
        color: "white",
        borderBottom: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Typography
          component={Link}
          to="/"
          variant="h6"
          sx={{
            textDecoration: "none",
            color: "white",
            fontWeight: 900,
            letterSpacing: -0.2,
            whiteSpace: "nowrap",
          }}
        >
          Electro Mart
        </Typography>

        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 520,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.25)",
              px: 1,
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" sx={{ color: "white" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                px: 1,
                "& .MuiInputBase-input": { fontWeight: 700, color: "white" },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255,255,255,0.85)",
                  opacity: 1,
                },
              }}
            />

            <Button
              onClick={handleSearch}
              variant="contained"
              sx={{
                borderRadius: 999,
                fontWeight: 900,
                textTransform: "none",
                px: 2.2,
                py: 0.7,
                mr: 0.6,
                boxShadow: "none",
                bgcolor: "rgba(255,255,255,0.92)",
                color: "#4e54c8",
                "&:hover": { bgcolor: "white" },
              }}
            >
              Search
            </Button>
          </Paper>

          <Tooltip title="Search">
            <IconButton
              onClick={handleSearch}
              sx={{
                display: { xs: "inline-flex", sm: "none" },
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.22)",
                bgcolor: "rgba(255,255,255,0.14)",
                color: "white",
              }}
            >
              <SearchRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
          {!userIsAdmin && loggedIn && (
            <>
              <Button
                component={Link}
                to="/orders"
                startIcon={<ReceiptLongOutlinedIcon />}
                sx={{ color: "white", fontWeight: 900, textTransform: "none", borderRadius: 2 }}
              >
                Orders
              </Button>

              <Button
                component={Link}
                to="/carts"
                startIcon={<ShoppingCartOutlinedIcon />}
                sx={{ color: "white", fontWeight: 900, textTransform: "none", borderRadius: 2 }}
              >
                Cart
              </Button>
            </>
          )}

          {userIsAdmin && (
            <>
              <Button
                onClick={(e) => setAdminMenuAnchor(e.currentTarget)}
                startIcon={<AdminPanelSettingsRoundedIcon />}
                sx={{ color: "white", fontWeight: 900, textTransform: "none", borderRadius: 2 }}
              >
                Admin
              </Button>

              <Menu
                anchorEl={adminMenuAnchor}
                open={Boolean(adminMenuAnchor)}
                onClose={() => setAdminMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    mt: 1,
                    minWidth: 210,
                    border: "1px solid rgba(0,0,0,0.10)",
                    boxShadow: "0 18px 60px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <MenuItem component={Link} to="/admin/orders" onClick={() => setAdminMenuAnchor(null)} sx={{ fontWeight: 700 }}>
                  Manage Orders
                </MenuItem>
                <MenuItem component={Link} to="/admin/products/create" onClick={() => setAdminMenuAnchor(null)} sx={{ fontWeight: 700 }}>
                  Create Product
                </MenuItem>
              </Menu>
            </>
          )}

          {loggedIn ? (
            <Button
              onClick={handleLogout}
              variant="outlined"
              startIcon={<LogoutRoundedIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: 900,
                textTransform: "none",
                color: "white",
                borderColor: "rgba(255,255,255,0.35)",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.65)",
                  bgcolor: "rgba(255,255,255,0.12)",
                },
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                startIcon={<LoginRoundedIcon />}
                sx={{ color: "white", fontWeight: 900, textTransform: "none", borderRadius: 2 }}
              >
                Login
              </Button>

              <Button
                component={Link}
                to="/register"
                variant="contained"
                startIcon={<PersonAddAltRoundedIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 900,
                  textTransform: "none",
                  boxShadow: "none",
                  bgcolor: "rgba(255,255,255,0.92)",
                  color: "#4e54c8",
                  "&:hover": { bgcolor: "white" },
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
            sx={{
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.22)",
              bgcolor: "rgba(255,255,255,0.14)",
              color: "white",
            }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Menu
            anchorEl={mobileMenuAnchor}
            open={openMobile}
            onClose={() => setMobileMenuAnchor(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                mt: 1,
                minWidth: 220,
                border: "1px solid rgba(0,0,0,0.10)",
                boxShadow: "0 18px 60px rgba(0,0,0,0.12)",
              },
            }}
          >
            <MenuItem component={Link} to="/products" onClick={() => setMobileMenuAnchor(null)} sx={{ fontWeight: 700 }}>
              Products
            </MenuItem>

            {!userIsAdmin && loggedIn && (
              <>
                <MenuItem component={Link} to="/orders" onClick={() => setMobileMenuAnchor(null)} sx={{ fontWeight: 700 }}>
                  Orders
                </MenuItem>
                <MenuItem component={Link} to="/carts" onClick={() => setMobileMenuAnchor(null)} sx={{ fontWeight: 700 }}>
                  Cart
                </MenuItem>
              </>
            )}

            {userIsAdmin && (
              <>
                <MenuItem component={Link} to="/admin/orders" onClick={() => setMobileMenuAnchor(null)} sx={{ fontWeight: 700 }}>
                  Admin Orders
                </MenuItem>
                <MenuItem component={Link} to="/admin/products/create" onClick={() => setMobileMenuAnchor(null)} sx={{ fontWeight: 700 }}>
                  Create Product
                </MenuItem>
              </>
            )}

            <Box sx={{ px: 1.4, py: 1 }}>
              {loggedIn ? (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleLogout}
                  startIcon={<LogoutRoundedIcon />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 900,
                    textTransform: "none",
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Stack gap={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={Link}
                    to="/login"
                    onClick={() => setMobileMenuAnchor(null)}
                    startIcon={<LoginRoundedIcon />}
                    sx={{ borderRadius: 2, fontWeight: 900, textTransform: "none" }}
                  >
                    Login
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    component={Link}
                    to="/register"
                    onClick={() => setMobileMenuAnchor(null)}
                    startIcon={<PersonAddAltRoundedIcon />}
                    sx={{ borderRadius: 2, fontWeight: 900, textTransform: "none", boxShadow: "none" }}
                  >
                    Register
                  </Button>
                </Stack>
              )}
            </Box>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
