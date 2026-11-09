package com.bank.app.service;

import com.bank.app.dto.response.AccountSummaryResponse;
import com.bank.app.enums.UserStatus;
import java.util.List;
import java.util.Map;

public interface AdminService {

    List<AccountSummaryResponse> getAllUsers();

    AccountSummaryResponse updateUserStatus(Long userId, UserStatus status);

    void deleteUser(Long userId);

    Map<String, Object> getSystemStatistics();
}
