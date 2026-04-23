package com.skillmatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    private String id;

    private String userId;

    private String jobId;

    private String resumeUrl;

    /** AI-computed match score: 0–100 */
    private int matchScore;

    /** Values: APPLIED, VIEWED, SHORTLISTED, REJECTED */
    private String status;

    @Builder.Default
    private LocalDateTime appliedAt = LocalDateTime.now();
}
