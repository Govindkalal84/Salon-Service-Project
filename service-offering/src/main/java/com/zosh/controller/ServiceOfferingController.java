package com.zosh.controller;


import com.zosh.model.ServiceOffering;
import com.zosh.service.ServiceOfferingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;

@CrossOrigin(origins = {"https://salon-service-project.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:5170"})
@RestController
@RequestMapping("/api/service-offering")
@RequiredArgsConstructor
public class ServiceOfferingController {
    private final ServiceOfferingService serviceOfferingService;

    @GetMapping("/salon/{salonId}")
    public ResponseEntity<Set<ServiceOffering>> getServicesBySalonId(
            @PathVariable Long salonId,
            @RequestParam(required = false) Long categoryId
    ) {
        Set<ServiceOffering> serviceOfferings = serviceOfferingService
                .getAllServicesBySalonId(salonId, categoryId);
        return ResponseEntity.ok(serviceOfferings);


    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceOffering> getServicesBySId(
            @PathVariable Long id
    ) throws Exception {
        ServiceOffering serviceOfferings = serviceOfferingService
                .getServiceById(id);
        return ResponseEntity.ok(serviceOfferings);


    }
    @GetMapping("/list/{ids}")
    public ResponseEntity<Set<ServiceOffering>> getServicesByIds(
            @PathVariable Set<Long> ids
    ) {
        Set<ServiceOffering> serviceOfferings = serviceOfferingService
                .getServicesByIds(ids);
        return ResponseEntity.ok(serviceOfferings);


    }




}
