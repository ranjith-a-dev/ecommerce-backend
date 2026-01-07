package com.ranjith.ecommerce.dto;

import com.ranjith.ecommerce.enums.Role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDTO {

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 4, max = 20, message = "Username must be 4-20 characters")
    private String username;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 6, message = "Password must be atleast 6 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;
}
