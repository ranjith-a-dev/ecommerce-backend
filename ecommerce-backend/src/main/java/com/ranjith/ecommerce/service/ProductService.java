package com.ranjith.ecommerce.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public Product updateProduct(Product product,Long id) {
        
        Product currentProduct = repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        currentProduct.setName(product.getName());
        currentProduct.setPrice(product.getPrice());
        currentProduct.setStock(product.getStock());
        currentProduct.setDescription(product.getDescription());
        
        return repo.save(currentProduct);
    }

    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }
}
