package com.skillmatch.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    private String id;

    private String title;

    private String description;

    @Builder.Default
    private List<String> requiredSkills = new ArrayList<>();

    private String recruiterId;

    private String company;

    private String location;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
