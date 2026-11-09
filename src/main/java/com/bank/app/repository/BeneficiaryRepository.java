package com.bank.app.repository;

import com.bank.app.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {

    List<Beneficiary> findByUserEmail(String userEmail);

    boolean existsByUserEmailAndAccountNumber(String userEmail, String accountNumber);
}
