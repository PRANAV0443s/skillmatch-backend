package com.skillmatch.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF (required for APIs)
                .csrf(csrf -> csrf.disable())

                // Allow public endpoints
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/health", "/auth/**").permitAll() // ✅ VERY IMPORTANT
                        .anyRequest().authenticated());

        return http.build();
    }
}