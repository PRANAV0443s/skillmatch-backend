package com.skillmatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String userId;
    private String name;
    private String email;
    private String photoUrl;
    private String role;
    private String resumeUrl;
    private List<String> skills;

    /** false = email not yet verified (OTP pending) */
    @Builder.Default
    private boolean verified = true;

    private String message;
}
