package com.skillmatch.service;

import com.skillmatch.repository.ApplicationRepository;
import com.skillmatch.repository.JobRepository;
import com.skillmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public Map<String, Object> getStats() {
        long totalUsers     = userRepository.count();
        long totalJobs      = jobRepository.count();
        long totalApps      = applicationRepository.count();
        long shortlisted    = applicationRepository.countByStatus("SHORTLISTED");
        long applied        = applicationRepository.countByStatus("APPLIED");
        long rejected       = applicationRepository.countByStatus("REJECTED");

        return Map.of(
                "totalUsers",       totalUsers,
                "totalJobs",        totalJobs,
                "totalApplications",totalApps,
                "shortlisted",      shortlisted,
                "applied",          applied,
                "rejected",         rejected
        );
    }

    public Object getAllUsers()        { return userRepository.findAll(); }
    public Object getAllJobs()         { return jobRepository.findAll(); }
    public Object getAllApplications() { return applicationRepository.findAll(); }
}
