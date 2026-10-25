package com.zosh.service.client;


import com.zosh.dto.SalonDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(value = "SALON-SERVICE", url = "${SALON_SERVICE_URL:https://salon-service-project-z307.onrender.com}")
public interface SalonFeignClient {

    @GetMapping("/api/salons/owner")
    public ResponseEntity<SalonDTO> getSalonByOwnerId(


            @RequestHeader("Authorization")String jwt

    ) throws Exception;
}
