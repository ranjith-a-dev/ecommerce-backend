package com.ranjith.ecommerce.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ranjith.ecommerce.entity.Category;
import com.ranjith.ecommerce.repository.CategoryRepo;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    CategoryRepo categoryRepo;

    @GetMapping
    public List<Category> getAllCategories(){
        return categoryRepo.findAll();
    }
}
