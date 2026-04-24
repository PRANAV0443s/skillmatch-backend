package com.skillmatch.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.skillmatch.model.User;
import com.skillmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final Cloudinary cloudinary;
    private final AiService aiService;

    @org.springframework.beans.factory.annotation.Value("${cloudinary.cloud-name:default}")
    private String cloudName;

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public String uploadResume(MultipartFile file, String email) throws IOException {
        String resumeUrl;
        String fileName = email.replace("@", "_at_").replace(".", "_") + "_" + file.getOriginalFilename();

        if ("default".equals(cloudName) || "YOUR_CLOUD_NAME".equals(cloudName)) {
            // Local Storage Fallback
            java.nio.file.Path uploadsDir = java.nio.file.Paths.get("backend/uploads");
            java.nio.file.Files.createDirectories(uploadsDir);
            java.nio.file.Path path = uploadsDir.resolve(fileName);
            java.nio.file.Files.write(path, file.getBytes());
            resumeUrl = "http://localhost:8080/uploads/" + fileName;
        } else {
            // Cloudinary Upload
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "folder", "skillmatch/resumes",
                            "public_id", fileName
                    )
            );
            resumeUrl = (String) uploadResult.get("secure_url");
        }

        User user = getByEmail(email);
        user.setResumeUrl(resumeUrl);
        
        // Extract and set skills
        try {
            List<String> extractedSkills = aiService.extractSkills(file.getBytes());
            if (extractedSkills != null && !extractedSkills.isEmpty()) {
                user.setSkills(extractedSkills);
                log.info("Successfully extracted {} skills for user: {}", extractedSkills.size(), email);
            } else {
                log.warn("No skills extracted for user: {}", email);
            }
        } catch (Exception e) {
            log.error("Critical error during skill extraction for user: {}. Error: {}", email, e.getMessage());
        }
        
        userRepository.save(user);

        return resumeUrl;
    }

    public User updateSkills(String email, List<String> skills) {
        User user = getByEmail(email);
        user.setSkills(skills);
        return userRepository.save(user);
    }
}
