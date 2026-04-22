"""
skill_matcher.py – Compute a match score (0–100) between extracted resume skills
and the required skills for a job listing.

Scoring formula:
  - Jaccard similarity (intersection / union) as the base score
  - Bonus for high required-skill coverage (penalises missing must-have skills)
  - Final score clamped to 0–100 integer
"""


def compute_match_score(extracted_skills: list[str], required_skills: list[str]) -> int:
    """
    Args:
        extracted_skills: Skills found in the candidate's resume.
        required_skills:  Skills required by the job posting.

    Returns:
        Integer match score in the range [0, 100].
    """
    if not required_skills:
        # No requirements → perfect match by default
        return 100

    if not extracted_skills:
        return 0

    extracted_set = set(s.lower().strip() for s in extracted_skills)
    required_set  = set(s.lower().strip() for s in required_skills)

    intersection = extracted_set & required_set
    union        = extracted_set | required_set

    # Base: Jaccard similarity
    jaccard = len(intersection) / len(union) if union else 0.0

    # Coverage: what fraction of required skills does the candidate have?
    coverage = len(intersection) / len(required_set) if required_set else 0.0

    # Weighted blend: 40 % Jaccard + 60 % coverage (required-skill coverage matters more)
    blended = 0.4 * jaccard + 0.6 * coverage

    score = round(blended * 100)
    return max(0, min(100, score))


def get_missing_skills(extracted_skills: list[str], required_skills: list[str]) -> list[str]:
    """Return the list of required skills the candidate is missing."""
    extracted_set = set(s.lower().strip() for s in extracted_skills)
    required_set  = set(s.lower().strip() for s in required_skills)
    return sorted(required_set - extracted_set)


def get_matching_skills(extracted_skills: list[str], required_skills: list[str]) -> list[str]:
    """Return the list of required skills that match the candidate's resume."""
    extracted_set = set(s.lower().strip() for s in extracted_skills)
    required_set  = set(s.lower().strip() for s in required_skills)
    return sorted(extracted_set & required_set)
