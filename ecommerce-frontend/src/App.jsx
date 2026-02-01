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
import AdminOrderDetails from "./pages/AdminOrderDetails";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toolbar />

      <Box sx={{ minHeight: "calc(100vh - 64px)", background: "#fff" }}>
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          <Route path="/carts" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />

          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />

          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/products/create" element={<AdminProductEdit />} />
          <Route path="/admin/products/edit/:productId" element={<AdminProductEdit />} />
          <Route path="/admin/orders/:orderId" element={<AdminOrderDetails />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
