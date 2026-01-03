package com.ranjith.ecommerce.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ranjith.ecommerce.dto.ProductResponseDTO;
import com.ranjith.ecommerce.dto.ProductUpdateDTO;
import com.ranjith.ecommerce.entity.Product;
import com.ranjith.ecommerce.exception.ProductNotFoundException;
import com.ranjith.ecommerce.repository.ProductRepo;

@Service
public class ProductService {

    @Autowired
    private ProductRepo repo;

     private ProductResponseDTO toResponseDTO(Product product){
        return new ProductResponseDTO(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getStock()
        );
    }

    public ProductResponseDTO createProduct(Product product) {
        return toResponseDTO(repo.save(product));
    }

    public Page<ProductResponseDTO> getAllProducts(Pageable pageable) {
        return repo.findAll(pageable).map(this::toResponseDTO);
    }

    public ProductResponseDTO getProductById(Long id) {
        Product product = repo.findById(id).orElseThrow(() -> new ProductNotFoundException("Product not found with id " + id));
        return toResponseDTO(product);
    }

    public List<ProductResponseDTO> searchProducts(String name){
        return repo.findByNameContainingIgnoreCase(name).stream().map(this::toResponseDTO).toList();
    }

    public ProductResponseDTO updateProduct(ProductUpdateDTO dto,Long id) {
        
        Product product = repo.findById(id).orElseThrow(() -> new ProductNotFoundException("Product not found with id " + id));
        
        if(dto.getName() != null)
            product.setName(dto.getName());
        if(dto.getPrice() != null)
            product.setPrice(dto.getPrice());
        if(dto.getStock() != null)
            product.setStock(dto.getStock());
        if(dto.getDescription() != null)
            product.setDescription(dto.getDescription());

        return toResponseDTO(repo.save(product));
    }

    public void deleteProduct(Long id) {
        Product product = repo.findById(id).orElseThrow(() -> new ProductNotFoundException("Product not found with id " + id));
        repo.delete(product);
    }
}
