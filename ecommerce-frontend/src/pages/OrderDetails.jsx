import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  Chip,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      console.error("Failed to load order");
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchOrder();
  }, []);

  if (!order) {
    return <Typography sx={{ mt: 4 }}>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Order Details
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography fontWeight={600}>
              Order ID: {order.orderId}
            </Typography>
            <Chip label={order.status} color="primary" />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography fontWeight={600}>Items</Typography>

          {order.items.map((item) => (
            <Box
              key={item.productId}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <Typography>
                {item.productName} × {item.quantity}
              </Typography>
              <Typography>₹ {item.itemTotal}</Typography>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6">
            Total Amount: ₹ {order.totalAmount}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrderDetails;
