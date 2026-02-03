import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Pagination,
  Select,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { adminOrderService } from "../api/services";
import { isAdmin } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const STATUS_LABELS = {
  CREATED: "Created",
  PAYMENT_PENDING: "Payment Pending",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUND_INITIATED: "Refund Initiated",
  REFUNDED: "Refunded",
};

const STATUS_COLORS = {
  CREATED: { text: "#616161" },
  PAYMENT_PENDING: { text: "#e65100" },
  PAID: { text: "#1565c0" },
  SHIPPED: { text: "#006064" },
  DELIVERED: { text: "#1b5e20" },
  CANCELLED: { text: "#b71c1c" },
  REFUND_INITIATED: { text: "#e65100" },
  REFUNDED: { text: "#1b5e20" },
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  return `₹ ${Number(value).toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
};

const StatusChip = ({ status }) => {
  const palette = STATUS_COLORS[status] || STATUS_COLORS.CREATED;
  const label = STATUS_LABELS[status] || status || "—";

  return (
    <Chip
      label={label}
      variant="outlined"
      sx={{
        height: 28,
        borderRadius: 999,
        fontWeight: 900,
        fontSize: "0.78rem",
        letterSpacing: 0.2,
        color: palette.text,
        borderColor: "rgba(0,0,0,0.15)",
        bgcolor: "rgba(0,0,0,0.02)",
      }}
    />
  );
};

const RefundChip = ({ refundRequested }) => {
  if (!refundRequested) {
    return (
      <Chip
        label="No"
        variant="outlined"
        sx={{
          height: 28,
          borderRadius: 999,
          fontWeight: 900,
          fontSize: "0.78rem",
          bgcolor: "rgba(76,175,80,0.10)",
          borderColor: "rgba(76,175,80,0.35)",
          color: "#1b5e20",
        }}
      />
    );
  }

  return (
    <Chip
      label="Yes"
      variant="outlined"
      sx={{
        height: 28,
        borderRadius: 999,
        fontWeight: 900,
        fontSize: "0.78rem",
        bgcolor: "rgba(255,111,0,0.10)",
        borderColor: "rgba(255,111,0,0.35)",
        color: "#e65100",
      }}
    />
  );
};

const AdminOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

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
      if (statusFilter) filters.status = statusFilter;

      const res = await adminOrderService.getAllOrders(page - 1, 10, filters);

      setOrders(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load orders");
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((o) => {
      const orderId = String(o.orderId ?? "").toLowerCase();
      const userId = String(o.userId ?? "").toLowerCase();
      const username = String(o.userBasicDTO?.username ?? "").toLowerCase();

      return orderId.includes(q) || userId.includes(q) || username.includes(q);
    });
  }, [orders, search]);

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
    <Box sx={{ bgcolor: "rgba(0,0,0,0.015)", minHeight: "calc(100vh - 64px)" }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.2, md: 3 },
            mb: 3,
            borderRadius: 4,
            bgcolor: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  letterSpacing: -0.3,
                  color: "#111827",
                }}
              >
                Orders
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mt: 0.5,
                  fontWeight: 700,
                }}
              >
                Manage and track customer orders
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              gap={1.6}
              alignItems="flex-end"
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              <Box sx={{ width: { xs: "100%", sm: 360 } }}>
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    fontWeight: 900,
                    color: "text.secondary",
                    mb: 0.6,
                  }}
                >
                  Search
                </Typography>

                <TextField
                  size="small"
                  placeholder="Order ID / User ID / Username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ width: { xs: "100%", sm: 220 } }}>
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    fontWeight: 900,
                    color: "text.secondary",
                    mb: 0.6,
                  }}
                >
                  Filter by Status
                </Typography>

                <FormControl size="small" fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                      setSearch("");
                    }}
                    label="Status"
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
              </Box>
            </Stack>
          </Stack>

          <Divider sx={{ mt: 2.5 }} />
        </Paper>
        
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid rgba(0,0,0,0.08)",
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
            bgcolor: "rgba(255,255,255,0.92)",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(0,0,0,0.03)" }}>
                  <TableCell sx={{ fontWeight: 900 }}>Order</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Refund Request</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ fontWeight: 900, mb: 0.5 }}>
                        No orders found
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontWeight: 700 }}
                      >
                        Try different Order ID / User ID / Username
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow
                      key={order.orderId}
                      hover
                      sx={{
                        "& td": { py: 1.6 },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 900 }}>
                        #{order.orderId}
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 900, color: "#111827" }}>
                          {order.userBasicDTO?.username || "—"}
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            color: "text.secondary",
                            mt: 0.2,
                          }}
                        >
                          ID: {order.userId ?? "—"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ fontWeight: 900 }}>
                        {formatCurrency(order.totalAmount)}
                      </TableCell>

                      <TableCell>
                        <StatusChip status={order.status} />
                      </TableCell>

                      <TableCell>
                        <RefundChip refundRequested={order.refundRequested} />
                      </TableCell>

                      <TableCell
                        sx={{
                          color: "text.secondary",
                          fontWeight: 700,
                        }}
                      >
                        {formatDate(order.createdAt)}
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() =>
                              navigate(`/admin/orders/${order.orderId}`)
                            }
                            sx={{
                              borderRadius: 2,
                              border: "1px solid rgba(0,0,0,0.12)",
                              bgcolor: "rgba(0,0,0,0.02)",
                            }}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminOrders;
