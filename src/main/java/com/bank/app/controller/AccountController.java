package com.bank.app.controller;

import com.bank.app.dto.response.AccountSummaryResponse;
import com.bank.app.dto.response.ApiResponse;
import com.bank.app.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/account")
@CrossOrigin(origins = "*")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/details")
    public ResponseEntity<ApiResponse<AccountSummaryResponse>> getAccountDetails(@RequestParam String email) {
        AccountSummaryResponse details = accountService.getAccountDetails(email);
        return ResponseEntity.ok(ApiResponse.ok("Account details retrieved successfully", details));
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<BigDecimal>> getBalance(@RequestParam String accountNumber) {
        BigDecimal balance = accountService.getBalance(accountNumber);
        return ResponseEntity.ok(ApiResponse.ok("Balance retrieved", balance));
    }
}
