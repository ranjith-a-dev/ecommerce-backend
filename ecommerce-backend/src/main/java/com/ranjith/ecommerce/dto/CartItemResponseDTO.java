package com.ranjith.ecommerce.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemResponseDTO {

    private Long productId;
    private String imageUrl;
    private String productName;

    private int stock;
    private int quantity;
    private BigDecimal price;
}
