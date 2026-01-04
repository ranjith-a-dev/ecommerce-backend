package com.ranjith.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ranjith.ecommerce.entity.CartItem;
import java.util.List;
import java.util.Optional;


@Repository
public interface CartItemRepo extends JpaRepository<CartItem,Long> {

    List<CartItem> findByUserId(Long userId);

    Optional<CartItem> findByUserIdAndProductId(Long userId,Long productId);

    void deleteByUserIdAndProductId(Long userId,Long productId);
}
