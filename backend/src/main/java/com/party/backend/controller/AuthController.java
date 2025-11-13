package com.party.backend.controller;


import com.party.backend.dto.auth.AuthenticationResponse;
import com.party.backend.dto.auth.LoginRequestDTO;
import com.party.backend.dto.auth.RegisterRequestDTO;
import com.party.backend.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register( @RequestBody RegisterRequestDTO request ){
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login( @RequestBody LoginRequestDTO request ){
        return ResponseEntity.ok(authService.login(request));
    }
}
