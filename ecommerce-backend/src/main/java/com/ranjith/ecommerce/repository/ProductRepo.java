package com.ranjith.ecommerce.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ranjith.ecommerce.entity.Product;

public interface ProductRepo extends JpaRepository<Product,Long> {

    List<Product> findByNameContainingIgnoreCase(String name);
}   
