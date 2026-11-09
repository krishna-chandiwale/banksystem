package com.bank.app.repository;

import com.bank.app.entity.User;
import com.bank.app.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * UserRepository interface demonstrates Spring Data abstraction.
 * Generates SQL and manages JDBC communication behind the scenes.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByStatus(UserStatus status);
}
