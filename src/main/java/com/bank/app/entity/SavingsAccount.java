package com.bank.app.entity;

import com.bank.app.enums.AccountType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;

/**
 * SavingsAccount inherits from Account (Inheritance).
 * Demonstrates Polymorphism by overriding interest and withdrawal limits.
 */
@Entity
@DiscriminatorValue("SAVINGS")
public class SavingsAccount extends Account {

    private static final BigDecimal ANNUAL_INTEREST_RATE = new BigDecimal("0.042"); // 4.2% APY

    public SavingsAccount() {
        super();
        setAccountType(AccountType.SAVINGS);
    }

    public SavingsAccount(String accountNumber, BigDecimal balance, User user) {
        super(accountNumber, AccountType.SAVINGS, balance, user);
    }

    @Override
    public BigDecimal calculateInterest() {
        return getBalance().multiply(ANNUAL_INTEREST_RATE);
    }

    @Override
    public boolean canWithdraw(BigDecimal amount) {
        // Savings accounts cannot overdraft
        return getBalance().compareTo(amount) >= 0;
    }
}
