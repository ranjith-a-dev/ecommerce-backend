package com.ranjith.ecommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ranjith.ecommerce.enums.OrderStatus;

import lombok.Data;

@Data
public class UserOrderSummaryDTO {

    private Long orderId;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private int totalItems;
    private LocalDateTime createdAt;
}
