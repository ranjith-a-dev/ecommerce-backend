package com.ranjith.ecommerce.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ranjith.ecommerce.dto.LoginRequestDTO;
import com.ranjith.ecommerce.dto.LoginResponseDTO;
import com.ranjith.ecommerce.dto.RegisterRequestDTO;
import com.ranjith.ecommerce.dto.RegisterResponseDTO;
import com.ranjith.ecommerce.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto){
        service.register(dto);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(new RegisterResponseDTO("User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto){
        String token = service.login(dto);
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }
}
