package com.zosh.service.client;

import com.zosh.payload.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "USER-SERVICE", url = "${USER_SERVICE_URL:https://salon-service-project-spmu.onrender.com}")
public interface UserFeignClient {

    @GetMapping("/api/users/{userId}")
    public ResponseEntity<UserDTO>
    getUserById(@PathVariable("userId") Long id)
            throws Exception;

    @GetMapping("/api/users/profile")
    public ResponseEntity<UserDTO>
    getUserProfile(@RequestHeader("Authorization")String jwt)
            throws Exception;

}
