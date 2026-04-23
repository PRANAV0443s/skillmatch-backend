package com.skillmatch.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class AiService {

    @Value("${flask.service.url:http://localhost:5000}")
    private String flaskServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public List<String> extractSkills(byte[] resumeBytes) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("resume", new ByteArrayResource(resumeBytes) {
                @Override
                public String getFilename() { return "resume.pdf"; }
            });

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    flaskServiceUrl + "/skills-only", request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<String> list = (List<String>) response.getBody().get("extractedSkills");
                return list != null ? list : Collections.emptyList();
            }
        } catch (Exception e) {
            log.warn("AI service unreachable or failed during skill extraction: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    public int computeMatchScore(byte[] resumeBytes, List<String> requiredSkills) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("resume", new ByteArrayResource(resumeBytes) {
                @Override
                public String getFilename() { return "resume.pdf"; }
            });
            body.add("skills", String.join(",", requiredSkills));

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    flaskServiceUrl + "/analyze", request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Number score = (Number) response.getBody().get("matchScore");
                return score != null ? score.intValue() : 0;
            }
        } catch (Exception e) {
            log.warn("AI service unreachable or failed during match scoring: {}", e.getMessage());
        }
        return 0;
    }
}
