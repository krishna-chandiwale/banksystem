package com.bank.app.entity;

import com.bank.app.enums.AccountType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;

/**
 * CurrentAccount inherits from Account.
 * Supports standard business checking overdraft buffer.
 */
@Entity
@DiscriminatorValue("CURRENT")
public class CurrentAccount extends Account {

    private static final BigDecimal OVERDRAFT_BUFFER = new BigDecimal("500.00");

    public CurrentAccount() {
        super();
        setAccountType(AccountType.CURRENT);
    }

    public CurrentAccount(String accountNumber, BigDecimal balance, User user) {
        super(accountNumber, AccountType.CURRENT, balance, user);
    }

    @Override
    public BigDecimal calculateInterest() {
        return BigDecimal.ZERO; // Current accounts typically yield 0%
    }

    @Override
    public boolean canWithdraw(BigDecimal amount) {
        // Can withdraw balance up to allowable overdraft limit
        BigDecimal maxAvailable = getBalance().add(OVERDRAFT_BUFFER);
        return maxAvailable.compareTo(amount) >= 0;
    }
}
