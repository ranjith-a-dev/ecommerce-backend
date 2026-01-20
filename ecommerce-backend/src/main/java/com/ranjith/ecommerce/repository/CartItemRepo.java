package com.ranjith.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ranjith.ecommerce.entity.Cart;
import com.ranjith.ecommerce.entity.CartItem;
import com.ranjith.ecommerce.entity.Product;

import java.util.List;
import java.util.Optional;


@Repository
public interface CartItemRepo extends JpaRepository<CartItem,Long> {

    Optional<CartItem> findByCartAndProduct(Cart cart,Product product);

    List<CartItem> findByCart(Cart cart);

    void deleteByCart(Cart cart);
}
