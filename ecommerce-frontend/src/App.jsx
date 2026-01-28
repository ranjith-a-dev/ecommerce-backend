import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";

import Navbar from "./components/Navbar";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import AdminOrders from "./pages/AdminOrders";
import AdminProductEdit from "./pages/AdminProductEdit";

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
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          
          {/* ADMIN ROUTES */}
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/products/create" element={<AdminProductEdit />} />
          <Route path="/admin/products/:productId/edit" element={<AdminProductEdit />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
