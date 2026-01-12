package com.ranjith.ecommerce.service;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ranjith.ecommerce.dto.ProductRequestDTO;
import com.ranjith.ecommerce.dto.ProductResponseDTO;
import com.ranjith.ecommerce.dto.ProductUpdateDTO;
import com.ranjith.ecommerce.entity.Product;
import com.ranjith.ecommerce.entity.Category;
import com.ranjith.ecommerce.exception.CategoryNotFoundException;
import com.ranjith.ecommerce.exception.ProductNotFoundException;
import com.ranjith.ecommerce.repository.CategoryRepo;
import com.ranjith.ecommerce.repository.ProductRepo;

@Service
public class ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    protected CategoryRepo categoryRepo;

    private ProductResponseDTO toResponseDTO(Product product){

        return new ProductResponseDTO(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getStock(),
            product.getImageUrl()
        );
    }

    public ProductResponseDTO createProduct(ProductRequestDTO dto) {

        Category category = categoryRepo.findById(dto.getCategoryId())
            .orElseThrow(() -> new CategoryNotFoundException("Category not found"));
        
        Product product = new Product();

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setImageUrl(dto.getImageUrl());
        product.setCategory(category);

        return toResponseDTO(productRepo.save(product));
    }

    public Page<ProductResponseDTO> getAllProducts(
        Pageable pageable,
        Long categoryId,
        String name,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Boolean inStock
    ) {
        return productRepo.findWithFilters(
            categoryId,
            name,
            minPrice,
            maxPrice,
            inStock,
            pageable
        ).map(this::toResponseDTO);
    }

    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepo.findById(id).orElseThrow(() -> new ProductNotFoundException("Product not found with id " + id));
        return toResponseDTO(product);
    }

    public ProductResponseDTO updateProduct(ProductUpdateDTO dto,Long id) {
        
        Product product = productRepo.findById(id).orElseThrow(() -> new ProductNotFoundException("Product not found with id " + id));
        
        if(dto.getName() != null)
            product.setName(dto.getName());
        if(dto.getPrice() != null)
            product.setPrice(dto.getPrice());
        if(dto.getStock() != null)
            product.setStock(dto.getStock());
        if(dto.getDescription() != null)
            product.setDescription(dto.getDescription());

        return toResponseDTO(productRepo.save(product));
    }

    public void deleteProduct(Long id) {
        Product product = productRepo.findById(id).orElseThrow(() -> new ProductNotFoundException("Product not found with id " + id));
        productRepo.delete(product);
    }
}
