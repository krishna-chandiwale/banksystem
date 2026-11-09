package com.bank.app.service.impl;

import com.bank.app.dto.response.AccountSummaryResponse;
import com.bank.app.entity.Account;
import com.bank.app.entity.User;
import com.bank.app.enums.UserStatus;
import com.bank.app.exception.AccountNotFoundException;
import com.bank.app.exception.InvalidTransactionException;
import com.bank.app.repository.AccountRepository;
import com.bank.app.repository.UserRepository;
import com.bank.app.service.AdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    public AdminServiceImpl(UserRepository userRepository, AccountRepository accountRepository) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountSummaryResponse> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            AccountSummaryResponse dto = new AccountSummaryResponse();
            dto.setUserId(user.getId());
            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
            dto.setRole(user.getRole());
            dto.setStatus(user.getStatus());

            Account acc = user.getAccount();
            if (acc != null) {
                dto.setAccountNumber(acc.getAccountNumber());
                dto.setAccountType(acc.getAccountType());
                dto.setBalance(acc.getBalance());
            } else {
                dto.setBalance(BigDecimal.ZERO);
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AccountSummaryResponse updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AccountNotFoundException("User not found with id: " + userId));

        user.setStatus(status);
        User saved = userRepository.save(user);

        AccountSummaryResponse dto = new AccountSummaryResponse();
        dto.setUserId(saved.getId());
        dto.setFullName(saved.getFullName());
        dto.setEmail(saved.getEmail());
        dto.setRole(saved.getRole());
        dto.setStatus(saved.getStatus());
        if (saved.getAccount() != null) {
            dto.setAccountNumber(saved.getAccount().getAccountNumber());
            dto.setBalance(saved.getAccount().getBalance());
        }
        return dto;
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AccountNotFoundException("User not found with id: " + userId));

        Account acc = user.getAccount();
        if (acc != null && acc.getBalance().compareTo(BigDecimal.ZERO) > 0) {
            throw new InvalidTransactionException("Cannot delete customer account: The account carries an active balance of $" + acc.getBalance() + ". Settle balance to $0.00 prior to deletion.");
        }

        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getSystemStatistics() {
        List<User> users = userRepository.findAll();
        List<Account> accounts = accountRepository.findAll();

        long activeCount = users.stream().filter(u -> u.getStatus() == UserStatus.ACTIVE).count();
        long inactiveCount = users.stream().filter(u -> u.getStatus() == UserStatus.DEACTIVATED || u.getStatus() == UserStatus.PENDING).count();

        BigDecimal totalLiquidity = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", users.size());
        stats.put("activeUsers", activeCount);
        stats.put("inactiveUsers", inactiveCount);
        stats.put("totalAccounts", accounts.size());
        stats.put("totalLiquidity", totalLiquidity);
        return stats;
    }
}
