package com.ranjith.ecommerce.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class OrderItemResponseDTO {
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal priceAtPurchase;
    private BigDecimal itemTotal;
    private String imageUrl;
}
