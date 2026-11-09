package com.bank.app.config;

import com.bank.app.entity.Beneficiary;
import com.bank.app.entity.SavingsAccount;
import com.bank.app.entity.Transaction;
import com.bank.app.entity.User;
import com.bank.app.enums.Role;
import com.bank.app.enums.TransactionStatus;
import com.bank.app.enums.TransactionType;
import com.bank.app.enums.UserStatus;
import com.bank.app.repository.AccountRepository;
import com.bank.app.repository.BeneficiaryRepository;
import com.bank.app.repository.TransactionRepository;
import com.bank.app.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           AccountRepository accountRepository,
                           TransactionRepository transactionRepository,
                           BeneficiaryRepository beneficiaryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Admin User
        if (!userRepository.existsByEmail("admin@apexbank.com")) {
            User admin = new User(
                    "System Administrator",
                    "admin@apexbank.com",
                    passwordEncoder.encode("admin123"),
                    "+1 (555) 999-0000",
                    Role.ADMIN
            );
            admin.setStatus(UserStatus.ACTIVE);
            userRepository.save(admin);
            log.info("Initialized default administrator: admin@apexbank.com");
        }

        // 2. Seed Default Demo Customer (Alex Morgan)
        if (!userRepository.existsByEmail("alex.morgan@college.edu")) {
            User alex = new User(
                    "Alex Morgan",
                    "alex.morgan@college.edu",
                    passwordEncoder.encode("password123"),
                    "+1 (555) 382-9012",
                    Role.CUSTOMER
            );
            alex.setStatus(UserStatus.ACTIVE);
            User savedAlex = userRepository.save(alex);

            SavingsAccount alexAccount = new SavingsAccount("ACT88204910", new BigDecimal("24850.75"), savedAlex);
            accountRepository.save(alexAccount);
            savedAlex.setAccount(alexAccount);

            // Seed initial transactions for Alex
            if (transactionRepository.findByAccountNumberOrderByDateDesc("ACT88204910").isEmpty()) {
                transactionRepository.save(new Transaction("TXN-904128", TransactionType.DEPOSIT,
                        new BigDecimal("4500.00"), new BigDecimal("24850.75"),
                        "Direct Payroll Deposit - Tech Corp", null, "ACT88204910"));

                transactionRepository.save(new Transaction("TXN-883921", TransactionType.TRANSFER,
                        new BigDecimal("1200.00"), new BigDecimal("20350.75"),
                        "Rent Transfer to Landlord (ACT49012891)", "ACT88204910", "ACT49012891"));

                transactionRepository.save(new Transaction("TXN-773829", TransactionType.WITHDRAWAL,
                        new BigDecimal("350.00"), new BigDecimal("21550.75"),
                        "ATM Cash Withdrawal - Main Branch ATM", "ACT88204910", null));
            }

            // Seed initial beneficiaries for Alex
            beneficiaryRepository.save(new Beneficiary("alex.morgan@college.edu", "Sophia Reynolds", "ACT77391022", "Apex Retail Banking"));
            beneficiaryRepository.save(new Beneficiary("alex.morgan@college.edu", "David Kim", "ACT66289104", "Metropolitan Financial"));
            beneficiaryRepository.save(new Beneficiary("alex.morgan@college.edu", "Landlord Asset Mgmt", "ACT49012891", "Apex Corporate Branch"));

            log.info("Initialized default customer: alex.morgan@college.edu (ACT88204910)");
        }

        // 3. Seed additional customer accounts for Admin directory demonstration
        if (!userRepository.existsByEmail("sophia.r@techmail.com")) {
            User sophia = new User("Sophia Reynolds", "sophia.r@techmail.com", passwordEncoder.encode("password123"), "+1 (555) 234-5678", Role.CUSTOMER);
            User savedSophia = userRepository.save(sophia);
            SavingsAccount acc = new SavingsAccount("ACT77391022", new BigDecimal("14200.00"), savedSophia);
            accountRepository.save(acc);
        }

        if (!userRepository.existsByEmail("david.kim@designhub.io")) {
            User david = new User("David Kim", "david.kim@designhub.io", passwordEncoder.encode("password123"), "+1 (555) 345-6789", Role.CUSTOMER);
            david.setStatus(UserStatus.PENDING);
            User savedDavid = userRepository.save(david);
            SavingsAccount acc = new SavingsAccount("ACT66289104", new BigDecimal("8350.50"), savedDavid);
            accountRepository.save(acc);
        }

        if (!userRepository.existsByEmail("emma.w@global.org")) {
            User emma = new User("Emma Watson", "emma.w@global.org", passwordEncoder.encode("password123"), "+1 (555) 456-7890", Role.CUSTOMER);
            emma.setStatus(UserStatus.DEACTIVATED);
            User savedEmma = userRepository.save(emma);
            SavingsAccount acc = new SavingsAccount("ACT55198230", BigDecimal.ZERO, savedEmma);
            accountRepository.save(acc);
        }
    }
}
