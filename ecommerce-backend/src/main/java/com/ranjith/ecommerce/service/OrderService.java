package com.ranjith.ecommerce.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ranjith.ecommerce.dto.AdminOrderItemDTO;
import com.ranjith.ecommerce.dto.AdminOrderSummaryDTO;
import com.ranjith.ecommerce.dto.OrderDetailDTO;
import com.ranjith.ecommerce.dto.OrderItemResponseDTO;
import com.ranjith.ecommerce.dto.OrderRequestDTO;
import com.ranjith.ecommerce.dto.ShippingAddressDTO;
import com.ranjith.ecommerce.dto.UserBasicDTO;
import com.ranjith.ecommerce.dto.UserOrderSummaryDTO;
import com.ranjith.ecommerce.entity.Cart;
import com.ranjith.ecommerce.entity.CartItem;
import com.ranjith.ecommerce.entity.Order;
import com.ranjith.ecommerce.entity.OrderItem;
import com.ranjith.ecommerce.entity.Product;
import com.ranjith.ecommerce.entity.ShippingAddress;
import com.ranjith.ecommerce.entity.User;
import com.ranjith.ecommerce.enums.OrderStatus;
import com.ranjith.ecommerce.exception.CannotCancelOrderException;
import com.ranjith.ecommerce.exception.InsufficientCartException;
import com.ranjith.ecommerce.exception.InsufficientStockException;
import com.ranjith.ecommerce.exception.OrderNotFoundException;
import com.ranjith.ecommerce.exception.ProductNotFoundException;
import com.ranjith.ecommerce.exception.UnauthorizedUserException;
import com.ranjith.ecommerce.repository.OrderItemRepo;
import com.ranjith.ecommerce.repository.OrderRepo;
import com.ranjith.ecommerce.repository.ProductRepo;
import com.ranjith.ecommerce.repository.ShippingAddressRepo;
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

    @Autowired
    private ShippingAddressRepo shippingAddressRepo;

    @Transactional
    public OrderDetailDTO placeOrder(User user, OrderRequestDTO orderRequest) {

        Cart cart = cartService.getOrCreateCartForCurrentUser();
        List<CartItem> cartItems = cartItemService.getCartItems(cart);

        if (cartItems.isEmpty()) {
            throw new InsufficientCartException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.CREATED);
        order.setRefundRequested(false);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();

            if (!product.isActive())    
                throw new ProductNotFoundException("Product is no longer available: " + product.getName());
            
            if (cartItem.getQuantity() > product.getStock()) 
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName());

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

        ShippingAddress shippingAddress = new ShippingAddress();
        ShippingAddressDTO addressDTO = orderRequest.getShippingAddress();

        shippingAddress.setOrder(order);
        shippingAddress.setFullName(addressDTO.getFullName());
        shippingAddress.setPhoneNumber(addressDTO.getPhoneNumber());
        shippingAddress.setStreetAddress(addressDTO.getStreetAddress());
        shippingAddress.setCity(addressDTO.getCity());
        shippingAddress.setState(addressDTO.getState());
        shippingAddress.setPostalCode(addressDTO.getPostalCode());
        shippingAddress.setCountry(addressDTO.getCountry());
        shippingAddress.setDeliveryInstructions(addressDTO.getDeliveryInstructions());

        List<ShippingAddress> addresses = new ArrayList<>();
        addresses.add(shippingAddress);
        order.setShippingAddresses(addresses);

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

        return orderRepo.findOrdersByUser(userId, status, minTotalAmount, maxTotalAmount, pageable)
                .map(this::mapToUserSummaryDto);
    }

    public OrderDetailDTO getOrderById(Long orderId, User user) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId()))
            throw new UnauthorizedUserException("You are not authorized to view this order");

        return mapToDetailDto(order);
    }

    @Transactional
    public UserOrderSummaryDTO cancelOrder(Long orderId, User user) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new CannotCancelOrderException("You cannot cancel this order");
        }

        if (order.getStatus() == OrderStatus.SHIPPED ||
            order.getStatus() == OrderStatus.DELIVERED ||
            order.getStatus() == OrderStatus.CANCELLED ||
            order.getStatus() == OrderStatus.REFUND_INITIATED ||
            order.getStatus() == OrderStatus.REFUNDED) {
            throw new CannotCancelOrderException("Order cannot be cancelled in current status: " + order.getStatus());
        }

        if (order.getStatus() == OrderStatus.PAID) {

            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepo.save(product);
            }

            orderStatusValidator.validateStatusTransition(OrderStatus.PAID, OrderStatus.REFUND_INITIATED);
            order.setStatus(OrderStatus.REFUND_INITIATED);

            return mapToUserSummaryDto(orderRepo.save(order));
        }

        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepo.save(product);
        }
        orderStatusValidator.validateStatusTransition(order.getStatus(), OrderStatus.CANCELLED);
        order.setStatus(OrderStatus.CANCELLED);
        return mapToUserSummaryDto(orderRepo.save(order));
    }

    @Transactional
    public UserOrderSummaryDTO refundRequest(Long orderId, User user) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId()))
            throw new CannotCancelOrderException("This is not your order");

        if (order.getStatus() != OrderStatus.DELIVERED)
            throw new CannotCancelOrderException("Refund allowed only for DELIVERED orders");

        order.setRefundRequested(true);
        order.setStatus(OrderStatus.REFUND_INITIATED);

        return mapToUserSummaryDto(orderRepo.save(order));
    }

    public Page<AdminOrderSummaryDTO> getAllOrders(
            Long userId,
            OrderStatus status,
            BigDecimal minTotalAmount,
            BigDecimal maxTotalAmount,
            Boolean refundRequested,
            Pageable pageable) {

        return orderRepo.findAllOrders(userId, status, minTotalAmount, maxTotalAmount, refundRequested, pageable)
                .map(this::mapToAdminSummaryDto);
    }

    public AdminOrderSummaryDTO getAdminOrderById(Long orderId) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        return mapToAdminSummaryDto(order);
    }

    @Transactional
    public void cancelOrderByAdmin(Long orderId) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (order.getStatus() == OrderStatus.DELIVERED ||
            order.getStatus() == OrderStatus.CANCELLED ||
            order.getStatus() == OrderStatus.REFUND_INITIATED ||
            order.getStatus() == OrderStatus.REFUNDED) {

            throw new CannotCancelOrderException("Admin cannot cancel order in status: " + order.getStatus());
        }

        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepo.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepo.save(order);
    }

    @Transactional
    public UserOrderSummaryDTO updateOrderStatus(Long orderId, OrderStatus newStatus) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        orderStatusValidator.validateStatusTransition(order.getStatus(), newStatus);

        if (newStatus == OrderStatus.REFUNDED && order.getStatus() == OrderStatus.REFUND_INITIATED) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepo.save(product);
            }
        }

        order.setStatus(newStatus);
        return mapToUserSummaryDto(orderRepo.save(order));
    }

    /* ====================== DTO MAPPING ====================== */

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
            itemDto.setImageUrl((item.getProduct().getImageUrls() != null && !item.getProduct().getImageUrls().isEmpty())
                    ? item.getProduct().getImageUrls().get(0)
                    : null);

            BigDecimal itemTotal = item.getPriceAtPurchase()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

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

        dto.setItems(order.getOrderItems().stream()
        .map(i -> new AdminOrderItemDTO(
            i.getProduct().getId(),
            i.getProduct().getName(),
            i.getQuantity(),
            i.getPriceAtPurchase(),
            (i.getProduct().getImageUrls() != null && !i.getProduct().getImageUrls().isEmpty())
                ? i.getProduct().getImageUrls().get(0)
                : null
        ))
        .toList()
        );


        dto.setOrderId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setTotalItems(totalItems);
        dto.setRefundRequested(order.isRefundRequested());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUserBasicDTO(new UserBasicDTO(order.getUser().getUsername()));

        List<ShippingAddress> addresses = shippingAddressRepo.findByOrderId(order.getId());

        if (addresses != null && !addresses.isEmpty()) {
            ShippingAddress s = addresses.get(0);

            ShippingAddressDTO shippingDTO = new ShippingAddressDTO(
                    s.getFullName(),
                    s.getPhoneNumber(),
                    s.getStreetAddress(),
                    s.getCity(),
                    s.getState(),
                    s.getPostalCode(),
                    s.getCountry(),
                    s.getDeliveryInstructions()
            );

            dto.setShippingAddressDTO(shippingDTO);
        } else {
            dto.setShippingAddressDTO(null);
        }

        return dto;
    }
}
