# SkillMatch – Cloud-Based Job Portal with Resume Analyzer

A full-stack job portal with AI-powered resume analysis, matching candidates to jobs based on skill extraction.

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Java Spring Boot 3 + JWT |
| AI Service | Python Flask + spaCy + PyPDF2 |
| Database | MongoDB Atlas |
| File Storage | Cloudinary |

## Project Structure
```
skillmatch/
├── backend/        ← Spring Boot REST API (port 8080)
├── ai-service/     ← Python Flask microservice (port 5000)
└── frontend/       ← React + Vite app (port 5173)
```

## Quick Start

### Prerequisites
- Java 17+, Maven 3.8+
- Python 3.10+, pip
- Node.js 18+, npm
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)

### 1. Backend (Spring Boot)
```bash
cd backend
# Copy and fill in your credentials
cp src/main/resources/application.example.properties src/main/resources/application.properties
mvn spring-boot:run
```

### 2. AI Service (Python Flask)
```bash
cd ai-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cp .env.example .env   # fill in your values
python app.py
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### backend/src/main/resources/application.properties
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/skillmatch
JWT_SECRET=your-256-bit-secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
FLASK_SERVICE_URL=http://localhost:5000
```

### ai-service/.env
```
FLASK_ENV=development
PORT=5000
```

## Default Roles
| Role | Can Do |
|---|---|
| student | Browse jobs, upload resume, apply |
| recruiter | Post jobs, view applications, update status |
| admin | Full dashboard access |

## API Endpoints (Spring Boot :8080)
| Method | Path | Role |
|---|---|---|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| GET | /api/jobs | authenticated |
| POST | /api/jobs | recruiter |
| POST | /api/applications/apply/:jobId | student |
| GET | /api/applications/my | student |
| PUT | /api/applications/:id/status | recruiter |
| GET | /api/admin/stats | admin |

## AI Service Endpoints (Flask :5000)
| Method | Path | Description |
|---|---|---|
| POST | /analyze | Extract skills + return match score |
| GET | /health | Liveness check |
