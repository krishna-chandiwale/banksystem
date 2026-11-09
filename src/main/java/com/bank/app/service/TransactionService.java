package com.bank.app.service;

import com.bank.app.dto.request.DepositRequest;
import com.bank.app.dto.request.TransferRequest;
import com.bank.app.dto.request.WithdrawRequest;
import com.bank.app.entity.Transaction;
import java.util.List;

public interface TransactionService {

    Transaction deposit(String userEmail, DepositRequest request);

    Transaction withdraw(String userEmail, WithdrawRequest request);

    Transaction transfer(String userEmail, TransferRequest request);

    List<Transaction> getTransactionHistory(String userEmail);

    void deleteTransaction(Long id);
}
