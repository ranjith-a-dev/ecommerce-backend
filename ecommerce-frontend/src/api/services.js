import api from "./axios";

// ============= AUTH SERVICES =============
export const authService = {
  register: (username, password) =>
    api.post("/auth/register", { username, password }),
  
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
};

// ============= PRODUCT SERVICES =============
export const productService = {
  getAllProducts: (page = 0, size = 10, filters = {}) =>
    api.get("/products", {
      params: { page, size, ...filters },
    }),
  
  getProductById: (id) =>
    api.get(`/products/${id}`),
};

// ============= CART SERVICES =============
export const cartService = {
  getCart: () =>
    api.get("/cart"),
  
  addToCart: (productId, quantity) =>
    api.post("/cart", null, {
      params: { productId, quantity },
    }),
  
  updateCartItem: (productId, quantity) =>
    api.put(`/cart/${productId}`, null, {
      params: { quantity },
    }),
  
  removeFromCart: (productId) =>
    api.delete(`/cart/${productId}`),
};

// ============= ORDER SERVICES =============
export const orderService = {
  checkout: (shippingAddress) =>
    api.post("../../orders/checkout", {
      shippingAddress,
    }),
  
  getMyOrders: (filters = {}) =>
    api.get("../../orders", { params: filters }),
  
  getOrderById: (orderId) =>
    api.get(`../../orders/${orderId}`),
  
  cancelOrder: (orderId) =>
    api.post(`../../orders/${orderId}/cancel`),
  
  requestRefund: (orderId) =>
    api.post(`../../orders/${orderId}/refund-request`),
};

// ============= PAYMENT SERVICES =============
export const paymentService = {
  getPayments: (filters = {}) =>
    api.get("../../payments", { params: filters }),
  
  initiatePayment: (orderId) =>
    api.post("../../payments/initiate", null, {
      params: { orderId },
    }),
  
  markPaymentSuccess: (paymentRef) =>
    api.post("../../payments/success", null, {
      params: { paymentRef },
    }),
  
  markPaymentFailure: (paymentRef) =>
    api.post("../../payments/failure", null, {
      params: { paymentRef },
    }),
};

// ============= CATEGORY SERVICES =============
export const categoryService = {
  getAllCategories: () =>
    api.get("/categories"),
};
