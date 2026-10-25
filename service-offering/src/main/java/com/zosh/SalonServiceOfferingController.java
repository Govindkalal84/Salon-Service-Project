package com.zosh;

import com.zosh.dto.CategoryDTO;
import com.zosh.dto.SalonDTO;
import com.zosh.dto.ServiceDTO;
import com.zosh.model.ServiceOffering;
import com.zosh.service.ServiceOfferingService;
import com.zosh.service.client.CategoryFeignClient;
import com.zosh.service.client.SalonFeignClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@CrossOrigin(origins = {"https://salon-service-project.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:5170"})
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/service-offering/salon-owner")
public class SalonServiceOfferingController {

    private final ServiceOfferingService serviceOfferingService;
    private final SalonFeignClient salonFeignClient;
    private  final CategoryFeignClient categoryFeignClient;

    @PostMapping
    public ResponseEntity<ServiceOffering> createService(
            @RequestBody ServiceDTO serviceDTO,
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

        CategoryDTO categoryDTO = null;
        try {
            categoryDTO = categoryFeignClient
                    .getCategoriesByIdAndSalon(serviceDTO.getCategory(), salonDTO.getId()).getBody();
        } catch (Exception e) {
            System.err.println("Feign failed to get category: " + e.getMessage());
        }

        if (categoryDTO == null || categoryDTO.getId() == null) {
            throw new Exception("Selected category not found for this salon.");
        }

        ServiceOffering serviceOfferings = serviceOfferingService
                .createService(salonDTO, serviceDTO, categoryDTO);
        return ResponseEntity.ok(serviceOfferings);
    }
    @PostMapping("/{id}")
    public ResponseEntity<ServiceOffering> updateService(
           @PathVariable Long id,
           @RequestBody ServiceOffering serviceOffering
    ) throws Exception {

        ServiceOffering serviceOfferings = serviceOfferingService
                .updateService(id,serviceOffering);
        return ResponseEntity.ok(serviceOfferings);


    }
}
