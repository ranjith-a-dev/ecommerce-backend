package com.ranjith.ecommerce.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ranjith.ecommerce.dto.ProductUpdateDTO;
import com.ranjith.ecommerce.entity.Product;
import com.ranjith.ecommerce.repository.ProductRepo;

@Service
public class ProductService {

    @Autowired
    private ProductRepo repo;

    public Product createProduct(Product product) {
        return repo.save(product);
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Optional<Product> getProductById(Long productId) {
        return repo.findById(productId);
    }

    public Product updateProduct(ProductUpdateDTO dto,Long id) {
        
        Product product = repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        
        if(dto.getName() != null)
            product.setName(dto.getName());
        if(dto.getPrice() != null)
            product.setPrice(dto.getPrice());
        if(dto.getStock() != null)
            product.setStock(dto.getStock());
        if(dto.getDescription() != null)
            product.setDescription(dto.getDescription());

        return repo.save(product);
    }

    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }
}
