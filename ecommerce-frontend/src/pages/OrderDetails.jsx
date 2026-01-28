import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  Chip,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { orderService } from "../api/services";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderById(orderId);
        setOrder(res.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        console.error("Failed to load order");
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) {
    return <Typography sx={{ mt: 4 }}>Loading...</Typography>;
  }

  const handleRetryPayment = () => {
    navigate("/payment", {
      state: {
        cartItems: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        orderId: order.orderId,
      },
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Order Details
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

          {/* RETRY PAYMENT BUTTON - Show only if order is in PAYMENT_PENDING state */}
          {order.status === "PAYMENT_PENDING" && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRetryPayment}
              >
                Retry Payment
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrderDetails;
