package com.skillmatch.service;

import com.skillmatch.dto.JobRequest;
import com.skillmatch.model.Job;
import com.skillmatch.model.User;
import com.skillmatch.repository.JobRepository;
import com.skillmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public Job createJob(JobRequest request, String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills())
                .company(request.getCompany())
                .location(request.getLocation())
                .recruiterId(recruiter.getId())
                .build();

        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Job getJobById(String id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public List<Job> getJobsByRecruiter(String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
        return jobRepository.findByRecruiterId(recruiter.getId());
    }

    public Job updateJob(String id, JobRequest request, String recruiterEmail) {
        Job job = getJobById(id);
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        if (!job.getRecruiterId().equals(recruiter.getId())) {
            throw new RuntimeException("Not authorized to update this job");
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequiredSkills(request.getRequiredSkills());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());

        return jobRepository.save(job);
    }

    public void deleteJob(String id, String recruiterEmail) {
        Job job = getJobById(id);
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        if (!job.getRecruiterId().equals(recruiter.getId())) {
            throw new RuntimeException("Not authorized to delete this job");
        }

        jobRepository.delete(job);
    }

    public List<Job> getRecommendedJobs(List<String> userSkills) {
        return jobRepository.findByRequiredSkillsIn(userSkills);
    }
}
