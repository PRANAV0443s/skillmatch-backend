package com.skillmatch.service;

import com.skillmatch.model.Application;
import com.skillmatch.model.Job;
import com.skillmatch.model.User;
import com.skillmatch.repository.ApplicationRepository;
import com.skillmatch.repository.JobRepository;
import com.skillmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final AiService aiService;
    private final EmailService emailService;

    public Application apply(String jobId, String userEmail, byte[] resumeBytes) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Check duplicate
        if (applicationRepository.findByUserIdAndJobId(user.getId(), jobId).isPresent()) {
            throw new RuntimeException("Already applied to this job");
        }

        // Call Flask AI for match score
        int matchScore = aiService.computeMatchScore(resumeBytes, job.getRequiredSkills());

        Application application = Application.builder()
                .userId(user.getId())
                .jobId(jobId)
                .resumeUrl(user.getResumeUrl())
                .matchScore(matchScore)
                .status("APPLIED")
                .build();

        Application saved = applicationRepository.save(application);

        // Send confirmation email to the applicant
        try {
            emailService.sendApplicationConfirmation(
                    user.getEmail(),
                    user.getName(),
                    job.getTitle(),
                    job.getCompany(),
                    job.getLocation(),
                    matchScore
            );
        } catch (Exception e) {
            log.error("Failed to send application confirmation email: {}", e.getMessage());
        }

        return saved;
    }

    /**
     * Simple apply-job endpoint: accepts userId, jobId, and email.
     * Saves application with status "Applied" and sends a confirmation email.
     * If email fails, the application is still saved.
     */
    public Application applyJob(String userId, String jobId, String email) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Validate job exists
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        // Check duplicate application
        if (applicationRepository.findByUserIdAndJobId(userId, jobId).isPresent()) {
            throw new RuntimeException("You have already applied to this job");
        }

        // Save application data in MongoDB "applications" collection
        Application application = Application.builder()
                .userId(userId)
                .jobId(jobId)
                .status("Applied")
                .build();   // appliedAt is auto-set via @Builder.Default

        Application saved = applicationRepository.save(application);
        log.info("✔ Application saved – userId: {}, jobId: {}, status: Applied", userId, jobId);

        // Send confirmation email (errors are caught so the application stays saved)
        try {
            emailService.sendJobApplicationEmail(email, user.getName(), job.getTitle(), job.getCompany());
            log.info("✔ Confirmation email sent to {}", email);
        } catch (Exception e) {
            log.error("✘ Failed to send confirmation email to {}: {}", email, e.getMessage());
            // Application is already saved – do NOT re-throw
        }

        return saved;
    }

    public List<Application> getUserApplications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.findByUserId(user.getId());
    }

    public List<Application> getJobApplications(String jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public Application updateStatus(String applicationId, String status) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(status.toUpperCase());
        Application saved = applicationRepository.save(app);

        // Send status update email to the applicant
        try {
            User user = userRepository.findById(app.getUserId()).orElse(null);
            Job job = jobRepository.findById(app.getJobId()).orElse(null);
            if (user != null && job != null) {
                emailService.sendStatusUpdateEmail(
                        user.getEmail(),
                        user.getName(),
                        job.getTitle(),
                        job.getCompany(),
                        status.toUpperCase()
                );
            }
        } catch (Exception e) {
            log.error("Failed to send status update email: {}", e.getMessage());
        }

        return saved;
    }
}
