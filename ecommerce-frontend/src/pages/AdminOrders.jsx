import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Pagination,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import { adminOrderService } from "../api/services";
import { isAdmin } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      alert("You are not authorized to access this page");
      navigate("/");
      return;
    }

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter) {
        filters.status = statusFilter;
      }
      const res = await adminOrderService.getAllOrders(page - 1, 10, filters);
      setOrders(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      alert("Failed to load orders");
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (order) => {
    try {
      setDetailsError(null);
      // Fetch full order details
      const res = await adminOrderService.getAdminOrderById(order.orderId);
      setSelectedOrder(res.data);
      setOpenDetails(true);
    } catch (error) {
      console.error("Failed to load order details:", error);
      setDetailsError(error.response?.data?.message || "Failed to load order details");
      setSelectedOrder(order); // Show what we have from table at least
      setOpenDetails(true);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await adminOrderService.updateOrderStatus(orderId, newStatus);
      setSelectedOrder((prev) => ({
        ...prev,
        status: newStatus,
      }));
      alert("Order status updated successfully");
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      CREATED: "#9e9e9e",
      PAYMENT_PENDING: "#ff9800",
      PAID: "#2196f3",
      SHIPPED: "#00bcd4",
      DELIVERED: "#4caf50",
      CANCELLED: "#f44336",
      REFUND_INITIATED: "#ff6f00",
      REFUNDED: "#388e3c",
    };
    return colors[status] || "#666";
  };

  if (loading && orders.length === 0) {
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 700, mb: 4, color: "#1a1a1a" }}
      >
        Orders Management
      </Typography>

      {/* FILTERS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              label="Filter by Status"
              sx={{ backgroundColor: "white" }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="CREATED">Created</MenuItem>
              <MenuItem value="PAYMENT_PENDING">Payment Pending</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="SHIPPED">Shipped</MenuItem>
              <MenuItem value="DELIVERED">Delivered</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
              <MenuItem value="REFUND_INITIATED">Refund Initiated</MenuItem>
              <MenuItem value="REFUNDED">Refunded</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* ORDERS TABLE */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>User ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Amount</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Refund Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Order Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow 
                  key={order.orderId} 
                  sx={{ 
                    "&:hover": { bgcolor: "#f9f9f9" },
                    backgroundColor: order.refundRequested ? "#fff3e0" : "inherit",
                  }}
                >
                  <TableCell>#{order.orderId}</TableCell>
                  <TableCell>{order.userId}</TableCell>
                  <TableCell>₹ {order.totalAmount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: getStatusColor(order.status),
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      {order.status}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.refundRequested ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          sx={{
                            backgroundColor: "#ff6f00",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          🔴 Refund Requested
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ color: "#999", fontSize: "0.9rem" }}>—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* ORDER DETAILS DIALOG */}
      <Dialog
        open={openDetails}
        onClose={() => {
          setOpenDetails(false);
          setSelectedOrder(null);
          setDetailsError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Order Details - #{selectedOrder?.orderId}</DialogTitle>
        <DialogContent>
          {detailsError && (
            <Box
              sx={{
                p: 2,
                backgroundColor: "#ffebee",
                borderRadius: 1,
                mb: 2,
                color: "#c62828",
              }}
            >
              <Typography variant="body2">{detailsError}</Typography>
            </Box>
          )}
          {selectedOrder && (
            <Box sx={{ py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  <strong>Order ID:</strong>
                </Typography>
                <Typography variant="body1">#{selectedOrder.orderId}</Typography>
              </Box>


              {/* Make all fields read-only if status is REFUNDED or CANCELLED */}
              {(["REFUNDED", "CANCELLED"].includes(selectedOrder.status)) ? (
                <Box sx={{ opacity: 0.6, pointerEvents: "none" }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      <strong>User ID:</strong>
                    </Typography>
                    <Typography variant="body1">{selectedOrder.userId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Total Amount:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1976d2", fontWeight: 600 }}>
                      ₹ {selectedOrder.totalAmount?.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Current Status:</strong>
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: getStatusColor(selectedOrder.status),
                        fontWeight: 600,
                      }}
                    >
                      {selectedOrder.status}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Shipping Address:</strong>
                    </Typography>
                    <Typography variant="body1">{selectedOrder.shippingAddress}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Order Date:</strong>
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.createdAt
                        ? new Date(selectedOrder.createdAt).toLocaleString()
                        : "N/A"}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      <strong>User ID:</strong>
                    </Typography>
                    <Typography variant="body1">{selectedOrder.userId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Total Amount:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#1976d2", fontWeight: 600 }}>
                      ₹ {selectedOrder.totalAmount?.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Current Status:</strong>
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: getStatusColor(selectedOrder.status),
                        fontWeight: 600,
                      }}
                    >
                      {selectedOrder.status}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Shipping Address:</strong>
                    </Typography>
                    <Typography variant="body1">{selectedOrder.shippingAddress}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Order Date:</strong>
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.createdAt
                        ? new Date(selectedOrder.createdAt).toLocaleString()
                        : "N/A"}
                    </Typography>
                  </Box>
                </>
              )}

              <Box
                sx={{
                  p: 2,
                  backgroundColor: selectedOrder.refundRequested ? "#fff3e0" : "#f5f5f5",
                  borderRadius: 1,
                  borderLeft: `4px solid ${selectedOrder.refundRequested ? "#ff6f00" : "#4caf50"}`,
                }}
              >
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  <strong>Refund Status:</strong>
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: selectedOrder.refundRequested ? "#ff6f00" : "#4caf50",
                      fontWeight: 600,
                    }}
                  >
                    {selectedOrder.refundRequested ? "🔴 Refund Requested" : "✓ No Refund Request"}
                  </Typography>
                  {selectedOrder.refundRequested && (
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      Awaiting admin action
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* STATUS UPDATE SECTION */}
              <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #eee" }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Update Order Status:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {["SHIPPED", "DELIVERED", "CANCELLED", "REFUND_INITIATED", "REFUNDED"].map((status) => {
                    // Only allow REFUND_INITIATED if refundRequested is true
                    const illegalRefund = status === "REFUND_INITIATED" && !selectedOrder.refundRequested;
                    return (
                      <Button
                        key={status}
                        variant={selectedOrder.status === status ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleUpdateStatus(selectedOrder.orderId, status)}
                        disabled={
                          ["REFUNDED", "CANCELLED"].includes(selectedOrder.status) || updatingStatus || illegalRefund
                        }
                        sx={{
                          backgroundColor:
                            selectedOrder.status === status
                              ? getStatusColor(status)
                              : "transparent",
                          color:
                            selectedOrder.status === status ? "white" : getStatusColor(status),
                          borderColor: getStatusColor(status),
                          "&:hover": {
                            backgroundColor:
                              selectedOrder.status === status
                                ? getStatusColor(status)
                                : "transparent",
                          },
                        }}
                      >
                        {status}
                      </Button>
                    );
                  })}
                </Box>
                {/* Refund suggestion box */}
                {selectedOrder && selectedOrder.refundRequested && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                      borderLeft: `4px solid #1976d2`,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#1976d2", fontWeight: 600 }}>
                      💡 Suggested Action: User has requested refund for this delivered order.
                      <br />
                      To process refund: Change status to <strong>REFUND_INITIATED</strong> (then to <strong>REFUNDED</strong> after processing payment)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDetails(false);
              setSelectedOrder(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrders;
