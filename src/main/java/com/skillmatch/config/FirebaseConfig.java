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
        // Skip if already initialized (hot-reload / duplicate context safety)
        if (!FirebaseApp.getApps().isEmpty()) {
            System.out.println("✅ Firebase already initialized – skipping.");
            return;
        }

        try {
            GoogleCredentials credentials = resolveCredentials();
            if (credentials == null) {
                System.err.println("⚠️  No Firebase credentials found. Google Sign-In will be unavailable.");
                return; // Graceful – do NOT crash the server
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("🔥 Firebase Admin SDK initialized successfully.");

        } catch (Exception e) {
            // Log the full stack trace so it appears in Render logs
            System.err.println("❌ Firebase initialization failed: " + e.getMessage());
            e.printStackTrace();
            // DO NOT re-throw – allow the app to start without Firebase
        }
    }

    private GoogleCredentials resolveCredentials() throws IOException {

        // ── Priority 1: Base64-encoded JSON ──────────────────────────────────
        String base64 = System.getenv("FIREBASE_CREDENTIALS_BASE64");
        if (base64 != null && !base64.isBlank()) {
            System.out.println("🔑 Loading credentials from FIREBASE_CREDENTIALS_BASE64...");
            try {
                byte[] decoded = Base64.getDecoder().decode(base64.trim());
                return GoogleCredentials.fromStream(new ByteArrayInputStream(decoded));
            } catch (IllegalArgumentException e) {
                System.err.println("❌ FIREBASE_CREDENTIALS_BASE64 is not valid Base64: " + e.getMessage());
                // Fall through to next option
            }
        }

        // ── Priority 2: Raw JSON string ───────────────────────────────────────
        String rawJson = System.getenv("FIREBASE_CREDENTIALS_JSON");
        if (rawJson != null && !rawJson.isBlank()) {
            System.out.println("🔑 Loading credentials from FIREBASE_CREDENTIALS_JSON...");
            try {
                byte[] jsonBytes = rawJson.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                return GoogleCredentials.fromStream(new ByteArrayInputStream(jsonBytes));
            } catch (IOException e) {
                System.err.println("❌ FIREBASE_CREDENTIALS_JSON parsing failed: " + e.getMessage());
            }
        }

        // ── No credentials found ──────────────────────────────────────────────
        System.err.println("⚠️  Neither FIREBASE_CREDENTIALS_BASE64 nor FIREBASE_CREDENTIALS_JSON is set.");
        return null;
    }
}
