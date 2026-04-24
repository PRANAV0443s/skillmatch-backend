package com.skillmatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    private String name;

    private String photoUrl;

    @Indexed(unique = true)
    private String email;

    private String password;

    /** Values: STUDENT, RECRUITER, ADMIN */
    private String role;

    private String resumeUrl;

    @Builder.Default
    private List<String> skills = new ArrayList<>();

    /** Email verification */
    @Builder.Default
    private boolean verified = false;

    private String otp;

    private LocalDateTime otpExpiry;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
