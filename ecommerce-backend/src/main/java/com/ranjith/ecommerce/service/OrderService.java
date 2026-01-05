package com.ranjith.ecommerce.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ranjith.ecommerce.dto.OrderDetailDTO;
import com.ranjith.ecommerce.dto.OrderItemResponseDTO;
import com.ranjith.ecommerce.dto.OrderSummaryDTO;
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

    @Transactional
    public OrderDetailDTO placeOrder(User user){
        
        List<CartItem> cartItems = cartItemService.getUserCart(user);

        if(cartItems.isEmpty())
            throw new InsufficientCartException("Cart is empty");

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PLACED);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for(CartItem cartItem : cartItems){
            Product product = productRepo.findById(cartItem.getProductId())
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

            if(cartItem.getQuantity() > product.getStock())
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName());

            product.setStock(product.getStock()-cartItem.getQuantity());
            productRepo.save(product);

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

    public List<OrderSummaryDTO> getOrdersByUser(Long userId){
        return orderRepo.findByUserId(userId).stream().map(this::mapToSummaryDto).toList();
    }

    public OrderDetailDTO getOrderById(Long orderId,User user){

        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        if(!order.getUser().getId().equals(user.getId()))
            throw new UnauthorizedUserException("You are not authorized to view this order");

        return mapToDto(order);
    }

    @Transactional
    public OrderSummaryDTO cancelOrder(Long orderId,User user){

        Order order = getOrderEntity(orderId, user);

        if(order.getStatus() != OrderStatus.PLACED)
            throw new CannotCancelOrderException("Order cannot be cancelled");

        for(OrderItem orderItem : order.getOrderItems()){
            Product product = orderItem.getProduct();
            product.setStock(product.getStock() + orderItem.getQuantity());
            productRepo.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
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

    private OrderSummaryDTO mapToSummaryDto(Order order){

        OrderSummaryDTO dto = new OrderSummaryDTO();
        dto.setOrderId(order.getId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());

        return dto;
    }
    private Order getOrderEntity(Long orderId,User user){

        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if(!order.getUser().getId().equals(user.getId()))
                throw new UnauthorizedUserException("Unauthorized access");

        return order;
    }
}
