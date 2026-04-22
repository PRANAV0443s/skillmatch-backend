"""
resume_parser.py – Extract tech skills from a PDF resume using PyPDF2 + spaCy.
"""

import io
import re
import spacy
import PyPDF2

# ---------------------------------------------------------------------------
# Curated vocabulary of tech skills to match against resume text
# ---------------------------------------------------------------------------
TECH_SKILLS_VOCAB = {
    # Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "kotlin", "swift", "ruby", "php", "scala", "r", "matlab", "bash", "shell",
    "perl", "haskell", "elixir",

    # Web / Frontend
    "react", "reactjs", "angular", "vue", "vuejs", "html", "css", "sass",
    "tailwind", "bootstrap", "next.js", "nextjs", "nuxt", "svelte", "jquery",
    "webpack", "vite", "redux", "graphql",

    # Backend / Frameworks
    "node.js", "nodejs", "express", "django", "flask", "fastapi", "spring",
    "spring boot", "springboot", "rails", "laravel", "asp.net", "dotnet",
    "hibernate", "mybatis",

    # Databases
    "mongodb", "mysql", "postgresql", "postgres", "sqlite", "redis", "cassandra",
    "dynamodb", "elasticsearch", "oracle", "mssql", "firebase", "supabase",

    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "github actions", "circleci", "gitlab ci",
    "nginx", "apache", "linux", "ubuntu",

    # AI / ML / Data
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
    "scikit-learn", "sklearn", "pandas", "numpy", "matplotlib", "seaborn",
    "nlp", "computer vision", "opencv", "huggingface", "transformers",
    "data science", "data analysis", "tableau", "power bi",

    # Mobile
    "android", "ios", "react native", "flutter", "dart", "xcode",

    # Tools & Platforms
    "git", "github", "gitlab", "jira", "confluence", "postman", "swagger",
    "figma", "rest api", "microservices", "agile", "scrum", "ci/cd",
    "kafka", "rabbitmq", "grpc", "graphql", "websockets",

    # Security
    "jwt", "oauth", "cybersecurity", "penetration testing", "ssl", "tls",

    # Cloud Storage / Other
    "s3", "cloudinary", "stripe", "twilio",
}

# ---------------------------------------------------------------------------
# Load spaCy model (small English model)
# ---------------------------------------------------------------------------
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    raise RuntimeError(
        "spaCy model not found. Run: python -m spacy download en_core_web_sm"
    )


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract raw text from PDF bytes using PyPDF2."""
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text
    except Exception as e:
        raise RuntimeError(f"Failed to read PDF: {e}")


def extract_skills_from_pdf(pdf_bytes: bytes) -> list[str]:
    """
    Full pipeline: PDF → text → spaCy → skill matching.
    Returns a deduplicated, sorted list of matched skills.
    """
    raw_text = extract_text_from_pdf(pdf_bytes)
    return extract_skills_from_text(raw_text)


def extract_skills_from_text(text: str) -> list[str]:
    """Match raw text against the TECH_SKILLS_VOCAB set."""
    text_lower = text.lower()

    # Remove punctuation noise but keep hyphens and dots (for node.js, c++, etc.)
    text_clean = re.sub(r"[^\w\s.\-+#/]", " ", text_lower)

    doc = nlp(text_clean)

    found_skills = set()

    # 1. Check single tokens
    for token in doc:
        word = token.text.strip()
        if word in TECH_SKILLS_VOCAB:
            found_skills.add(word)

    # 2. Check bigrams and trigrams (noun chunks + sliding window)
    tokens = [t.text.strip() for t in doc if not t.is_space]
    for i in range(len(tokens) - 1):
        bigram = f"{tokens[i]} {tokens[i+1]}"
        if bigram in TECH_SKILLS_VOCAB:
            found_skills.add(bigram)

    for i in range(len(tokens) - 2):
        trigram = f"{tokens[i]} {tokens[i+1]} {tokens[i+2]}"
        if trigram in TECH_SKILLS_VOCAB:
            found_skills.add(trigram)

    # 3. Direct substring match for edge cases (react native, spring boot, etc.)
    for skill in TECH_SKILLS_VOCAB:
        if skill in text_clean and skill not in found_skills:
            # Ensure it's a whole-word match
            pattern = r"\b" + re.escape(skill) + r"\b"
            if re.search(pattern, text_clean):
                found_skills.add(skill)

    return sorted(found_skills)
