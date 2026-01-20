package com.ranjith.ecommerce.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ranjith.ecommerce.dto.CartItemResponseDTO;
import com.ranjith.ecommerce.entity.Cart;
import com.ranjith.ecommerce.entity.CartItem;
import com.ranjith.ecommerce.entity.Product;
import com.ranjith.ecommerce.exception.CartItemNotFoundException;
import com.ranjith.ecommerce.exception.InsufficientStockException;
import com.ranjith.ecommerce.exception.ProductNotFoundException;
import com.ranjith.ecommerce.repository.CartItemRepo;
import com.ranjith.ecommerce.repository.ProductRepo;

@Service
public class CartItemService {

    @Autowired
    private CartItemRepo cartItemRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CartService cartService;

    @Transactional
    public CartItemResponseDTO addToCart(Long productId,int quantity){
        
        Cart cart = cartService.getOrCreateCartForCurrentUser();

        Product product = productRepo.findById(productId).orElseThrow(() -> new ProductNotFoundException("Product not found"));

        CartItem cartItem = cartItemRepo.findByCartAndProduct(cart, product)
            .orElse(null);
        
        int existingQty = cartItem != null ? cartItem.getQuantity() : 0;
        int totalQty = existingQty + quantity;

        if(totalQty > product.getStock())
            throw new InsufficientStockException("Only " + product.getStock() + " is available in stock");

        if(cartItem == null)
            cartItem = new CartItem(null, cart, product, quantity);
        else
            cartItem.setQuantity(totalQty);

        return mapToDto(cartItemRepo.save(cartItem));
    }

    public List<CartItemResponseDTO> getMyCart(){
        
        Cart cart = cartService.getOrCreateCartForCurrentUser();

        return cartItemRepo.findByCart(cart)
            .stream()
            .map(this::mapToDto)
            .toList();
    }

    @Transactional
    public CartItemResponseDTO updateCartItem(Long productId,int quantity){
        
        Cart cart = cartService.getOrCreateCartForCurrentUser();

        Product product = productRepo.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        CartItem cartItem = cartItemRepo.findByCartAndProduct(cart, product)
            .orElseThrow(() -> new CartItemNotFoundException("Cart item not found"));
        
        if(quantity > product.getStock())
            throw new InsufficientStockException("Only " + product.getStock() + " is available in stock");

        cartItem.setQuantity(quantity);
        return mapToDto(cartItemRepo.save(cartItem));
    }

    @Transactional
    public void deleteCartItem(Long productId){
        
        Cart cart = cartService.getOrCreateCartForCurrentUser();

        Product product = productRepo.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        CartItem cartItem = cartItemRepo.findByCartAndProduct(cart, product)
            .orElseThrow(() -> new CartItemNotFoundException("Cart item not found"));

        cartItemRepo.delete(cartItem);
    }

    @Transactional
    public void clearCart(Cart cart){

        cartItemRepo.deleteByCart(cart);
    }

    private CartItemResponseDTO mapToDto(CartItem cartItem){
        
        Product product = cartItem.getProduct();

        return new CartItemResponseDTO(
            product.getId(),
            product.getImageUrls().get(0),
            product.getName(),
            product.getStock(),
            cartItem.getQuantity(),
            product.getPrice()
        );
    }

    public List<CartItem> getCartItems(Cart cart) {

        return cartItemRepo.findByCart(cart);
    }
}
