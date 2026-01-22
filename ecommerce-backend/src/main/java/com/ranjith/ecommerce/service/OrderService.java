package com.ranjith.ecommerce.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ranjith.ecommerce.dto.AdminOrderSummaryDTO;
import com.ranjith.ecommerce.dto.OrderDetailDTO;
import com.ranjith.ecommerce.dto.OrderItemResponseDTO;
import com.ranjith.ecommerce.dto.UserOrderSummaryDTO;
import com.ranjith.ecommerce.entity.Cart;
import com.ranjith.ecommerce.entity.CartItem;
import com.ranjith.ecommerce.entity.Order;
import com.ranjith.ecommerce.entity.OrderItem;
import com.ranjith.ecommerce.entity.Product;
import com.ranjith.ecommerce.entity.User;
import com.ranjith.ecommerce.enums.OrderStatus;
import com.ranjith.ecommerce.exception.CannotCancelOrderException;
import com.ranjith.ecommerce.exception.InsufficientCartException;
import com.ranjith.ecommerce.exception.InsufficientStockException;
import com.ranjith.ecommerce.exception.OrderNotFoundException;
import com.ranjith.ecommerce.exception.UnauthorizedUserException;
import com.ranjith.ecommerce.repository.OrderItemRepo;
import com.ranjith.ecommerce.repository.OrderRepo;
import com.ranjith.ecommerce.repository.ProductRepo;
import com.ranjith.ecommerce.validation.OrderStatusValidator;

@Service
public class OrderService {

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private OrderItemRepo orderItemRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CartService cartService;

    @Autowired
    private CartItemService cartItemService;

    @Autowired
    private OrderStatusValidator orderStatusValidator;

    @Transactional
    public OrderDetailDTO placeOrder(User user,String shippingAddress) {

        Cart cart = cartService.getOrCreateCartForCurrentUser();
        List<CartItem> cartItems = cartItemService.getCartItems(cart);

        if (cartItems.isEmpty()) {
            throw new InsufficientCartException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(shippingAddress);
        order.setStatus(OrderStatus.CREATED);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();

            if (cartItem.getQuantity() > product.getStock()) {
                throw new InsufficientStockException(
                        "Insufficient stock for product: " + product.getName());
            }

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepo.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());

            BigDecimal itemTotal =
                    product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepo.save(order);
        orderItemRepo.saveAll(orderItems);

        cartItemService.clearCart(cart);

        return mapToDetailDto(savedOrder);
    }

    public Page<UserOrderSummaryDTO> getOrdersByUser(
            Long userId,
            OrderStatus status,
            BigDecimal minTotalAmount,
            BigDecimal maxTotalAmount,
            Pageable pageable) {

        return orderRepo.findOrdersByUser(
                userId, status, minTotalAmount, maxTotalAmount, pageable)
                .map(this::mapToUserSummaryDto);
    }

    public OrderDetailDTO getOrderById(Long orderId, User user) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedUserException("You are not authorized to view this order");
        }

        return mapToDetailDto(order);
    }

    public Page<AdminOrderSummaryDTO> getAllOrders(
            Long userId,
            OrderStatus status,
            BigDecimal minTotalAmount,
            BigDecimal maxTotalAmount,
            Boolean refundRequested,
            Pageable pageable) {

        return orderRepo.findAllOrders(
                userId, status, minTotalAmount, maxTotalAmount, refundRequested, pageable)
                .map(this::mapToAdminSummaryDto);
    }

    @Transactional
    public UserOrderSummaryDTO cancelOrder(Long orderId, User user) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new CannotCancelOrderException("You cannot cancel this order");
        }

        orderStatusValidator.validateStatusTransition(order.getStatus(), OrderStatus.CANCELLED);

        if (order.getStatus() == OrderStatus.PAID) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepo.save(product);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        return mapToUserSummaryDto(orderRepo.save(order));
    }

    @Transactional
    public UserOrderSummaryDTO updateOrderStatus(Long orderId, OrderStatus newStatus) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        orderStatusValidator.validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        return mapToUserSummaryDto(orderRepo.save(order));
    }

    @Transactional
    public UserOrderSummaryDTO refundRequest(Long orderId, User user) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new CannotCancelOrderException("This is not your order");
        }

        if (order.getStatus() != OrderStatus.PAID) {
            throw new IllegalStateException("Refund allowed only for PAID orders");
        }

        order.setRefundRequested(true);
        return mapToUserSummaryDto(orderRepo.save(order));
    }

    private OrderDetailDTO mapToDetailDto(Order order) {

        OrderDetailDTO dto = new OrderDetailDTO();
        dto.setOrderId(order.getId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());

        List<OrderItemResponseDTO> items = order.getOrderItems().stream().map(item -> {

            OrderItemResponseDTO itemDto = new OrderItemResponseDTO();
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductName(item.getProduct().getName());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setPriceAtPurchase(item.getPriceAtPurchase());

            BigDecimal itemTotal = item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()));
            itemDto.setItemTotal(itemTotal);

            return itemDto;

        }).toList(); 

        dto.setItems(items);
        return dto;
    }

    private UserOrderSummaryDTO mapToUserSummaryDto(Order order) {

        int totalItems = order.getOrderItems()
            .stream()
            .mapToInt(OrderItem::getQuantity)
            .sum();

        UserOrderSummaryDTO dto = new UserOrderSummaryDTO();
        dto.setOrderId(order.getId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setTotalItems(totalItems);
        dto.setCreatedAt(order.getCreatedAt());

        return dto;
    }

    private AdminOrderSummaryDTO mapToAdminSummaryDto(Order order) {

        int totalItems = order.getOrderItems()
            .stream()
            .mapToInt(OrderItem::getQuantity)
            .sum();

        AdminOrderSummaryDTO dto = new AdminOrderSummaryDTO();
        dto.setOrderId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setTotalItems(totalItems);
        dto.setRefundRequested(order.isRefundRequested());
        dto.setCreatedAt(order.getCreatedAt());

        return dto;
    }
}
