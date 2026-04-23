package com.skillmatch.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;

/**
 * Initializes the Firebase Admin SDK once at startup.
 *
 * Credential resolution order:
 *  1. FIREBASE_CREDENTIALS_BASE64  – Base64-encoded JSON (preferred for Render)
 *  2. FIREBASE_CREDENTIALS_JSON    – Raw JSON string
 *
 * If neither is set the app still STARTS; only Google login will be unavailable.
 */
@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        try {
            GoogleCredentials credentials = resolveCredentials();
            if (credentials == null) {
                System.err.println("❌ CRITICAL: No Firebase credentials found. Google OAuth will fail.");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("✅ Firebase Admin SDK initialized successfully.");

        } catch (Exception e) {
            System.err.println("❌ Firebase initialization failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private GoogleCredentials resolveCredentials() throws IOException {
        // Priority 1: Base64-encoded JSON (Render)
        String base64 = System.getenv("FIREBASE_CREDENTIALS_BASE64");
        if (base64 != null && !base64.isBlank()) {
            System.out.println("ℹ️ Attempting to load Firebase credentials from FIREBASE_CREDENTIALS_BASE64");
            try {
                byte[] decoded = Base64.getDecoder().decode(base64.trim());
                return GoogleCredentials.fromStream(new ByteArrayInputStream(decoded));
            } catch (Exception e) {
                System.err.println("❌ Failed to decode FIREBASE_CREDENTIALS_BASE64: " + e.getMessage());
            }
        }

        // Priority 2: Raw JSON string
        String rawJson = System.getenv("FIREBASE_CREDENTIALS_JSON");
        if (rawJson != null && !rawJson.isBlank()) {
            System.out.println("ℹ️ Attempting to load Firebase credentials from FIREBASE_CREDENTIALS_JSON");
            try {
                return GoogleCredentials.fromStream(new ByteArrayInputStream(rawJson.getBytes()));
            } catch (Exception e) {
                System.err.println("❌ Failed to parse FIREBASE_CREDENTIALS_JSON: " + e.getMessage());
            }
        }

        System.err.println("⚠️ No Firebase credentials found in environment variables.");
        return null;
    }
}
