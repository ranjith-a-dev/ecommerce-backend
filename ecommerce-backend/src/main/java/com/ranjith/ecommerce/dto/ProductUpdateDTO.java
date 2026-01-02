package com.ranjith.ecommerce.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ProductUpdateDTO {
    private String name;
    private String description;

    @Positive(message = "Price must be greater than 0")
    private BigDecimal price;

    @Min(value = 0,message = "Stock cannot be negative")
    private Integer stock;
}
