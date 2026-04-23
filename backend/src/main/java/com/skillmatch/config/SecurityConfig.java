package com.skillmatch.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
                ecurityFilterChain securityFi
                
                        f(csrf -> csrf.disable())
                        horizeHttpRequests(auth -> au    .requestMatchers("/", "/auth/**").permitAll()
                .anyRequest().authenticated()
            );

 
