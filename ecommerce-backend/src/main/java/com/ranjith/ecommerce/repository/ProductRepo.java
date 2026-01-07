package com.ranjith.ecommerce.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ranjith.ecommerce.entity.Product;

@Repository
public interface ProductRepo extends JpaRepository<Product,Long> {

    @Query("""
        SELECT p from Product p
        WHERE (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%',:name,'%')))
            AND (:minPrice IS NULL OR p.price >= :minPrice)
            AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            AND (
                :inStock IS NULL
                OR (:inStock = true AND p.stock > 0)
                OR (:inStock = false AND p.stock = 0)
            )
    """)
    Page<Product> findWithFilters(
        @Param("name") String name,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("inStock") Boolean inStock,
        Pageable pageable
    );
}   
