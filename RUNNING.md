# SkillMatch - Run Guide

Follow these steps to run the complete project locally.

## 1. Prerequisites
- **Java 17** (Run `java -version`)
- **Node.js** (Run `node -v`)
- **Python 3.11+** (Run `python -v`)
- **MongoDB** (Ensure local MongoDB is running on `localhost:27017`)

---

## 2. Start AI Service (Python/Flask)
The AI service handles resume parsing and skill matching.

```bash
cd ai-service
# (Recommended) Create a virtual environment
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
*Port: 5000*

---

## 3. Start Backend (Java/Spring Boot)
The backend manages APIs, users, and jobs.

1. Open `backend/src/main/resources/application.properties`.
2. Ensure `spring.data.mongodb.uri` is correct.
3. (Optional) Add your Cloudinary credentials for resume uploads.
4. Run:
```bash
cd backend
mvn spring-boot:run
```
*Port: 8080*

---

## 4. Start Frontend (React/Vite)
The user interface.

```bash
cd frontend
npm install
npm run dev
```
*Port: 5173*

---

## Access the App
Open your browser and navigate to: **http://localhost:5173**

---

## Troubleshooting
- **Database Error**: Ensure MongoDB is running locally. If using Atlas, update the URI in `application.properties`.
- **AI Service Error**: Ensure the Flask server is running on port 5000.
- **Upload Error**: Ensure Cloudinary credentials are provided in `application.properties`.
