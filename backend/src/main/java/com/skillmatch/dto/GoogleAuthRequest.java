package com.skillmatch.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GoogleAuthRequest {
    @NotBlank(message = "ID Token is required")
    private String idToken;

    // Optional role for registration (e.g. STUDENT)
    private String role;
}
