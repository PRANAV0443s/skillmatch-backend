package com.skillmatch.controller;

import com.skillmatch.model.Job;
import com.skillmatch.model.User;
import com.skillmatch.service.JobService;
import com.skillmatch.service.UserService;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JobService jobService;

    @GetMapping("/me")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername());
        user.setPassword(null); // never return password
        return ResponseEntity.ok(user);
    }

    @PostMapping("/upload-resume")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<User> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws Exception {
        userService.uploadResume(file, userDetails.getUsername());
        User user = userService.getByEmail(userDetails.getUsername());
        user.setPassword(null); // security
        return ResponseEntity.ok(user);
    }

    @GetMapping("/recommended-jobs")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Job>> getRecommendedJobs(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(jobService.getRecommendedJobs(user.getSkills()));
    }
}
