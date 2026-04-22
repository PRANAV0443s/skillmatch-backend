package com.skillmatch.repository;

import com.skillmatch.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findByRecruiterId(String recruiterId);
    List<Job> findByRequiredSkillsIn(List<String> skills);
}
