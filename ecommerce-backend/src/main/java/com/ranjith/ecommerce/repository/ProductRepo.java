package com.ranjith.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ranjith.ecommerce.entity.Product;

public interface ProductRepo extends JpaRepository<Product,Long> {

}
