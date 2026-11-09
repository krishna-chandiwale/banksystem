package com.bank.app.controller;

import com.bank.app.dto.request.LoginRequest;
import com.bank.app.dto.request.RegisterRequest;
import com.bank.app.dto.request.UpdateProfileRequest;
import com.bank.app.dto.response.AccountSummaryResponse;
import com.bank.app.dto.response.ApiResponse;
import com.bank.app.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AccountSummaryResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AccountSummaryResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Customer registration completed successfully!", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AccountSummaryResponse>> login(@Valid @RequestBody LoginRequest request) {
        AccountSummaryResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful!", response));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<AccountSummaryResponse>> getProfile(@RequestParam String email) {
        AccountSummaryResponse response = authService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved successfully", response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<AccountSummaryResponse>> updateProfile(
            @RequestParam String email,
            @RequestBody UpdateProfileRequest request) {
        AccountSummaryResponse response = authService.updateProfile(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully!", response));
    }
}
