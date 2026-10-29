package com.zosh.service.client;

import com.zosh.payload.response.dto.ServiceDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Set;

@FeignClient(name = "SERVICE-OFFERING", url = "${SERVICE_OFFERING_URL:https://salon-service-project-wv4y.onrender.com}")
public interface ServiceOfferingFeignClient {

    @GetMapping("/api/service-offering/list")
    public ResponseEntity<Set<ServiceDTO>> getServicesByIds(
            @RequestParam Set<Long> ids);
}
