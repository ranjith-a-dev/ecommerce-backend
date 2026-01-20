package com.ranjith.ecommerce.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ranjith.ecommerce.entity.Cart;
import com.ranjith.ecommerce.entity.User;

@Repository
public interface Cartrepo extends JpaRepository<Cart,Long> {

    Optional<Cart> findByUser(User user);
}
