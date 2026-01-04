package com.ranjith.ecommerce.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ranjith.ecommerce.entity.CartItem;
import com.ranjith.ecommerce.entity.Product;
import com.ranjith.ecommerce.entity.User;
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
            .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getId();
    }

    public CartItem addToCart(Long productId,int quantity){
        Long userId = getCurrentUserId();

        Product product = productRepo.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = cartItemRepo.findByUserIdAndProductId(userId, productId).orElse(null);
        
        if(item == null){
            CartItem newItem = new CartItem();
            newItem.setUserId(userId);
            newItem.setProductId(product.getId());
            newItem.setQuantity(quantity);
            return cartItemRepo.save(newItem);
        }

        item.setQuantity(quantity + item.getQuantity());
        return cartItemRepo.save(item);
    }

    public List<CartItem> getMyCart(){
        Long userId = getCurrentUserId();
        return cartItemRepo.findByUserId(userId);
    }

    public CartItem updateCartItem(Long prodcuctId,int quantity){
        Long userId = getCurrentUserId();

        CartItem item = cartItemRepo.findByUserIdAndProductId(userId, prodcuctId)
            .orElseThrow(() -> new RuntimeException("Cart item not found"));

        item.setQuantity(quantity);
        return cartItemRepo.save(item);
    }

    public void deleteCartItem(Long productId){
        Long userId = getCurrentUserId();
        cartItemRepo.deleteByUserIdAndProductId(userId, productId);
    }
}
