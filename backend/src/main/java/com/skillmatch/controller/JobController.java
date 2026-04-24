package com.skillmatch.controller;

import com.skillmatch.dto.JobRequest;
import com.skillmatch.model.Job;
import com.skillmatch.model.User;
import com.skillmatch.service.JobService;
import com.skillmatch.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJob(@PathVariable String id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Job> createJob(@Valid @RequestBody JobRequest request,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.createJob(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Job> updateJob(@PathVariable String id,
                                          @Valid @RequestBody JobRequest request,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.updateJob(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteJob(@PathVariable String id,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        jobService.deleteJob(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<Job>> getMyJobs(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.getJobsByRecruiter(userDetails.getUsername()));
    }

    @GetMapping("/recommended")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Job>> getRecommended(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(jobService.getRecommendedJobs(user.getSkills()));
    }
}
