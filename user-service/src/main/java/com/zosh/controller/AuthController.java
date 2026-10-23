package com.zosh.controller;


import com.zosh.payload.dto.LoginDTO;
import com.zosh.payload.dto.SignupDTO;
import com.zosh.payload.response.AuthResponse;
import com.zosh.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = {"https://salon-service-project.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:5170"})
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
            @RequestBody SignupDTO req
            ) throws Exception {
        AuthResponse res =authService.signup(req);
        return ResponseEntity.ok(res);

    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginDTO req
    ) throws Exception {
        AuthResponse res =authService.login(req.getEmail(),req.getPassword());
        return ResponseEntity.ok(res);

    }
    @GetMapping("/access-token/refresh-token/{refreshToken}")
    public ResponseEntity<AuthResponse> getAccessToken(
            @PathVariable String refreshToken
    ) throws Exception {



        AuthResponse res = authService.getAccessTokenFromRefreshToken(refreshToken);

        return ResponseEntity.ok(res);
    }
    }



