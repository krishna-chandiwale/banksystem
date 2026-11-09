package com.bank.app.service.impl;

import com.bank.app.dto.response.AccountSummaryResponse;
import com.bank.app.entity.Account;
import com.bank.app.entity.User;
import com.bank.app.exception.AccountNotFoundException;
import com.bank.app.repository.AccountRepository;
import com.bank.app.repository.UserRepository;
import com.bank.app.service.AccountService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountServiceImpl(AccountRepository accountRepository, UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AccountSummaryResponse getAccountDetails(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AccountNotFoundException("User not found with email: " + userEmail));

        Account account = user.getAccount();
        if (account == null) {
            throw new AccountNotFoundException("No active bank account associated with " + userEmail);
        }

        AccountSummaryResponse dto = new AccountSummaryResponse();
        dto.setUserId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setAccountType(account.getAccountType());
        dto.setBalance(account.getBalance());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getBalance(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
        return account.getBalance();
    }
}
