package com.ranjith.ecommerce.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ranjith.ecommerce.entity.CartItem;
import com.ranjith.ecommerce.service.CartItemService;

@RestController
@RequestMapping("/cart")
public class CartItemController {

    @Autowired
    CartItemService cartItemService;

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(@RequestParam Long productId,@RequestParam int quantity){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("AUTH = " + auth);
        System.out.println("AUTHORITIES = " + auth.getAuthorities());
        return ResponseEntity.ok(cartItemService.addToCart(productId, quantity));
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping
    public ResponseEntity<List<CartItem>> getMyCart(){
        return ResponseEntity.ok(cartItemService.getMyCart());
    }

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/update")
    public ResponseEntity<CartItem> updateCartItem(@RequestParam Long productId,@RequestParam int quantity){
        return ResponseEntity.ok(cartItemService.updateCartItem(productId, quantity));
    }

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteCartItem(@RequestParam Long productId){
        cartItemService.deleteCartItem(productId);
        return ResponseEntity.noContent().build();
    }
}
