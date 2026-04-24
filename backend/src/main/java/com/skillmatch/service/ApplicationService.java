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

    public Application apply(String jobId, String userEmail, byte[] resumeBytes) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (applicationRepository.findByUserIdAndJobId(user.getId(), jobId).isPresent()) {
            throw new RuntimeException("Already applied to this job");
        }

        int matchScore = aiService.computeMatchScore(resumeBytes, job.getRequiredSkills());

        Application application = Application.builder()
                .userId(user.getId())
                .jobId(jobId)
                .resumeUrl(user.getResumeUrl())
                .matchScore(matchScore)
                .status("APPLIED")
                .build();

        return applicationRepository.save(application);
    }

    public Application applyJob(String userId, String jobId, String email) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        if (applicationRepository.findByUserIdAndJobId(userId, jobId).isPresent()) {
            throw new RuntimeException("You have already applied to this job");
        }

        Application application = Application.builder()
                .userId(userId)
                .jobId(jobId)
                .status("Applied")
                .build();

        Application saved = applicationRepository.save(application);
        log.info("✔ Application saved – userId: {}, jobId: {}, status: Applied", userId, jobId);

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
        return applicationRepository.save(app);
    }
}
