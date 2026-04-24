package com.skillmatch.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
      try {  
          String base64Credent  ystem.getenv("FIREBASE_CREDENTIALS_BASE64");

            if (base64Credentials == null || base64Credentials.isEmp
 * 
 * y()) {
                System.out.println("⚠️ Firebase credentials not found. Skipping Firebase initialization.");
                return; // DO NOT CRASH APP
            }

            byte[] decoded = Base64.getDecoder().decode(base64Credentials);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(new ByteArrayInputStream(decoded)))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase initialized successfully");
            }

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("❌ Firebase initialization failed");
        }
    }
}