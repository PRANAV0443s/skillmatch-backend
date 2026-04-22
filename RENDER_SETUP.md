# SkillMatch Backend Deployment Guide (Render)

Because you have two separate backend services (Java Spring Boot and Python AI Service), I have created a **Render Blueprint** (`render.yaml`) that will automatically build and deploy both of them together on Render's free tier.

By using Docker under the hood, we guarantee that both environments install perfectly. Better yet, the Java backend will talk directly to the Python AI service using Render's ultra-fast internal network.

---

### Step 1: Push your Code to GitHub
Ensure you have committed and pushed the new Dockerfiles and `render.yaml` to your GitHub repository.

```bash
git add .
git commit -m "Add Docker and Render configurations"
git push origin <your-branch-name>
```

---

### Step 2: Deploy to Render via Blueprint
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click the **New +** button at the top right, and select **Blueprint**.
3. Connect your GitHub account (if you haven't already).
4. Select your `SkillMatch` repository.
5. Render will automatically read the `render.yaml` and show two services: `skillmatch-backend` and `skillmatch-ai-service`.
6. Click **Apply**.

---

### Step 3: Provide Environment Variables
Render will pause the deployment and prompt you to enter the missing environment variables that are marked as `sync: false`. 
Fill them in:

- `spring.data.mongodb.uri`: Complete URI to your MongoDB Atlas cluster.
- `cloudinary.cloud-name` / `api-key` / `api-secret`: From your Cloudinary console.
- `spring.mail.username` / `password`: Your Gmail credentials for OTPs.

---

### Step 4: Add the Firebase Secret File
Your Spring Boot app relies on the `serviceAccountKey.json` from Firebase. **NEVER** upload this file to GitHub. Instead, Render allows you to inject it securely.

1. Once the `skillmatch-backend` service is created in Render, click on it in your dashboard.
2. Go to the **Environment** tab on the left sidebar.
3. Scroll down to **Secret Files** and click **Add Secret File**.
4. Filename: `serviceAccountKey.json`
5. Value: Open your `serviceAccountKey.json` file in a text editor (like VS Code or Notepad), copy everything, and paste it into this box.
6. Click **Save Changes**. This will trigger a slightly faster redeploy.

---

### Step 5: Connect Frontend to Render!

Once your `skillmatch-backend` finishes deploying, Render will give you a live URL (e.g., `https://skillmatch-backend-xxxx.onrender.com`).

1. Open `frontend/.env` on your local computer.
2. Add the URL like this:
   ```env
   VITE_API_BASE_URL=https://skillmatch-backend-xxxx.onrender.com/api
   ```
3. Run:
   ```bash
   cd frontend
   npm run build
   firebase deploy --only hosting
   ```

Your entire stack (Frontend, Java Backend, Python AI Backend, MongoDB Database) is now live on the public internet! 🚀
