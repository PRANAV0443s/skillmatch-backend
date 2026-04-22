# SkillMatch Firebase Setup Guide

This project uses Firebase Authentication for secure Google Sign-In and Email/Password login. Because Firebase handles all OAuth internally, you won't encounter the dreaded `invalid_client` or `redirect_uri` mismatches.

Follow these steps to set up your own Firebase project and run the app.

---

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it `SkillMatch`.
3. (Optional) Disable Google Analytics for this project.
4. Click **Create Project**.

---

## 2. Enable Authentication
1. In the sidebar, click **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Add new provider**:
   - **Google**: Enable it, choose a project support email, and save.
   - **Email/Password**: Enable the first toggle (Email/Password) and save.

---

## 3. Register the Web App (Frontend Config)
1. Go to **Project Settings** (the gear icon top-left) > **General**.
2. Scroll down to "Your apps" and click the **Web `</>`** icon.
3. Name the app `SkillMatch Web` and click **Register app**.
4. You will see a `firebaseConfig` object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "skillmatch-123.firebaseapp.com",
     projectId: "skillmatch-123",
     storageBucket: "skillmatch-123.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234..."
   };
   ```
5. Copy `frontend/.env.example` to `frontend/.env` and paste these exact values:
   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=skillmatch...
   VITE_FIREBASE_PROJECT_ID=skillmatch...
   VITE_FIREBASE_STORAGE_BUCKET=skillmatch...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

---

## 4. Get the Service Account JSON (Backend Config)
The Spring Boot backend needs this file to securely verify Google logins.
1. Go to **Project Settings** > **Service accounts**.
2. Ensure "Firebase Admin SDK" is selected.
3. Click **Generate new private key**.
4. Save the downloaded `.json` file to `backend/src/main/resources/serviceAccountKey.json`.
5. In `backend/src/main/resources/application.properties`, set:
   ```properties
   firebase.credentials.classpath=true
   # OR use an absolute path:
   # firebase.credentials.path=C:/Users/YourName/Downloads/skillmatch-xyz-firebase-adminsdk.json
   ```

---

## 5. Deployment (Optional)
To deploy the frontend to Firebase Hosting for free:
1. Build the React app:
   ```bash
   cd frontend
   npm run build
   ```
2. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
3. Login and deploy:
   ```bash
   cd .. # Back to project root
   firebase login
   firebase use --add YOUR_PROJECT_ID
   firebase deploy --only hosting
   ```
