package com.ranjith.ecommerce.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ranjith.ecommerce.dto.LoginRequestDTO;
import com.ranjith.ecommerce.dto.RegisterRequestDTO;
import com.ranjith.ecommerce.entity.User;
import com.ranjith.ecommerce.exception.PasswordMismatchException;
import com.ranjith.ecommerce.exception.UserAlreadyExistsException;
import com.ranjith.ecommerce.repository.UserRepo;
import com.ranjith.ecommerce.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepo userRepo; 

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void register(RegisterRequestDTO dto) {
        
        if(userRepo.findByUsername(dto.getUsername()).isPresent()){
            throw new UserAlreadyExistsException("User already exists");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());

        userRepo.save(user);
    }

    public String login(LoginRequestDTO dto) {
        
        User user = userRepo.findByUsername(dto.getUsername()).orElseThrow(() -> new RuntimeException("Invalid Credentials"));

        if(!passwordEncoder.matches(dto.getPassword(), user.getPassword()))
            throw new PasswordMismatchException("Invalid Credentials");
        
        return jwtUtil.generateToken(dto.getUsername());
    }


}
