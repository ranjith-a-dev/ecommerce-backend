package com.ranjith.ecommerce.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ranjith.ecommerce.entity.Cart;
import com.ranjith.ecommerce.entity.User;
import com.ranjith.ecommerce.exception.UserNotFoundException;
import com.ranjith.ecommerce.repository.Cartrepo;
import com.ranjith.ecommerce.repository.UserRepo;

@Service
public class CartService {

    @Autowired
    private Cartrepo cartrepo;

    @Autowired
    private UserRepo userRepo;

    public Cart getOrCreateCartForCurrentUser() {

        String username = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

        User user = userRepo.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        return cartrepo.findByUser(user)
            .orElseGet(() -> cartrepo.save(new Cart(null, user)));
    }
}

