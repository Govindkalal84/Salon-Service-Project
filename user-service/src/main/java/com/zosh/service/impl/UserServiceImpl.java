package com.zosh.service.impl;

import com.zosh.exception.UserException;
import com.zosh.model.User;
import com.zosh.payload.dto.KeycloakUserDTO;
import com.zosh.repository.UserRepository;
import com.zosh.service.KeycloakService;
import com.zosh.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {


    private final UserRepository userRepository;
    private final KeycloakService keycloakService;

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) throws UserException {
        Optional<User> otp=userRepository.findById(id);
        if(otp.isPresent()){
            return otp.get();
        }
        throw new UserException("User not found");
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUser(Long id) throws UserException {
        Optional<User> otp=userRepository.findById(id);
        if(otp.isEmpty()){
            throw new UserException("user not found with id"+id);
        }
        userRepository.deleteById(otp.get().getId());


    }

    @Override
    public User updateUser(Long id, User user) throws UserException {
        Optional<User> otp=userRepository.findById(id);
        if(otp.isEmpty()){
            throw new UserException("user not found with id"+id);
        }
        User existingUser=otp.get();
        existingUser.setFullName(user.getFullName());
        existingUser.setEmail(user.getEmail());
        existingUser.setRole(user.getRole());
        existingUser.setUsername(user.getUsername());
        return userRepository.save(existingUser);
    }

    @Override
    public User getUserFromJwt(String jwt) throws Exception {
        KeycloakUserDTO keycloakUserDTO = keycloakService.fetchUserProfileByJwt(jwt);

        User user = null;
        if (keycloakUserDTO.getEmail() != null) {
            user = userRepository.findByEmail(keycloakUserDTO.getEmail());
        }
        if (user == null && keycloakUserDTO.getUsername() != null) {
            user = userRepository.findByUsername(keycloakUserDTO.getUsername());
        }

        // Auto-sync email from Keycloak if updated
        if (user != null && keycloakUserDTO.getEmail() != null && !keycloakUserDTO.getEmail().equals(user.getEmail())) {
            user.setEmail(keycloakUserDTO.getEmail());
            user = userRepository.save(user);
        }

        return user;
    }
}
