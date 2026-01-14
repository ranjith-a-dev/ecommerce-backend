import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";

import Navbar from "./components/Navbar";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toolbar />
      <Box sx={{ backgroundColor: "#ffffff" }}>
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/products" element={<Products />} />
          <Route path="/carts" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
