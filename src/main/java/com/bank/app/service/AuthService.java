package com.bank.app.service;

import com.bank.app.dto.request.LoginRequest;
import com.bank.app.dto.request.RegisterRequest;
import com.bank.app.dto.request.UpdateProfileRequest;
import com.bank.app.dto.response.AccountSummaryResponse;

/**
 * AuthService Interface defines authentication abstraction.
 */
public interface AuthService {

    AccountSummaryResponse register(RegisterRequest request);

    AccountSummaryResponse login(LoginRequest request);

    AccountSummaryResponse getProfile(String email);

    AccountSummaryResponse updateProfile(String email, UpdateProfileRequest request);
}
