package com.ranjith.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiErrorDTO {

    private int status;
    private String message;
}
