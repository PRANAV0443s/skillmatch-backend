"""
SkillMatch AI Microservice – Flask Entry Point
Endpoints:
  POST /analyze  – extract skills from resume PDF + compute match score
  GET  /health   – liveness probe
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from resume_parser import extract_skills_from_pdf
from skill_matcher import compute_match_score

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "SkillMatch AI"}), 200


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Accepts:
      - resume (file): PDF resume
      - skills (str): comma-separated list of required job skills

    Returns:
      {
        "extractedSkills": [...],
        "requiredSkills":  [...],
        "matchScore":      0-100
      }
    """
    if "resume" not in request.files:
        return jsonify({"error": "No resume file provided"}), 400

    resume_file = request.files["resume"]
    required_skills_raw = request.form.get("skills", "")

    required_skills = [s.strip().lower() for s in required_skills_raw.split(",") if s.strip()]

    try:
        pdf_bytes = resume_file.read()
        extracted_skills = extract_skills_from_pdf(pdf_bytes)
        match_score = compute_match_score(extracted_skills, required_skills)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "extractedSkills": extracted_skills,
        "requiredSkills": required_skills,
        "matchScore": match_score
    }), 200


@app.route("/skills-only", methods=["POST"])
def skills_only():
    """Extract skills from a resume without matching against job skills."""
    if "resume" not in request.files:
        return jsonify({"error": "No resume file provided"}), 400

    try:
        pdf_bytes = request.files["resume"].read()
        extracted_skills = extract_skills_from_pdf(pdf_bytes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"extractedSkills": extracted_skills}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "production") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
