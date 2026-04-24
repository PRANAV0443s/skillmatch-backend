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

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;
import com.skillmatch.dto.GoogleAuthRequest;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    private static final SecureRandom random = new SecureRandom();

    /** Generate a 6-digit OTP */
    private String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        // Check if user already exists
        User existingUser = userRepository.findByEmail(email).orElse(null);
        if (existingUser != null) {
            // If user exists, don't allow re-registration, just tell them to login
            throw new RuntimeException("Email already registered. Please login.");
        }

        // New registration: verified = true by default
        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .verified(true)
                .build();

        userRepository.save(user);
        
        log.info("New user registered and auto-verified: {}", email);

        // Issue JWT token immediately
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

    public AuthResponse verifyEmail(String email, String otp) {
        email = email.toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            throw new RuntimeException("Email already verified");
        }

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid verification code");
        }

        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code has expired. Please request a new one.");
        }

        // Mark as verified and clear OTP
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        log.info("User verified: {}", email);

        // Now issue the JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .skills(user.getSkills())
                .verified(true)
                .message("Email verified successfully")
                .build();
    }

    public AuthResponse resendOtp(String email) {
        email = email.toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            throw new RuntimeException("Email already verified");
        }

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendOtpEmail(email, otp, user.getName());
        log.info("OTP resent to: {}", email);

        return AuthResponse.builder()
                .email(email)
                .verified(false)
                .message("New verification code sent to " + email)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Auto-verify old unverified accounts on login
        if (!user.isVerified()) {
            user.setVerified(true);
            user.setOtp(null);
            user.setOtpExpiry(null);
            userRepository.save(user);
            log.info("Auto-verified existing user on login: {}", email);
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
                .build();
    }

    public AuthResponse googleLogin(GoogleAuthRequest request) {
        log.info("Starting Google authentication for token: {}...", 
            request.getIdToken().substring(0, Math.min(10, request.getIdToken().length())));
        try {
            // Verify the token using Firebase Admin SDK
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());
            
            String email = decodedToken.getEmail().toLowerCase().trim();
            log.info("Firebase token verified for email: {}", email);
            
            String name = decodedToken.getName();
            String photoUrl = decodedToken.getPicture();

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                log.info("New user detected via Google login: {}", email);
                String tempPassword = UUID.randomUUID().toString();
                String role = request.getRole() != null ? request.getRole() : "STUDENT";
                user = User.builder()
                        .name(name)
                        .email(email)
                        .photoUrl(photoUrl)
                        .password(passwordEncoder.encode(tempPassword))
                        .role(role)
                        .verified(true) // Google accounts are implicitly verified
                        .build();
                userRepository.save(user);
            } else {
                log.info("Existing user logged in via Google: {}", email);
                if (user.getPhotoUrl() == null && photoUrl != null) {
                    user.setPhotoUrl(photoUrl);
                    userRepository.save(user);
                }
                if (!user.isVerified()) {
                    user.setVerified(true);
                    user.setOtp(null);
                    user.setOtpExpiry(null);
                    userRepository.save(user);
                }
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
                    .build();

        } catch (Exception e) {
            log.error("Google/Firebase authentication failed for token: {}. Error: {}", 
                request.getIdToken().substring(0, Math.min(10, request.getIdToken().length())), 
                e.getMessage());
        }
    }

    public AuthResponse getCurrentUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .photoUrl(user.getPhotoUrl())
                .role(user.getRole())
                .resumeUrl(user.getResumeUrl())
                .skills(user.getSkills())
                .verified(user.isVerified())
                .build();
    }
}
