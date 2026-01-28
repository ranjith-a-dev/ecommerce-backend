import { AppBar, TextField, Toolbar, Typography, IconButton, Button, Box, Menu, MenuItem } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { isAdmin, logout, isLoggedIn } from "../utils/authUtils";

const Navbar = () => {

  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
  const userIsAdmin = isAdmin();
  const loggedIn = isLoggedIn();

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/products?search=${search}`);
    } else {
      navigate("/products");
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: "inherit",
            flexGrow: 1,
          }}
        >
          E-Commerce
        </Typography>
        
        {/* SEARCH BAR */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
          <TextField
            size="small"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            sx={{ bgcolor: "white", borderRadius: 1 }}
          />
          <IconButton color="inherit" onClick={handleSearch}>
            <SearchIcon />
          </IconButton>
        </Box>
        
        <Box>
          {/* USER MENU - Only show if not admin and logged in */}
          {!userIsAdmin && loggedIn && (
            <>
              <Button color="inherit" component={Link} to="/orders">
                Orders
              </Button>
              <Button color="inherit" component={Link} to="/carts">
                Cart
              </Button>
            </>
          )}

          {/* ADMIN MENU */}
          {userIsAdmin && (
            <>
              <Button
                color="inherit"
                onClick={(e) => setAdminMenuAnchor(e.currentTarget)}
                startIcon={<AdminPanelSettingsIcon />}
              >
                Admin
              </Button>
              <Menu
                anchorEl={adminMenuAnchor}
                open={Boolean(adminMenuAnchor)}
                onClose={() => setAdminMenuAnchor(null)}
              >
                <MenuItem
                  component={Link}
                  to="/admin/orders"
                  onClick={() => setAdminMenuAnchor(null)}
                >
                  Manage Orders
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/admin/products/create"
                  onClick={() => setAdminMenuAnchor(null)}
                >
                  Create Product
                </MenuItem>
              </Menu>
            </>
          )}

          {/* AUTH BUTTONS - Hide logout/login/register for admins */}
          {loggedIn ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
