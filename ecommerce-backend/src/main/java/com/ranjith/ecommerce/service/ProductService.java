package com.ranjith.ecommerce.service;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private ProductResponseDTO toResponseDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());

        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);

        dto.setImageUrls(product.getImageUrls());

        return dto;
    }


    public ProductResponseDTO createProduct(ProductRequestDTO dto) {

        Category category = categoryRepo.findById(dto.getCategoryId())
            .orElseThrow(() -> new CategoryNotFoundException("Category not found"));
        
        Product product = new Product();

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setImageUrls(dto.getImageUrls());
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
        if(dto.getImageUrls() != null && !dto.getImageUrls().isEmpty())
            product.setImageUrls(dto.getImageUrls());
            

        return toResponseDTO(productRepo.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepo.findById(id)
            .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        product.setActive(false); 
        productRepo.save(product);
    }   
}
