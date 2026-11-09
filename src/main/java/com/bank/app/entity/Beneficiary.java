package com.bank.app.entity;

import jakarta.persistence.*;

/**
 * Beneficiary Entity represents saved transfer payees for a user.
 */
@Entity
@Table(name = "beneficiaries")
public class Beneficiary extends BaseEntity {

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "account_number", nullable = false, length = 30)
    private String accountNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    public Beneficiary() {
        super();
    }

    public Beneficiary(String userEmail, String name, String accountNumber, String bankName) {
        super();
        this.userEmail = userEmail;
        this.name = name;
        this.accountNumber = accountNumber;
        this.bankName = bankName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }
}
