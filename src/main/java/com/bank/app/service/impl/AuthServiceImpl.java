package com.bank.app.service.impl;

import com.bank.app.dto.request.LoginRequest;
import com.bank.app.dto.request.RegisterRequest;
import com.bank.app.dto.request.UpdateProfileRequest;
import com.bank.app.dto.response.AccountSummaryResponse;
import com.bank.app.entity.Account;
import com.bank.app.entity.CurrentAccount;
import com.bank.app.entity.SavingsAccount;
import com.bank.app.entity.User;
import com.bank.app.enums.AccountType;
import com.bank.app.enums.Role;
import com.bank.app.enums.UserStatus;
import com.bank.app.exception.AccountNotFoundException;
import com.bank.app.exception.InvalidTransactionException;
import com.bank.app.exception.UserAlreadyExistsException;
import com.bank.app.repository.AccountRepository;
import com.bank.app.repository.UserRepository;
import com.bank.app.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    public AuthServiceImpl(UserRepository userRepository, AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public AccountSummaryResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("An account with email " + request.getEmail() + " already exists.");
        }

        // Create User
        User user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhone(),
                Role.CUSTOMER
        );
        user.setStatus(UserStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        // Generate Unique Account Number: ACT + 8 digits
        String accountNumber;
        do {
            accountNumber = "ACT" + (10000000 + random.nextInt(90000000));
        } while (accountRepository.existsByAccountNumber(accountNumber));

        // Polymorphic Account Creation based on chosen AccountType
        Account account;
        if (request.getAccountType() == AccountType.CURRENT) {
            account = new CurrentAccount(accountNumber, request.getInitialDeposit(), savedUser);
        } else {
            account = new SavingsAccount(accountNumber, request.getInitialDeposit(), savedUser);
        }

        Account savedAccount = accountRepository.save(account);
        savedUser.setAccount(savedAccount);

        return mapToSummary(savedUser, savedAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public AccountSummaryResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AccountNotFoundException("Invalid credentials. No user found with this email."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidTransactionException("Invalid password. Please check your credentials.");
        }

        if (user.getStatus() == UserStatus.DEACTIVATED) {
            throw new InvalidTransactionException("This account is currently suspended. Please contact bank administration.");
        }

        Account account = user.getAccount();
        return mapToSummary(user, account);
    }

    @Override
    @Transactional(readOnly = true)
    public AccountSummaryResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccountNotFoundException("User profile not found for " + email));
        return mapToSummary(user, user.getAccount());
    }

    @Override
    @Transactional
    public AccountSummaryResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccountNotFoundException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new InvalidTransactionException("Current password verification failed.");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        User updatedUser = userRepository.save(user);
        return mapToSummary(updatedUser, updatedUser.getAccount());
    }

    private AccountSummaryResponse mapToSummary(User user, Account account) {
        AccountSummaryResponse dto = new AccountSummaryResponse();
        dto.setUserId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());

        if (account != null) {
            dto.setAccountNumber(account.getAccountNumber());
            dto.setAccountType(account.getAccountType());
            dto.setBalance(account.getBalance());
        }
        return dto;
    }
}
