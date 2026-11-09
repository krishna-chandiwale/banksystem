package com.bank.app.controller;

import com.bank.app.dto.request.DepositRequest;
import com.bank.app.dto.request.TransferRequest;
import com.bank.app.dto.request.WithdrawRequest;
import com.bank.app.dto.response.ApiResponse;
import com.bank.app.entity.Transaction;
import com.bank.app.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<Transaction>> deposit(
            @RequestParam(required = false) String email,
            @Valid @RequestBody DepositRequest request) {
        Transaction txn = transactionService.deposit(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Funds deposited successfully!", txn));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<Transaction>> withdraw(
            @RequestParam(required = false) String email,
            @Valid @RequestBody WithdrawRequest request) {
        Transaction txn = transactionService.withdraw(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Cash withdrawn successfully!", txn));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<Transaction>> transfer(
            @RequestParam(required = false) String email,
            @Valid @RequestBody TransferRequest request) {
        Transaction txn = transactionService.transfer(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Transfer executed successfully!", txn));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Transaction>>> getHistory(
            @RequestParam(required = false) String email) {
        List<Transaction> history = transactionService.getTransactionHistory(email);
        return ResponseEntity.ok(ApiResponse.ok("Transaction statement retrieved", history));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok(ApiResponse.ok("Transaction record deleted successfully"));
    }
}
