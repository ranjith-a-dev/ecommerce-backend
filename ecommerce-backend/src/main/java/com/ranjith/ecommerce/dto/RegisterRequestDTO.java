package com.ranjith.ecommerce.dto;

import org.hibernate.validator.constraints.Length;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequestDTO {

    @NotBlank(message = "Username cannot be blank")
    @Length(min = 4, max = 20, message = "Username must be 4-20 characters")
    private String username;

    @NotBlank(message = "Password cannot be empty")
    @Length(min = 6, message = "Password must be atleast 6 characters")
    private String password;
}
