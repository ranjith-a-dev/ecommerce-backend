package com.ranjith.ecommerce.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ranjith.ecommerce.entity.Product;
import com.ranjith.ecommerce.service.ProductService;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService service;

    @PostMapping
    public Product createProduct(@RequestBody Product product){
        return service.createProduct(product);
    }

    @GetMapping
    public List<Product> getAllProducts(){
        return service.getAllProducts();
    }

    @GetMapping("{id}")
    public Optional<Product> getProductById(@PathVariable Long id){
        return service.getProductById(id);
    }

    @PutMapping("{id}")
    public Product updateProduct(@RequestBody Product product,@PathVariable Long id){
        return service.updateProduct(product,id);
    }

    @DeleteMapping("{id}")
    public void deleteProduct(@PathVariable Long id){
        service.deleteProduct(id);
    }
}
