package com.zosh.service.impl;

import com.zosh.model.User;
import com.zosh.payload.dto.SignupDTO;
import com.zosh.payload.response.AuthResponse;
import com.zosh.payload.response.TokenResponse;
import com.zosh.repository.UserRepository;
import com.zosh.service.AuthService;
import com.zosh.service.KeycloakService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final KeycloakService keycloakService;

    @Override
    public AuthResponse login(String username, String password) throws Exception {

        User user = userRepository.findByEmail(username);
        String usernameToUse = (user != null) ? user.getUsername() : username;

        TokenResponse tokenResponse=keycloakService.getAdminAccessToken(
                usernameToUse,
                password,
                "password",null);

        AuthResponse authResponse=new AuthResponse();
        authResponse.setRefresh_token(tokenResponse.getRefreshToken());
        authResponse.setJwt(tokenResponse.getAccessToken());
        authResponse.setMessage("login Success");
        return authResponse;
    }

    @Override
    public AuthResponse signup(SignupDTO req) throws Exception {
        keycloakService.createUser(req);

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(req.getPassword());
        user.setEmail(req.getEmail());
        user.setRole(req.getRole());
        user.setFullName(req.getFullName());
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        TokenResponse tokenResponse=keycloakService.getAdminAccessToken(req.getUsername(),
                req.getPassword(),
                "password",null);

        AuthResponse authResponse=new AuthResponse();
        authResponse.setRefresh_token(tokenResponse.getRefreshToken());
        authResponse.setJwt(tokenResponse.getAccessToken());
        authResponse.setRole(user.getRole());
        authResponse.setMessage("Registered Successfully");

        return authResponse;
    }

    @Override
    public AuthResponse getAccessTokenFromRefreshToken(String refreshToken) throws Exception {

        TokenResponse tokenResponse=keycloakService.getAdminAccessToken(
                null,
                null,
                "refresh_token",refreshToken);

        AuthResponse authResponse=new AuthResponse();
        authResponse.setRefresh_token(tokenResponse.getRefreshToken());
        authResponse.setJwt(tokenResponse.getAccessToken());
        authResponse.setMessage("login Success");
        return authResponse;
    }
}
