package com.bank.app.repository;

import com.bank.app.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByTransactionRef(String transactionRef);

    @Query("SELECT t FROM Transaction t WHERE t.sourceAccountNumber = :accNo OR t.targetAccountNumber = :accNo ORDER BY t.transactionDate DESC")
    List<Transaction> findByAccountNumberOrderByDateDesc(@Param("accNo") String accountNumber);

    List<Transaction> findAllByOrderByTransactionDateDesc();
}
