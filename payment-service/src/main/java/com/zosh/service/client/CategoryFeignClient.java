package com.zosh.service.client;

import com.zosh.payload.response.dto.CategoryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Set;

@FeignClient(name = "CATEGORY-SERVICE", url = "${CATEGORY_SERVICE_URL:https://salon-service-project-wpp6.onrender.com}")
public interface CategoryFeignClient {

    @GetMapping("/api/categories/salon/{id}")
    public ResponseEntity<Set<CategoryDTO>> getCategoriesBySalon(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String jwt
    );
}
