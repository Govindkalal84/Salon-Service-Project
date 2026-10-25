package com.zosh.controller;

import com.zosh.dto.SalonDTO;
import com.zosh.model.Category;
import com.zosh.service.CategoryService;
import com.zosh.service.client.SalonFeignClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;



@CrossOrigin(origins = {"https://salon-service-project.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:5170"})
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories/salon-owner")
public class SalonCategoryController {

    private final CategoryService categoryService;
    private final SalonFeignClient salonFeignClient;


    @PostMapping()
    public ResponseEntity<Category> createCategory(
            @RequestBody Category category,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        SalonDTO salonDTO = null;
        try {
            salonDTO = salonFeignClient.getSalonByOwnerId(jwt).getBody();
        } catch (Exception e) {
            System.err.println("Feign failed to get salon: " + e.getMessage());
        }

        if (salonDTO == null || salonDTO.getId() == null) {
            throw new Exception("Salon profile not found for this owner. Please register your salon first.");
        }

        Category saveCategory = categoryService.saveCategory(category, salonDTO);
        return ResponseEntity.ok(saveCategory);
    }

    @GetMapping("/salon/{salonId}/category/{id}")
    public ResponseEntity<Category> getCategoriesByIdAndSalon(
            @PathVariable Long id,
            @PathVariable Long salonId

    ) throws Exception {
        Category category = categoryService.findByIdAndSalonId(id, salonId);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        SalonDTO salonDTO = null;
        try {
            salonDTO = salonFeignClient.getSalonByOwnerId(jwt).getBody();
        } catch (Exception e) {
            System.err.println("Feign failed to get salon: " + e.getMessage());
        }

        if (salonDTO == null || salonDTO.getId() == null) {
            throw new Exception("Salon profile not found for this owner.");
        }

        categoryService.deleteCategoryById(id, salonDTO.getId());
        return ResponseEntity.ok("category deleted successfully");
    }
}
