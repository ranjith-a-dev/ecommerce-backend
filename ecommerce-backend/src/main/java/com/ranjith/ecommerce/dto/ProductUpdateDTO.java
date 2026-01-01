package com.ranjith.ecommerce.dto;

import lombok.Data;

@Data
public class ProductUpdateDTO {
    private String name;
    private String description;
    private Double price;
    private Integer stock;
}
