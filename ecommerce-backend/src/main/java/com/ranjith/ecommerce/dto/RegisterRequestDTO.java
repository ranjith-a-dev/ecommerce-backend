package com.ranjith.ecommerce.dto;

import com.ranjith.ecommerce.enums.Role;

import lombok.Data;

@Data
public class RegisterRequestDTO {

    private String username;
    private String password;
    private Role role;
}
