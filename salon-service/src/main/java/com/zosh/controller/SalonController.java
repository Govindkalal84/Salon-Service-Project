package com.zosh.controller;

import com.zosh.mapper.SalonMapper;
import com.zosh.model.Salon;
import com.zosh.payload.dto.SalonDTO;
import com.zosh.payload.dto.UserDTO;
import com.zosh.service.SalonService;
import com.zosh.service.client.UserFeignClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"https://salon-service-project.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:5170"})
@RestController
@RequestMapping("/api/salons")
@RequiredArgsConstructor
public class SalonController {

    private final SalonService salonService;
    private final UserFeignClient userFeignClient;

    @PostMapping
    public ResponseEntity<SalonDTO> createSalon(@RequestBody SalonDTO salonDTO,
                                                @RequestHeader("Authorization") String jwt) throws Exception {

        UserDTO userDTO = null;
        try {
            userDTO = userFeignClient.getUserProfile(jwt).getBody();
        } catch (Exception e) {
            System.err.println("Feign failed to get user profile: " + e.getMessage());
        }

        if (userDTO == null || userDTO.getId() == null) {
            throw new Exception("Unable to retrieve user profile. Please try logging in again.");
        }

        Salon salon = salonService.createSalon(salonDTO, userDTO);
        SalonDTO salonDTO1 = SalonMapper.mapToDTO(salon);

        return ResponseEntity.ok(salonDTO1);

    }
    @PutMapping("{salonId}")
    public ResponseEntity<SalonDTO> updateSalon(

            @PathVariable Long salonId,
            @RequestBody SalonDTO salonDTO,
            @RequestHeader("Authorization") String jwt) throws Exception {

        UserDTO userDTO = userFeignClient.getUserProfile(jwt).getBody();


        Salon salon=salonService.updateSalon(salonDTO,userDTO,salonId);
        SalonDTO salonDTO1= SalonMapper.mapToDTO(salon);


        return ResponseEntity.ok(salonDTO1);

    }

    @GetMapping()
    public ResponseEntity<List<SalonDTO>> getSalons() throws Exception {

        
        List<Salon> salons=salonService.getAllSalons();
        List<SalonDTO> salonDTOS=salons.stream().map((salon) ->
                {
                    SalonDTO salonDTO = SalonMapper.mapToDTO(salon);
                    return salonDTO;
                }

                ).toList();
        return ResponseEntity.ok(salonDTOS);
    }

    @GetMapping("/{salonId}")
    public ResponseEntity<SalonDTO> getSalonById(

            @PathVariable Long salonId

    ) throws Exception {



        Salon salon=salonService.getSalonById(salonId);
        SalonDTO salonDTO = SalonMapper.mapToDTO(salon);

        return ResponseEntity.ok(salonDTO);

    }

    @GetMapping("/search")
    public ResponseEntity<List<SalonDTO>> searchSalons(
            @RequestParam("city") String city
    ) throws Exception {



        List<Salon> salons=salonService.searchSalonByCity(city);
        List<SalonDTO> salonDTOS=salons.stream().map((salon) ->
                {
                    SalonDTO salonDTO = SalonMapper.mapToDTO(salon);
                    return salonDTO;
                }

        ).toList();
        return ResponseEntity.ok(salonDTOS);
    }
    @GetMapping("/owner")
    public ResponseEntity<SalonDTO> getSalonByOwnerId(
            @RequestHeader("Authorization")String jwt
    ) throws Exception {

        UserDTO userDTO = null;
        try {
            userDTO = userFeignClient.getUserProfile(jwt).getBody();
        } catch (Exception e) {
            System.err.println("Feign failed to get user profile: " + e.getMessage());
        }

        if (userDTO == null || userDTO.getId() == null){
            return ResponseEntity.ok(null);
        }

        Salon salon = salonService.getSalonByOwnerId(userDTO.getId());
        if (salon == null) {
            return ResponseEntity.ok(null);
        }
        SalonDTO salonDTO = SalonMapper.mapToDTO(salon);

        return ResponseEntity.ok(salonDTO);
    }

    @DeleteMapping("/{salonId}")
    public ResponseEntity<String> deleteSalon(@PathVariable Long salonId) throws Exception {
        salonService.deleteSalon(salonId);
        return ResponseEntity.ok("Salon deleted successfully");
    }

}
