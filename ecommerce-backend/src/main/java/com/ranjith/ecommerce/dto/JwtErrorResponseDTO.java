package com.ranjith.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtErrorResponseDTO {

    private String error;
    private String message;
}
