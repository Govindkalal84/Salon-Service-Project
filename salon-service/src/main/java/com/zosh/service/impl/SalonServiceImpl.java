package com.zosh.service.impl;

import com.zosh.model.Salon;
import com.zosh.payload.dto.SalonDTO;
import com.zosh.payload.dto.UserDTO;
import com.zosh.repository.SalonRepository;
import com.zosh.service.SalonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalonServiceImpl  implements SalonService {


   private final SalonRepository salonRepository;

    @Override
    public Salon createSalon(SalonDTO req, UserDTO user) {

        Salon salon = new Salon();
        salon.setName(req.getName());
        salon.setAddress(req.getAddress());
        salon.setEmail(req.getEmail());
        salon.setCity(req.getCity());
        salon.setImages(req.getImages());
        salon.setOwnerId(user.getId());
        salon.setOpenTime(req.getOpenTime() != null ? req.getOpenTime() : LocalTime.of(9, 0));
        salon.setCloseTime(req.getCloseTime() != null ? req.getCloseTime() : LocalTime.of(20, 0));
        salon.setPhoneNumber(req.getPhoneNumber());
        return salonRepository.save(salon);
    }

    @Override
    public Salon updateSalon(SalonDTO salon, UserDTO user, Long salonId) throws Exception {

        Salon existingSalon = salonRepository.findById(salonId).orElse(null);

        if(!salon.getOwnerId().equals(user.getId())){
            throw new Exception("you dont have permission to update the salon");
        }

        if(existingSalon != null ){

            existingSalon.setCity(salon.getCity());
            existingSalon.setName(salon.getName());
            existingSalon.setAddress(salon.getAddress());
            existingSalon.setEmail(salon.getEmail());
            existingSalon.setImages(salon.getImages());
            if (salon.getOpenTime() != null) {
                existingSalon.setOpenTime(salon.getOpenTime());
            }
            if (salon.getCloseTime() != null) {
                existingSalon.setCloseTime(salon.getCloseTime());
            }
            existingSalon.setOwnerId(user.getId()); 
            existingSalon.setPhoneNumber(salon.getPhoneNumber());


          return salonRepository.save(existingSalon);
        }
        throw new Exception("salon not exist");


    }

    @Override
    public List<Salon> getAllSalons() {
        return salonRepository.findAll();
    }

    @Override
    public Salon getSalonById(Long salonId) throws Exception {
        Salon salon= salonRepository.findById(salonId).orElse(null);
        if(salon == null){
            throw new Exception("salon not exist");
        }
        return   salon;
    }

    @Override
    public Salon getSalonByOwnerId(Long ownerId) {
        return salonRepository.findByOwnerId(ownerId);
    }

    @Override
    public List<Salon> searchSalonByCity(String city) {
        return salonRepository.searchSalons(city);
    }
}
