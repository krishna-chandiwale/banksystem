package com.bank.app.service;

import com.bank.app.dto.response.AccountSummaryResponse;
import java.math.BigDecimal;

public interface AccountService {

    AccountSummaryResponse getAccountDetails(String userEmail);

    BigDecimal getBalance(String accountNumber);
}
