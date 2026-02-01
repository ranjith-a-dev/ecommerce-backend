package com.ranjith.ecommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.ranjith.ecommerce.enums.OrderStatus;

import lombok.Data;

@Data
public class OrderDetailDTO {

    private Long orderId;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDTO> items;
    private LocalDateTime updatedAt;
    private ShippingAddressDTO shippingAddress;
}
