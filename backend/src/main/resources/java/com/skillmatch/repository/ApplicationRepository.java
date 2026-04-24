package com.skillmatch.repository;

import com.skillmatch.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends MongoRepository<Application, String> {
    List<Application> findByUserId(String userId);
    List<Application> findByJobId(String jobId);
    Optional<Application> findByUserIdAndJobId(String userId, String jobId);
    long countByStatus(String status);
}
