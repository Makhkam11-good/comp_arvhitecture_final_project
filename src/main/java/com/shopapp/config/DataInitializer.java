package com.shopapp.config;

import com.shopapp.model.Role;
import com.shopapp.model.User;
import com.shopapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner demoAdminInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${APP_ADMIN_USERNAME:admin}") String adminUsername,
            @Value("${APP_ADMIN_EMAIL:admin@shopapp.local}") String adminEmail,
            @Value("${APP_ADMIN_PASSWORD:admin123}") String adminPassword) {
        return args -> {
            if (userRepository.existsByUsername(adminUsername)) {
                return;
            }

            if (userRepository.existsByEmail(adminEmail)) {
                log.warn("Demo admin was not created because email {} is already used", adminEmail);
                return;
            }

            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.info("Demo admin user '{}' is ready", adminUsername);
        };
    }
}
