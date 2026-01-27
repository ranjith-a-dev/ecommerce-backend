package com.ranjith.ecommerce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDTO {

    @Valid
    @NotNull(message = "Shipping address is required")
    private ShippingAddressDTO shippingAddress;
}
