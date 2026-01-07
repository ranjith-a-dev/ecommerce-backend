package com.ranjith.ecommerce.controller;

import java.util.List;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ranjith.ecommerce.dto.ApiResponseDTO;
import com.ranjith.ecommerce.dto.ProductResponseDTO;
import com.ranjith.ecommerce.dto.ProductUpdateDTO;
import com.ranjith.ecommerce.entity.Product;
import com.ranjith.ecommerce.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService service;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@Valid @RequestBody Product product){
        return new ResponseEntity<>(service.createProduct(product),HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> getAllProducts(@ParameterObject Pageable pageable){
        return ResponseEntity.ok(service.getAllProducts(pageable));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id){
        return ResponseEntity.ok(service.getProductById(id));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/search/name")
    public ResponseEntity<List<ProductResponseDTO>> searchProducts(@RequestParam String name){
        return ResponseEntity.ok(service.searchProducts(name));
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(@Valid @RequestBody ProductUpdateDTO dto,@PathVariable Long id){
        return ResponseEntity.ok(service.updateProduct(dto,id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> deleteProduct(@PathVariable Long id){
        service.deleteProduct(id);
        return ResponseEntity.ok(new ApiResponseDTO("Product deleted successfully"));
    }
}
