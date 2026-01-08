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
import com.ranjith.ecommerce.exception.ProductNotFoundException;
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
    private CartItemService cartItemService;

    @Autowired
    OrderStatusValidator orderStatusValidator;

    @Transactional
    public OrderDetailDTO placeOrder(User user){
        
        List<CartItem> cartItems = cartItemService.getCartItemsEntity(user);

        if(cartItems.isEmpty())
            throw new InsufficientCartException("Cart is empty");

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.CREATED);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for(CartItem cartItem : cartItems){
            Product product = productRepo.findById(cartItem.getProductId())
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

            if(cartItem.getQuantity() > product.getStock())
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            orderItems.add(orderItem);
        }
        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepo.save(order);
        orderItemRepo.saveAll(orderItems);

        cartItemService.clearCart(user);

        return mapToDto(savedOrder);
    }

    public Page<UserOrderSummaryDTO> getOrdersByUser(
        Long userId,
        OrderStatus status,
        BigDecimal mintotalAmount,
        BigDecimal maxTotalAmount,
        Pageable pageable
    ){
        return orderRepo.findOrdersByUser(
            userId,status,mintotalAmount,maxTotalAmount,pageable)
                .map(this::mapToSummaryDto);
    }

    public OrderDetailDTO getOrderById(Long orderId,User user){

        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        if(!order.getUser().getId().equals(user.getId()))
            throw new UnauthorizedUserException("You are not authorized to view this order");

        return mapToDto(order);
    }

    public Page<AdminOrderSummaryDTO> getAllOrders(
        Long userId,
        OrderStatus status,
        BigDecimal mintotalAmount,
        BigDecimal maxTotalAmount,
        Boolean refundRequested,
        Pageable pageable
    ) {
        return orderRepo.findAllOrders(userId, status, mintotalAmount, maxTotalAmount, refundRequested, pageable)
            .map(this::mapToAdminSummaryDto);
    }

    @Transactional
    public UserOrderSummaryDTO cancelOrder(Long orderId,User user){

        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if(!order.getUser().getId().equals(user.getId()))
            throw new CannotCancelOrderException("You cannot cancel this order");

        orderStatusValidator.validateStatusTransition(order.getStatus(), OrderStatus.CANCELLED);

        if(order.getStatus() == OrderStatus.PAID){
            for(OrderItem orderItem : order.getOrderItems()){
                Product product = orderItem.getProduct();
                product.setStock(product.getStock() + orderItem.getQuantity());
                productRepo.save(product);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepo.save(order);

        return mapToSummaryDto(savedOrder);
    }

    @Transactional
    public UserOrderSummaryDTO updateOrderStatus(Long orderId,OrderStatus newStatus){

        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        orderStatusValidator.validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        Order savedOrder = orderRepo.save(order);

        return mapToSummaryDto(savedOrder);
    }

    @Transactional
    public UserOrderSummaryDTO refundRequest(Long orderId,User user){
        
        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        if(!order.getUser().getId().equals(user.getId()))
            throw new CannotCancelOrderException("This is not your order");

        if(order.getStatus() != OrderStatus.PAID)
            throw new IllegalStateException("Refund allowed only if you PAID this order");

        order.setRefundRequested(true);

        Order savedOrder = orderRepo.save(order);

        return mapToSummaryDto(savedOrder);
    }

    private OrderDetailDTO mapToDto(Order order){

        OrderDetailDTO dto = new OrderDetailDTO();
        dto.setOrderId(order.getId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());

        List<OrderItemResponseDTO> itemDtos = order.getOrderItems().stream().map(item -> {

            OrderItemResponseDTO itemDto = new OrderItemResponseDTO();
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductName(item.getProduct().getName());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setPriceAtPurchase(item.getPriceAtPurchase());

            BigDecimal itemTotal = item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()));
            itemDto.setItemTotal(itemTotal);

            return itemDto;
        }).toList();
        
        dto.setItems(itemDtos);
        return dto;
    }

    private UserOrderSummaryDTO mapToSummaryDto(Order order){

        int totalItems = order.getOrderItems()
            .stream()
            .mapToInt(orderItem -> orderItem.getQuantity())
            .sum();
        
        UserOrderSummaryDTO dto = new UserOrderSummaryDTO();
        dto.setOrderId(order.getId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setTotalItems(totalItems);
        dto.setCreatedAt(order.getCreatedAt());

        return dto;
    }

    private AdminOrderSummaryDTO mapToAdminSummaryDto(Order order){

        int totalItems = order.getOrderItems()
            .stream()
            .mapToInt(orderItem -> orderItem.getQuantity())
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
