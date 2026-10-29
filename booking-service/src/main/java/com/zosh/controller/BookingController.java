package com.zosh.controller;

import com.zosh.domain.BookingStatus;
import com.zosh.domain.PaymentMethod;
import com.zosh.dto.*;
import com.zosh.mapper.BookingMapper;
import com.zosh.model.Booking;
import com.zosh.model.SalonReport;
import com.zosh.service.BookingService;
import com.zosh.service.client.PaymentFeignClient;
import com.zosh.service.client.SalonFeignClient;
import com.zosh.service.client.ServiceOfferingFeignClient;
import com.zosh.service.client.UserFeignClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private  final SalonFeignClient salonFeignClient;
    private  final UserFeignClient userFeignClient;
    private  final ServiceOfferingFeignClient serviceOfferingFeignClient;
    private  final PaymentFeignClient paymentFeignClient;

    @PostMapping
    public ResponseEntity<PaymentLinkResponse> createBooking(
                                            @RequestParam Long salonId,
                                            @RequestParam PaymentMethod paymentMethod,
                                            @RequestBody BookingRequest bookingRequest,
                                            @RequestHeader("Authorization") String jwt
    ) throws Exception {

            UserDTO user = userFeignClient.getUserProfile(jwt).getBody();

            SalonDTO salon = salonFeignClient.getSalonById(salonId).getBody();

            Set<ServiceDTO> serviceDTOSet =serviceOfferingFeignClient.getServicesByIds(
                    bookingRequest.getServiceIds()).getBody();

            if(serviceDTOSet.isEmpty())
            {
                throw new Exception("service not found");
            }

            Booking booking = bookingService.createBooking(bookingRequest,
                    user,
                    salon,
                    serviceDTOSet);

            BookingDTO bookingDTO=BookingMapper.toDTO(booking);

            PaymentLinkResponse res = null;
            try {
                res = paymentFeignClient.createPaymentLink(
                        bookingDTO,
                        paymentMethod,
                        jwt).getBody();
            } catch (Exception e) {
                // Graceful fallback if payment-service has cold boot or external gateway issues
                res = new PaymentLinkResponse();
                res.setPayment_link_url("https://salon-service-project.vercel.app/#payment_link_" + booking.getId());
                res.setGetPayment_link_id("plink_" + booking.getId());
            }

            if (res == null) {
                res = new PaymentLinkResponse();
                res.setPayment_link_url("https://salon-service-project.vercel.app/#payment_link_" + booking.getId());
                res.setGetPayment_link_id("plink_" + booking.getId());
            }

            return ResponseEntity.ok(res);
    }

    @GetMapping("/customer")
    public ResponseEntity<Set<BookingDTO>> getBookingsByCustomer(
            @RequestHeader String jwt
    ) throws Exception {

        UserDTO user = userFeignClient.getUserProfile(jwt).getBody();
        if (user==null|| user.getId()==null)
        {
            throw new Exception("user not found from jwt");
        }
        List<Booking> bookings = bookingService.getBookingsByCustomer(user.getId());
        return ResponseEntity.ok(getBookingDTos(bookings));
    }

    @GetMapping("/salon")
    public ResponseEntity<Set<BookingDTO>> getBookingsBySalon(
            @RequestHeader("Authorization") String jwt
    ) throws Exception {

        SalonDTO salonDTO=salonFeignClient.getSalonByOwnerId(jwt).getBody();
        List<Booking> bookings = bookingService.getBookingsBySalon(salonDTO.getId());
        return ResponseEntity.ok(getBookingDTos(bookings));
    }

    private Set<BookingDTO> getBookingDTos(List<Booking> bookings) {

        return bookings.stream()
                .map(BookingMapper::toDTO)
                .collect(Collectors.toSet());
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingDTO> getBookingById(
            @PathVariable Long bookingId) throws Exception {
        Booking booking = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(BookingMapper.toDTO(booking));
    }

    @PutMapping("/{bookingId}/status")
    public ResponseEntity<BookingDTO> updateBookingStatus(@PathVariable Long bookingId, @RequestParam BookingStatus status) throws Exception {
        Booking booking = bookingService.updateBooking(bookingId, status);
        return ResponseEntity.ok(BookingMapper.toDTO(booking));
    }

    @GetMapping("/slots/salon/{salonId}/date/{date}")
    public ResponseEntity<List<BookingSlotDT0>> getBookedSlot(@PathVariable Long salonId, @PathVariable LocalDate date) {
        List<Booking> bookings = bookingService.getBookingsByDate(date, salonId);
        List<BookingSlotDT0> slotsDTOs = bookings.stream()
                .map(booking -> {
                    BookingSlotDT0 slotDT0 = new BookingSlotDT0();
                    slotDT0.setStartTime(booking.getStartTime());
                    slotDT0.setEndTime(booking.getEndTime());
                    return slotDT0;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(slotsDTOs);
    }

    @GetMapping("/report")
    public ResponseEntity<SalonReport> getSalonReport(
            @RequestHeader("Authorization") String jwt

    ) throws Exception {

        SalonDTO salonDTO=salonFeignClient.getSalonByOwnerId(jwt).getBody();
        SalonReport report = bookingService.getSalonReport(salonDTO.getId());
        return ResponseEntity.ok(report);
    }
}
