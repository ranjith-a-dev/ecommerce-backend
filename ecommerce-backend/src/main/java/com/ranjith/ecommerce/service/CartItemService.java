package com.ranjith.ecommerce.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ranjith.ecommerce.dto.CartItemResponseDTO;
import com.ranjith.ecommerce.entity.CartItem;
import com.ranjith.ecommerce.entity.Product;
import com.ranjith.ecommerce.entity.User;
import com.ranjith.ecommerce.exception.CartItemNotFoundException;
import com.ranjith.ecommerce.exception.InsufficientStockException;
import com.ranjith.ecommerce.exception.ProductNotFoundException;
import com.ranjith.ecommerce.exception.UserNotFoundException;
import com.ranjith.ecommerce.repository.CartItemRepo;
import com.ranjith.ecommerce.repository.ProductRepo;
import com.ranjith.ecommerce.repository.UserRepo;

@Service
public class CartItemService {

    @Autowired
    private CartItemRepo cartItemRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ProductRepo productRepo;

    private Long getCurrentUserId(){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepo.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        return user.getId();
    }

    @Transactional
    public CartItemResponseDTO addToCart(Long productId,int quantity){
        Long userId = getCurrentUserId();

        Product product = productRepo.findById(productId).orElseThrow(() -> new ProductNotFoundException("Product not found"));

        CartItem item = cartItemRepo.findByUserIdAndProductId(userId, productId).orElse(null);
        
        int existingQuantity = item != null ? item.getQuantity() : 0;
        int totalRequested = existingQuantity + quantity;

        if(totalRequested > product.getStock())
            throw new InsufficientStockException("Only " + product.getStock() + " is available in stock");

        if(item == null){
            CartItem newItem = new CartItem();
            newItem.setUserId(userId);
            newItem.setProductId(product.getId());
            newItem.setQuantity(quantity);
            return mapToDto(cartItemRepo.save(newItem));
        }

        item.setQuantity(totalRequested);
        return mapToDto(cartItemRepo.save(item));
    }

    public List<CartItemResponseDTO> getMyCart(){
        Long userId = getCurrentUserId();
        return cartItemRepo.findByUserId(userId).stream().map(this::mapToDto).toList();
    }

    @Transactional
    public CartItemResponseDTO updateCartItem(Long productId,int quantity){
        Long userId = getCurrentUserId();

        CartItem item = cartItemRepo.findByUserIdAndProductId(userId, productId)
            .orElseThrow(() -> new CartItemNotFoundException("Cart item not found"));

        Product product = productRepo.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found"));
        
        if(quantity > product.getStock())
            throw new InsufficientStockException("Only " + product.getStock() + " is available in stock");

        item.setQuantity(quantity);
        return mapToDto(cartItemRepo.save(item));
    }

    @Transactional
    public void deleteCartItem(Long productId){
        Long userId = getCurrentUserId();
        CartItem item = cartItemRepo.findByUserIdAndProductId(userId, productId)
            .orElseThrow(() -> new CartItemNotFoundException("Cart item not found"));
        cartItemRepo.delete(item);
    }

    @Transactional
    public void clearCart(User user){
        cartItemRepo.deleteByUserId(user.getId());
    }

    private CartItemResponseDTO mapToDto(CartItem cartItem){
        return new CartItemResponseDTO(
            cartItem.getProductId(),
            cartItem.getQuantity()
        );
    }

    public List<CartItem> getCartItemsEntity(User user) {
        return cartItemRepo.findByUserId(user.getId());
    }
}
