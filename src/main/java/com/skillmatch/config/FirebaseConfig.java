package com.skillmatch.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Initializes the Firebase Admin SDK once at startup.
 *
 * Two credential modes (configure via application.properties):
 *
 *  1. File path  → firebase.credentials.path=/path/to/serviceAccountKey.json
 *  2. Classpath  → firebase.credentials.classpath=true
 *                  (place serviceAccountKey.json inside src/main/resources/)
 *
 * If neither is set, the SDK falls back to Google Application Default Credentials
 * (works automatically on GCP / Cloud Run / Firebase Functions).
 */
@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.credentials.path:}")
    private String credentialsFilePath;

    @Value("${firebase.credentials.classpath:false}")
    private boolean useClasspath;

    @PostConstruct
    public void initialize() {
        // Only initialize once (safe for hot-reload dev environments)
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        try {
            GoogleCredentials credentials = resolveCredentials();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("✅ Firebase Admin SDK initialized successfully.");

        } catch (IOException e) {
            log.error("❌ Failed to initialize Firebase Admin SDK. " +
                      "Set 'firebase.credentials.path' in application.properties. " +
                      "Error: {}", e.getMessage());
            // Don't throw – allow app to start; only Google login will fail
        }
    }

    private GoogleCredentials resolveCredentials() throws IOException {
        // 0. Support Base64 encoded JSON (100% immune to Render newline stripping)
        String base64Credentials = System.getenv("FIREBASE_CREDENTIALS_BASE64");
        if (base64Credentials != null && !base64Credentials.isBlank()) {
            log.info("🔑 Loading Firebase credentials from FIREBASE_CREDENTIALS_BASE64...");
            try {
                byte[] decodedBytes = java.util.Base64.getDecoder().decode(base64Credentials);
                try (java.io.InputStream stream = new java.io.ByteArrayInputStream(decodedBytes)) {
                    return GoogleCredentials.fromStream(stream);
                }
            } catch (Exception e) {
                log.error("❌ Failed to parse Base64 credentials: {}", e.getMessage());
                throw new IOException("Invalid Base64 Firebase Credentials", e);
            }
        }

        // 1. Literal JSON string from environment variable
        String jsonCredentials = System.getenv("FIREBASE_CREDENTIALS_JSON");
        if (jsonCredentials != null && !jsonCredentials.isBlank()) {
            log.info("🔑 Loading Firebase credentials from FIREBASE_CREDENTIALS_JSON environment variable.");
            try (java.io.InputStream stream = new java.io.ByteArrayInputStream(jsonCredentials.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
                return GoogleCredentials.fromStream(stream);
            }
        }

        // 2. Explicit file path on disk
        if (credentialsFilePath != null && !credentialsFilePath.isBlank()) {
            log.info("🔑 Loading Firebase credentials from file: {}", credentialsFilePath);
            try (FileInputStream fis = new FileInputStream(credentialsFilePath)) {
                return GoogleCredentials.fromStream(fis);
            }
        }

        // 2. Classpath resource (src/main/resources/serviceAccountKey.json)
        if (useClasspath) {
            log.info("🔑 Loading Firebase credentials from classpath.");
            InputStream stream = getClass().getClassLoader()
                    .getResourceAsStream("serviceAccountKey.json");
            if (stream == null) {
                throw new IOException("serviceAccountKey.json not found in classpath.");
            }
            return GoogleCredentials.fromStream(stream);
        }

        // 3. Application Default Credentials (GCP / Cloud Run / local gcloud auth)
        log.info("🔑 Using Google Application Default Credentials for Firebase.");
        return GoogleCredentials.getApplicationDefault();
    }
}
