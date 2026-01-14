package com.ranjith.ecommerce.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ranjith.ecommerce.dto.ApiResponseDTO;
import com.ranjith.ecommerce.dto.CartItemResponseDTO;
import com.ranjith.ecommerce.service.CartItemService;

@RestController
@RequestMapping("api/cart")
public class CartItemController {

    @Autowired
    CartItemService cartItemService;

    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public ResponseEntity<CartItemResponseDTO> addToCart(@RequestParam Long productId,@RequestParam int quantity){
        CartItemResponseDTO response = cartItemService.addToCart(productId, quantity);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping
    public ResponseEntity<List<CartItemResponseDTO>> getMyCart(){
        return ResponseEntity.ok(cartItemService.getMyCart());
    }

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/{productId}")
    public ResponseEntity<CartItemResponseDTO> updateCartItem(@PathVariable Long productId,@RequestParam int quantity){
        return ResponseEntity.ok(cartItemService.updateCartItem(productId, quantity));
    }

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponseDTO> deleteCartItem(@PathVariable Long productId){
        cartItemService.deleteCartItem(productId);
        return ResponseEntity.ok(new ApiResponseDTO("Cart item deleted successfully"));
    }
}
