package com.bank.app;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Banking Management System
 * 
 * Entry point for the Spring Boot application.
 * Bootstraps the application context, embedded web server, 
 * JPA entity scanning, and database connectivity.
 */
@SpringBootApplication
public class BankingSystemApplication {

    private static final Logger log = LoggerFactory.getLogger(BankingSystemApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(BankingSystemApplication.class, args);
        log.info("==================================================================");
        log.info("  Banking Management System started successfully on port 8080!    ");
        log.info("  Access Portal: http://localhost:8080                            ");
        log.info("==================================================================");
    }
}
