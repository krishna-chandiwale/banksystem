package com.bank.app.controller;

import com.bank.app.dto.response.AccountSummaryResponse;
import com.bank.app.dto.response.ApiResponse;
import com.bank.app.enums.UserStatus;
import com.bank.app.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AccountSummaryResponse>>> getAllUsers() {
        List<AccountSummaryResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok("Customer directory retrieved", users));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<AccountSummaryResponse>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status) {
        AccountSummaryResponse updated = adminService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Customer status updated to " + status, updated));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("Customer account purged successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats() {
        Map<String, Object> stats = adminService.getSystemStatistics();
        return ResponseEntity.ok(ApiResponse.ok("System statistics retrieved", stats));
    }
}
