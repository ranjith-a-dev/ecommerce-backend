package com.ranjith.ecommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ranjith.ecommerce.enums.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminOrderSummaryDTO {

    private Long orderId;
    private Long userId;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private int totalItems;
    private boolean refundRequested;
    private LocalDateTime createdAt;
}
