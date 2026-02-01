package com.ranjith.ecommerce.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminOrderItemDTO {
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal priceAtPurchase;
    private String imageUrl;
}
