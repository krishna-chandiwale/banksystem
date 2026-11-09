package com.bank.app.service.impl;

import com.bank.app.dto.request.DepositRequest;
import com.bank.app.dto.request.TransferRequest;
import com.bank.app.dto.request.WithdrawRequest;
import com.bank.app.entity.Account;
import com.bank.app.entity.Beneficiary;
import com.bank.app.entity.Transaction;
import com.bank.app.enums.TransactionStatus;
import com.bank.app.enums.TransactionType;
import com.bank.app.exception.AccountNotFoundException;
import com.bank.app.exception.InsufficientBalanceException;
import com.bank.app.exception.InvalidTransactionException;
import com.bank.app.repository.AccountRepository;
import com.bank.app.repository.BeneficiaryRepository;
import com.bank.app.repository.TransactionRepository;
import com.bank.app.service.TransactionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final SecureRandom random = new SecureRandom();

    public TransactionServiceImpl(AccountRepository accountRepository,
                                  TransactionRepository transactionRepository,
                                  BeneficiaryRepository beneficiaryRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.beneficiaryRepository = beneficiaryRepository;
    }

    private String generateTxnRef() {
        return "TXN-" + (100000 + random.nextInt(900000));
    }

    @Override
    @Transactional
    public Transaction deposit(String userEmail, DepositRequest request) {
        Account account;
        if (request.getAccountNumber() != null && !request.getAccountNumber().isBlank()) {
            account = accountRepository.findByAccountNumber(request.getAccountNumber())
                    .orElseThrow(() -> new AccountNotFoundException("Account not found: " + request.getAccountNumber()));
        } else {
            account = accountRepository.findByUserEmail(userEmail)
                    .orElseThrow(() -> new AccountNotFoundException("No account found for user: " + userEmail));
        }

        account.credit(request.getAmount());
        accountRepository.save(account);

        String note = (request.getDescription() != null && !request.getDescription().isBlank())
                ? request.getDescription() : "Account Cash Deposit";

        Transaction txn = new Transaction(
                generateTxnRef(),
                TransactionType.DEPOSIT,
                request.getAmount(),
                account.getBalance(),
                note,
                null,
                account.getAccountNumber()
        );
        txn.setTransactionDate(LocalDateTime.now());
        txn.setStatus(TransactionStatus.SUCCESS);
        return transactionRepository.save(txn);
    }

    @Override
    @Transactional
    public Transaction withdraw(String userEmail, WithdrawRequest request) {
        Account account;
        if (request.getAccountNumber() != null && !request.getAccountNumber().isBlank()) {
            account = accountRepository.findByAccountNumber(request.getAccountNumber())
                    .orElseThrow(() -> new AccountNotFoundException("Account not found: " + request.getAccountNumber()));
        } else {
            account = accountRepository.findByUserEmail(userEmail)
                    .orElseThrow(() -> new AccountNotFoundException("No account found for user: " + userEmail));
        }

        if (!account.canWithdraw(request.getAmount())) {
            throw new InsufficientBalanceException("Insufficient funds. Available balance: $" + account.getBalance());
        }

        account.debit(request.getAmount());
        accountRepository.save(account);

        String note = (request.getDescription() != null && !request.getDescription().isBlank())
                ? request.getDescription() : "Cash Withdrawal";

        Transaction txn = new Transaction(
                generateTxnRef(),
                TransactionType.WITHDRAWAL,
                request.getAmount(),
                account.getBalance(),
                note,
                account.getAccountNumber(),
                null
        );
        txn.setTransactionDate(LocalDateTime.now());
        txn.setStatus(TransactionStatus.SUCCESS);
        return transactionRepository.save(txn);
    }

    @Override
    @Transactional
    public Transaction transfer(String userEmail, TransferRequest request) {
        Account sourceAccount;
        if (request.getSourceAccountNumber() != null && !request.getSourceAccountNumber().isBlank()) {
            sourceAccount = accountRepository.findByAccountNumber(request.getSourceAccountNumber())
                    .orElseThrow(() -> new AccountNotFoundException("Source account not found: " + request.getSourceAccountNumber()));
        } else {
            sourceAccount = accountRepository.findByUserEmail(userEmail)
                    .orElseThrow(() -> new AccountNotFoundException("Source account not found for: " + userEmail));
        }

        if (sourceAccount.getAccountNumber().equalsIgnoreCase(request.getTargetAccountNumber())) {
            throw new InvalidTransactionException("Self-transfers to the same account are not permitted.");
        }

        Account targetAccount = accountRepository.findByAccountNumber(request.getTargetAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Target recipient account not found: " + request.getTargetAccountNumber()));

        if (!sourceAccount.canWithdraw(request.getAmount())) {
            throw new InsufficientBalanceException("Transfer failed: Insufficient balance ($" + sourceAccount.getBalance() + " available).");
        }

        // ACID Transfer execution
        sourceAccount.debit(request.getAmount());
        targetAccount.credit(request.getAmount());

        accountRepository.save(sourceAccount);
        accountRepository.save(targetAccount);

        String note = (request.getDescription() != null && !request.getDescription().isBlank())
                ? request.getDescription() : "Fund Transfer to " + targetAccount.getAccountNumber();

        Transaction txn = new Transaction(
                generateTxnRef(),
                TransactionType.TRANSFER,
                request.getAmount(),
                sourceAccount.getBalance(),
                note,
                sourceAccount.getAccountNumber(),
                targetAccount.getAccountNumber()
        );
        txn.setTransactionDate(LocalDateTime.now());
        txn.setStatus(TransactionStatus.SUCCESS);
        Transaction savedTxn = transactionRepository.save(txn);

        // Optional: Save payee to beneficiaries if requested
        if (request.isSaveBeneficiary() && !beneficiaryRepository.existsByUserEmailAndAccountNumber(userEmail, targetAccount.getAccountNumber())) {
            String payeeName = (targetAccount.getUser() != null) ? targetAccount.getUser().getFullName() : "Payee (" + targetAccount.getAccountNumber() + ")";
            beneficiaryRepository.save(new Beneficiary(userEmail, payeeName, targetAccount.getAccountNumber(), "Apex Banking Network"));
        }

        return savedTxn;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionHistory(String userEmail) {
        Account account = accountRepository.findByUserEmail(userEmail).orElse(null);
        if (account == null) {
            return transactionRepository.findAllByOrderByTransactionDateDesc();
        }
        return transactionRepository.findByAccountNumberOrderByDateDesc(account.getAccountNumber());
    }

    @Override
    @Transactional
    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }
}
