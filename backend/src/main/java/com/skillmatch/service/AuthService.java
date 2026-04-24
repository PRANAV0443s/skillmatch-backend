package com.skillmatch.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.skillmatch.dto.AuthResponse;
import com.skillmatch.dto.LoginRequest;
import com.skillmatch.dto.RegisterRequest;
import com.skillmatch.model.User;
import com.skillmatch.repository.UserRepository;
import com.skillmatch.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;
import com.skillmatch.dto.GoogleAuthRequest;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        User existingUser = userRepository.findByEmail(email).orElse(null);
        if (existingUser != null) {
            throw new RuntimeException("Email already registered. Please login.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .verified(true)
                .build();

        userRepository.save(user);
        log.info("New user registered and auto-verified: {}", email);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .verified(true)
                .message("Account created successfully.")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isVerified()) {
            user.setVerified(true);
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .photoUrl(user.getPhotoUrl())
                .role(user.getRole())
                .resumeUrl(user.getResumeUrl())
                .skills(user.getSkills())
                .verified(true)
                .message("Login successful")
                .build();
    }

    public AuthResponse googleLogin(GoogleAuthRequest request) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());
            String email = decodedToken.getEmail().toLowerCase().trim();
            String name = decodedToken.getName();
            String photoUrl = decodedToken.getPicture();

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setPhotoUrl(photoUrl);
                user.setVerified(true);
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setRole(request.getRole() != null ? request.getRole() : "STUDENT");
                user = userRepository.save(user);
            } else {
                user.setName(name);
                user.setPhotoUrl(photoUrl);
                user.setVerified(true);
                user = userRepository.save(user);
            }

            String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

            return AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .photoUrl(user.getPhotoUrl())
                    .role(user.getRole())
                    .resumeUrl(user.getResumeUrl())
                    .skills(user.getSkills())
                    .verified(user.isVerified())
                    .message("Google login successful")
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed", e);
        }
    }
}