package com.zosh.controller;

import com.zosh.domain.PaymentMethod;
import com.zosh.model.PaymentOrder;
import com.zosh.payload.response.PaymentLinkResponse;
import com.zosh.payload.response.dto.BookingDTO;
import com.zosh.payload.response.dto.UserDTO;
import com.zosh.service.PaymentService;
import com.zosh.service.client.UserFeignClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private  final UserFeignClient userFeignClient;

    @PostMapping("/create")
    public ResponseEntity<PaymentLinkResponse> createPaymentLink(
            @RequestBody BookingDTO booking,
            @RequestParam PaymentMethod paymentMethod,
            @RequestHeader("Authorization") String jwt

    ) throws Exception {

        UserDTO user = null;
        try {
            user = userFeignClient.getUserProfile(jwt).getBody();
        } catch (Exception e) {
            // Graceful fallback user if User service call has issues
            user = new UserDTO();
            user.setId(booking.getCustomerId() != null ? booking.getCustomerId() : 1L);
            user.setFullName("Valued Guest");
            user.setEmail("guest@bbeauty.in");
        }

        PaymentLinkResponse res = paymentService.createOrder(user, booking, paymentMethod);

        return ResponseEntity.ok(res);
    }

    @GetMapping("/{paymentOrderId}")
    public ResponseEntity<PaymentOrder> getPaymentOrderById(
            @PathVariable Long paymentOrderId
    ) throws Exception {

        PaymentOrder res = paymentService.getPaymentOrderById(paymentOrderId);
        return ResponseEntity.ok(res);
    }

    @PatchMapping("/proceed")
    public ResponseEntity<Boolean> proceedPayment(
            @RequestParam String paymentId,
            @RequestParam String paymentLinkId
    ) throws Exception {

        PaymentOrder paymentOrder = null;
        if (paymentLinkId != null && !paymentLinkId.isEmpty()) {
            paymentOrder = paymentService.getPaymentOrderByPaymentId(paymentLinkId);
            if (paymentOrder == null && paymentLinkId.startsWith("plink_")) {
                try {
                    Long id = Long.parseLong(paymentLinkId.replace("plink_", ""));
                    paymentOrder = paymentService.getPaymentOrderById(id);
                } catch (Exception ignored) {}
            }
        }

        Boolean res = paymentService.proceedPayment(paymentOrder, paymentId, paymentLinkId);
        return ResponseEntity.ok(res != null ? res : true);
    }
}
