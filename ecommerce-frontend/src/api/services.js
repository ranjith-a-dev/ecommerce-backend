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

  createProduct: (productData) =>
    api.post("/products", productData),

  updateProduct: (id, productData) =>
    api.patch(`/products/${id}`, productData),

  deleteProduct: (id) =>
    api.delete(`/products/${id}`),
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
  checkout: (data) =>
    api.post("/orders/checkout", data),
  
  getMyOrders: (filters = {}) =>
    api.get("/orders", { params: filters }),
  
  getOrderById: (orderId) =>
    api.get(`/orders/${orderId}`),
  
  cancelOrder: (orderId) =>
    api.post(`/orders/${orderId}/user-cancel`),
  
  requestRefund: (orderId) =>
    api.post(`/orders/${orderId}/refund-request`),
};

// ============= PAYMENT SERVICES =============
export const paymentService = {
  getPayments: (filters = {}) =>
    api.get("/payments", { params: filters }),
  
  getPaymentByOrderId: (orderId) =>
    api.get(`/payments/order/${orderId}`),
  
  initiatePayment: (orderId) =>
    api.post("/payments/initiate", null, {
      params: { orderId },
    }),
  
  markPaymentSuccess: (paymentRef) =>
    api.post("/payments/success", null, {
      params: { paymentRef },
    }),
  
  markPaymentFailure: (paymentRef) =>
    api.post("/payments/failure", null, {
      params: { paymentRef },
    }),
};

// ============= ADMIN ORDER SERVICES =============
export const adminOrderService = {
  getAllOrders: (page = 0, size = 10, filters = {}) =>
    api.get("/admin/orders", {
      params: { page, size, ...filters },
    }),

  getAdminOrderById: (orderId) =>
    api.get(`/admin/orders/${orderId}`),

  updateOrderStatus: (orderId, status) =>
    api.put(`/admin/orders/${orderId}/status`, null, {
      params: { status },
    }),
};

// ============= ADMIN PAYMENT SERVICES =============
export const adminPaymentService = {
  getAllPayments: (page = 0, size = 10, filters = {}) =>
    api.get("/admin/payments", {
      params: { page, size, ...filters },
    }),

  approveRefund: (paymentId) =>
    api.put(`/admin/payments/${paymentId}/refund-approve`),

  rejectRefund: (paymentId) =>
    api.put(`/admin/payments/${paymentId}/refund-reject`),
};

// ============= CATEGORY SERVICES =============
export const categoryService = {
  getAllCategories: () =>
    api.get("/categories"),
};
