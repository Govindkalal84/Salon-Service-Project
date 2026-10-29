package com.zosh.service.client;


import com.zosh.domain.PaymentMethod;
import com.zosh.dto.BookingDTO;
import com.zosh.dto.PaymentLinkResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "PAYMENT-SERVICE", url = "${PAYMENT_SERVICE_URL:https://salon-service-project-yd58.onrender.com}")
public interface PaymentFeignClient {

    @PostMapping("/api/payments/create")
    public ResponseEntity<PaymentLinkResponse> createPaymentLink(
            @RequestBody BookingDTO booking,
            @RequestParam PaymentMethod paymentMethod,
            @RequestHeader("Authorization") String jwt

    );
}
