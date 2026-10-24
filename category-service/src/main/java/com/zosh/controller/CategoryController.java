package com.zosh.controller;

import com.zosh.model.Category;
import com.zosh.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = {"https://salon-service-project.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:5170"})
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;


    @GetMapping("/salon/{id}")
    public ResponseEntity<Set<Category>> getCategoriesBySalon(
            @PathVariable Long id
    ){
        Set<Category> categories=categoryService.getAllCategoriesBySalon(id);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoriesById(
            @PathVariable Long id
    ) throws Exception {
        Category category=categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }



}
