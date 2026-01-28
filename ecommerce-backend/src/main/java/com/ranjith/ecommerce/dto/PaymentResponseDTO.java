package com.ranjith.ecommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ranjith.ecommerce.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponseDTO {

    private String paymentReference;
    private PaymentStatus status;
    private BigDecimal amount;
    private Long orderId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
