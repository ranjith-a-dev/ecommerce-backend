package com.ranjith.ecommerce.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ranjith.ecommerce.entity.User;
import com.ranjith.ecommerce.repository.UserRepo;

@Service
public class CustomUserDetailsService implements UserDetailsService{

    @Autowired
    private UserRepo userRepo;

    public UserDetails loadUserByUsername(String username){

        User user = userRepo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found " + username));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities("USER")
                .build();
    }
}
