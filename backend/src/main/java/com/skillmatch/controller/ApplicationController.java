package com.skillmatch.controller;

import com.skillmatch.model.Application;
import com.skillmatch.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /** Student applies to a job, sending resume PDF as multipart */
    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Application> apply(@PathVariable String jobId,
                                              @RequestParam("resume") MultipartFile resume,
                                              @AuthenticationPrincipal UserDetails userDetails) throws Exception {
        return ResponseEntity.ok(
                applicationService.apply(jobId, userDetails.getUsername(), resume.getBytes()));
    }

    /** Student views their own applications */
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Application>> myApplications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getUserApplications(userDetails.getUsername()));
    }

    /** Recruiter views applications for a specific job */
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<List<Application>> jobApplications(@PathVariable String jobId) {
        return ResponseEntity.ok(applicationService.getJobApplications(jobId));
    }

    /** Recruiter updates status: VIEWED, SHORTLISTED, REJECTED */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Application> updateStatus(@PathVariable String id,
                                                     @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(applicationService.updateStatus(id, body.get("status")));
    }

    /**
     * Simple apply-job endpoint.
     * Accepts: { "userId": "...", "jobId": "...", "email": "..." }
     * Saves application with status "Applied" + timestamp, then sends confirmation email.
     */
    @PostMapping("/apply-job")
    public ResponseEntity<Application> applyJob(
            @jakarta.validation.Valid @RequestBody com.skillmatch.dto.ApplyJobRequest request) {
        return ResponseEntity.ok(
                applicationService.applyJob(request.getUserId(), request.getJobId(), request.getEmail()));
    }
}
