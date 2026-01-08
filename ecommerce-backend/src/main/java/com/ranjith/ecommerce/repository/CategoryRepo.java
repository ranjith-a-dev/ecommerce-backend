package com.ranjith.ecommerce.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ranjith.ecommerce.entity.Category;

@Repository
public interface CategoryRepo extends JpaRepository<Category,Long> {

    Optional<Category> findByName(String name);
}
