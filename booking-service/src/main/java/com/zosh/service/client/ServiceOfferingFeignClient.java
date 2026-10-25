package com.zosh.service.client;


import com.zosh.dto.ServiceDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Set;

@FeignClient(value = "SERVICE-OFFERING", url = "${SERVICE_OFFERING_URL:https://salon-service-project-wv4y.onrender.com}")
public interface ServiceOfferingFeignClient {


    @GetMapping("/api/service-offering/list/{ids}")
    public ResponseEntity<Set<ServiceDTO>> getServicesByIds(
            @PathVariable("ids") Set<Long> ids
    );

}
