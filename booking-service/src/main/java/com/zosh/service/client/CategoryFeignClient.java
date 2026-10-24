package com.zosh.service.client;


import com.zosh.dto.CategoryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "CATEGORY-SERVICE", url = "${CATEGORY_SERVICE_URL:https://salon-service-project-wpp6.onrender.com}")
public interface CategoryFeignClient {
//
//    @GetMapping("/api/categories/{id}")
//    public ResponseEntity<CategoryDTO> getCategoriesById(
//            @PathVariable Long id
//    ) throws Exception;

    @GetMapping("/api/categories/salon-owner/salon/{salonId}/category/{id}")
    public ResponseEntity<CategoryDTO> getCategoriesByIdAndSalon(
            @PathVariable Long id,
            @PathVariable Long salonId

    ) throws Exception;

}
