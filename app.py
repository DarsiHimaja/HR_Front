from fastapi import FastAPI, HTTPException, Depends, Query, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from typing import Optional, List, Dict, Any
from fastapi.responses import StreamingResponse

import io

SELECTED: Dict[str, List[Dict[str, Any]]] = {}
REJECTED: Dict[str, List[Dict[str, Any]]] = {}
MEETINGS: Dict[str, List[Dict[str, Any]]] = {}
TIE_TESTS: Dict[str, Dict[str, str]] = {}

app = FastAPI()

# ---------------- CORS ----------------
origins = [
    "https://hr-front2.vercel.app",  # Vercel frontend     
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for all (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*","Authorization"],
)
# -------------------------
# Mock Storage
# -------------------------
USERS: Dict[str, Dict[str, Any]] = {}
POSTS: Dict[str, List[Dict[str, Any]]] = {}
PAST_POSTS: Dict[str, List[Dict[str, Any]]] = {}
APPLICANTS: Dict[str, List[Dict[str, Any]]] = {}
SELECTED: Dict[str, List[Dict[str, Any]]] = {}
REJECTED: Dict[str, List[Dict[str, Any]]] = {}
NOTIFICATIONS: Dict[str, List[Dict[str, Any]]] = {}
# ---------------- Models ----------------
class HRLoginRequest(BaseModel):
    email: str
    password: str

class HRRegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    department_id: str

class SelectBody(BaseModel):
    applicant_id: str

class ScheduleBody(BaseModel):
    applicant_id: str
    datetime_iso: str
    note: Optional[str] = None

# ---------------- Dummy HR USERS ----------------
HR_USERS = {}
SEED_HR_USERS = [
    {"email": "it.hr@example.com", "password": "it12345", "name": "IT HR Manager", "department_id": "it_software"},
    {"email": "bank.hr@example.com", "password": "bank12345", "name": "Banking HR Manager", "department_id": "banking_finance"},
    {"email": "fmcg.hr@example.com", "password": "fmcg12345", "name": "FMCG HR Manager", "department_id": "fmcg"},
    {"email": "oil.hr@example.com", "password": "oil12345", "name": "Oil & Gas HR Manager", "department_id": "oil_gas"},
    {"email": "mfg.hr@example.com", "password": "mfg12345", "name": "Manufacturing HR Manager", "department_id": "manufacturing"},
    {"email": "health.hr@example.com", "password": "health12345", "name": "Healthcare HR Manager", "department_id": "healthcare"},
    {"email": "retail.hr@example.com", "password": "retail12345", "name": "Retail HR Manager", "department_id": "retail"},
    {"email": "hospitality.hr@example.com", "password": "hosp12345", "name": "Hospitality HR Manager", "department_id": "hospitality"}
]
for u in SEED_HR_USERS:
    HR_USERS[u["email"]] = {
        "password": u["password"],
        "department_id": u["department_id"],
        "name": u["name"],
        "token": None
    }
# -------------------------
# Helpers
# -------------------------
def _notify(department_id: str, message: str):
    NOTIFICATIONS.setdefault(department_id, []).append({
        "id": str(uuid.uuid4()),
        "message": message
    })

def _move_post_to_past(post_id: str):
    for dept_id, dept_posts in POSTS.items():
        for p in dept_posts:
            if p["id"] == post_id:
                POSTS[dept_id] = [x for x in dept_posts if x["id"] != post_id]
                PAST_POSTS.setdefault(dept_id, []).append(p)
                _notify(dept_id, f"Internship '{p['title']}' moved to Past (all positions filled).")
                return p
    return None
# ---------------- Auth ----------------
@app.get("/")
def root():
    return {"message": "HR Backend is running"}

@app.post("/auth/login")
def hr_login(req: HRLoginRequest):
    user = HR_USERS.get(req.email)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = str(uuid.uuid4())
    user["token"] = token
    return {"access_token": token, "department_id": user["department_id"], "name": user["name"]}

@app.post("/auth/register")
def hr_register(req: HRRegisterRequest):
    if req.email in HR_USERS:
        raise HTTPException(status_code=400, detail="User already exists")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password too weak (min 6 chars)")
    HR_USERS[req.email] = {
        "password": req.password,
        "department_id": req.department_id,
        "name": req.name,
        "token": None,
    }
    return {"message": "Registered"}

def get_current_hr(request: Request, token: Optional[str] = Header(None), authorization: Optional[str] = Header(None)):
    bearer = None
    if authorization and authorization.lower().startswith("bearer "):
        bearer = authorization.split(" ", 1)[1].strip()
    active_token = token or bearer
    for email, u in HR_USERS.items():
        if u.get("token") == active_token:
            return {"email": email, **u}
    raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- Posts ----------------
SECTORS = {
    "it_software": "IT & Software",
    "banking_finance": "Banking & Finance",
    "fmcg": "FMCG",
    "oil_gas": "Oil & Gas",
    "manufacturing": "Manufacturing",
    "healthcare": "Healthcare",
    "retail": "Retail",
    "hospitality": "Hospitality",
}

POSTS = {
    "it_software": [
        {"id": "p1", "title": "React Internship", "description": "Build modern web UIs with React, work on component libraries, accessibility, performance optimizations, and collaborate with designers to deliver pixel-perfect experiences.", "stipend": "10k", "positions": 3, "positions_filled": 0, "applied": 0, "skills_required": ["react","javascript","css"], "location_preference": "Bengaluru", "sector": SECTORS["it_software"]},
        {"id": "p2", "title": "Backend Internship", "description": "Design and implement REST APIs with FastAPI, integrate databases, add tests and observability, and work on scalability and security best practices.", "stipend": "12k", "positions": 2, "positions_filled": 0, "applied": 0, "skills_required": ["python","fastapi","sql"], "location_preference": "Hyderabad", "sector": SECTORS["it_software"]}
    ],
    "banking_finance": [
        {"id": "p3", "title": "Finance Analyst Intern", "description": "Analyze financial data, build dashboards, support forecasting and risk analysis, and assist with compliance reporting.", "stipend": "15k", "positions": 4, "positions_filled": 0, "applied": 0, "skills_required": ["excel","finance","statistics"], "location_preference": "Mumbai", "sector": SECTORS["banking_finance"]}
    ],
    "fmcg": [
        {"id": "p4", "title": "Marketing Intern", "description": "Support brand campaigns, conduct consumer research, work on GTM and content for FMCG products across channels.", "stipend": "8k", "positions": 5, "positions_filled": 0, "applied": 0, "skills_required": ["marketing","communication","research"], "location_preference": "Delhi", "sector": SECTORS["fmcg"]}
    ],
    "oil_gas": [
        {"id": "p5", "title": "Petroleum Intern", "description": "Assist with field data collection, safety procedures documentation, and reporting for upstream operations.", "stipend": "20k", "positions": 2, "positions_filled": 0, "applied": 0, "skills_required": ["petroleum","safety","reporting"], "location_preference": "Ahmedabad", "sector": SECTORS["oil_gas"]}
    ],
    "manufacturing": [
        {"id": "p6", "title": "Production Intern", "description": "Work on production line improvements, lean audits, and maintenance planning in a plant environment.", "stipend": "9k", "positions": 3, "positions_filled": 0, "applied": 0, "skills_required": ["lean","excel","maintenance"], "location_preference": "Pune", "sector": SECTORS["manufacturing"]}
    ],
    "healthcare": [
        {"id": "p7", "title": "Medical Research Intern", "description": "Support clinical study documentation, literature reviews, and basic data analysis for healthcare projects.", "stipend": "12k", "positions": 2, "positions_filled": 0, "applied": 0, "skills_required": ["biology","research","documentation"], "location_preference": "Chennai", "sector": SECTORS["healthcare"]}
    ],
    "retail": [
        {"id": "p8", "title": "Retail Analytics Intern", "description": "Analyze POS data, build store performance dashboards, and provide insights for merchandising.", "stipend": "7k", "positions": 3, "positions_filled": 0, "applied": 0, "skills_required": ["python","excel","visualization"], "location_preference": "Kolkata", "sector": SECTORS["retail"]}
    ],
    "hospitality": [
        {"id": "p9", "title": "Hotel Management Intern", "description": "Support front office, guest relations, and operations excellence in hospitality settings.", "stipend": "10k", "positions": 4, "positions_filled": 0, "applied": 0, "skills_required": ["operations","communication","customer service"], "location_preference": "Goa", "sector": SECTORS["hospitality"]}
    ]
}

# ---------------- Applicants ----------------
import random

QUALIFICATIONS = ["B.Tech", "BE", "BSc", "M.Tech", "MBA", "BBA", "BCom", "BA", "MSc"]
CITIES = ["Bengaluru","Hyderabad","Mumbai","Delhi","Ahmedabad","Pune","Chennai","Kolkata","Goa","Jaipur","Lucknow"]
SOCIAL_CATEGORIES = ["General","OBC","SC","ST","EWS"]
FIRST_NAMES = [
    "Aarav", "Isha", "Karan", "Priya", "Ravi", "Sneha", "Arjun", "Meera",
    "Vikram", "Ananya", "Rahul", "Neha", "Siddharth", "Pooja", "Manish", "Kavya",
    "Nikhil", "Sanya", "Amit", "Divya"
]

LAST_NAMES = [
    "Sharma", "Patel", "Reddy", "Gupta", "Nair", "Khan", "Mehta", "Iyer",
    "Das", "Chopra", "Jain", "Mishra", "Agarwal", "Joshi", "Rao", "Singh"
]

# def seed_applicants_for_post(post_id: str, sector: str, required_skills: List[str], count: int = 24) -> List[Dict[str, Any]]:
#     applicants = []
#     for i in range(count):
#         first = random.choice(FIRST_NAMES)
#         last = random.choice(LAST_NAMES)
#         name = f"{first} {last}"
#         email = f"{first.lower()}.{last.lower()}{i+1}@example.com"

#         skills_pool = list(set(required_skills + [
#             "python","excel","communication","sql","css","javascript",
#             "statistics","research","presentation","safety","operations"
#         ]))
#         skills = random.sample(skills_pool, k=min(4, len(skills_pool)))
#         qualifications = random.choice(QUALIFICATIONS)
#         location = random.choice(CITIES)
#         sector_interests = list({sector} | set(random.sample(list(SECTORS.values()), k=2)))
#         rural = random.choice([True, False])
#         social_category = random.choice(SOCIAL_CATEGORIES)
#         past_participation = random.choice([0,0,0,1])

#         applicants.append({
#             "id": f"{post_id}-{i+1}",
#             "name": name,
#             "email": email,
#             "skills": skills,
#             "qualifications": qualifications,
#             "location": location,
#             "sector_interests": sector_interests,
#             "rural": rural,
#             "social_category": social_category,
#             "past_participation": past_participation,
#             "score": None,
#             "status": "applied"
#         })
#     return applicants


def seed_applicants_for_post(post_id: str, sector: str, required_skills: List[str], count: int = 24) -> List[Dict[str, Any]]:
    applicants = []
    for i in range(count):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}{i+1}@example.com"

        # Make sure each applicant has at least 1-2 required skills
        num_required_skills = min(len(required_skills), random.randint(1, len(required_skills)))
        skills = random.sample(required_skills, k=num_required_skills)

        # Optionally add 1-2 extra random skills (from the global pool)
        extra_skills_pool = ["python","excel","communication","sql","css","javascript",
                             "statistics","research","presentation","safety","operations"]
        extra_skills_pool = [s for s in extra_skills_pool if s not in skills]
        num_extra = random.randint(0, 2)
        skills += random.sample(extra_skills_pool, k=min(num_extra, len(extra_skills_pool)))

        qualifications = random.choice(QUALIFICATIONS)
        location = random.choice(CITIES)
        sector_interests = list({sector} | set(random.sample(list(SECTORS.values()), k=2)))
        rural = random.choice([True, False])
        social_category = random.choice(SOCIAL_CATEGORIES)
        past_participation = random.choice([0,0,0,1])

        applicants.append({
            "id": f"{post_id}-{i+1}",
            "name": name,
            "email": email,
            "skills": skills,
            "qualifications": qualifications,
            "location": location,
            "sector_interests": sector_interests,
            "rural": rural,
            "social_category": social_category,
            "past_participation": past_participation,
            "score": None,
            "status": "applied"
        })
    return applicants

APPLICANTS: Dict[str, List[Dict[str, Any]]] = {}
for dept_posts in POSTS.values():
    for p in dept_posts:
        APPLICANTS[p["id"]] = seed_applicants_for_post(p["id"], p["sector"], p.get("skills_required", []), 24)
        p["applied"] = len(APPLICANTS[p["id"]])

# ---------------- Selected ----------------
SELECTED = {}

# ---------------- Endpoints ----------------
@app.get("/departments/{department_id}/posts")
def get_department_posts(department_id: str, hr=Depends(get_current_hr)):
    posts = POSTS.get(department_id)
    if posts is None:
        raise HTTPException(status_code=404, detail="No posts found")
    return posts

def _find_post(post_id: str) -> Optional[Dict[str, Any]]:
    for dept_posts in POSTS.values():
        for p in dept_posts:
            if p["id"] == post_id:
                return p
    return None
@app.get("/departments/{department_id}/past")
def get_past_posts(department_id: str, hr=Depends(get_current_hr)):
    return PAST_POSTS.get(department_id, [])

@app.post("/departments/{department_id}/past/{post_id}/restore")
def restore_to_active(department_id: str, post_id: str, hr=Depends(get_current_hr)):
    past_posts = PAST_POSTS.get(department_id, [])
    post = next((p for p in past_posts if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found in past")
    PAST_POSTS[department_id] = [p for p in past_posts if p["id"] != post_id]
    POSTS.setdefault(department_id, []).append(post)
    _notify(department_id, f"Internship '{post['title']}' restored to Active.")
    return {"message": "Restored", "post": post}

@app.get("/posts/{post_id}")
def get_post_detail(post_id: str, hr=Depends(get_current_hr)):
    post = _find_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@app.get("/posts/{post_id}/applicants")
def get_post_applicants(post_id: str, hr=Depends(get_current_hr)):
    return APPLICANTS.get(post_id, [])

@app.get("/departments/{department_id}/posts/{post_id}/applicants")
def get_department_post_applicants(department_id: str, post_id: str, hr=Depends(get_current_hr)):
    return APPLICANTS.get(post_id, [])

@app.post("/posts/{post_id}/match")
def match_candidates(post_id: str, hr=Depends(get_current_hr)):
    post = _find_post(post_id)
    applicants = APPLICANTS.get(post_id, [])
    if not post or not applicants:
        return {"ranked": False, "matched_top": []}

    required = set([s.lower() for s in post.get("skills_required", [])])
    preferred_location = post.get("location_preference")
    sector = post.get("sector")

    ranked = []
    for a in applicants:
        # Skills overlap (max 50)
        skills = set([s.lower() for s in a.get("skills", [])])
        skill_overlap = len(required.intersection(skills))
        skills_score = min(50, skill_overlap * 12.5)

        # Qualification match (max 15)
        qualification = a.get("qualifications", "")
        qual_score = 15 if any(k in qualification for k in ["Tech","B.Tech","M.Tech","MBA","BSc","MSc","BE"]) else 8

        # Location preference (max 10)
        loc_score = 10 if preferred_location and a.get("location") == preferred_location else 5

        # Sector interest (max 15)
        sec_score = 15 if sector in set(a.get("sector_interests", [])) else 7

        # Affirmative action bonus (max 10)
        aff_bonus = 0
        if a.get("rural"):
            aff_bonus += 5
        if a.get("social_category") in ["SC","ST","OBC","EWS"]:
            aff_bonus += 5

        # Past participation penalty (up to -5)
        past_penalty = -5 if a.get("past_participation", 0) > 0 else 0

        score = round(skills_score + qual_score + loc_score + sec_score + aff_bonus + past_penalty, 2)
        a["score"] = score
        ranked.append(a)

    # Sort descending by score
    ranked.sort(key=lambda x: x["score"], reverse=True)

    # Take top 20%
    top_count = max(1, len(ranked) * 20 // 100)
    top_n = ranked[:top_count]

    # Return minimal details for table display
    top_n_summary = [
        {
            "id": a["id"],
            "name": a["name"],
            "email": a["email"],
            "skills": a["skills"],
            "qualifications": a["qualifications"],
            "location": a["location"],
            "score": a["score"],
            "status": a["status"]
        }
        for a in top_n
    ]

    return {"ranked": True, "matched_top": top_n_summary}


def _increment_filled(post_id: str):
    for dept_id, dept_posts in POSTS.items():
        for p in dept_posts:
            if p["id"] == post_id:
                p["positions_filled"] = p.get("positions_filled", 0) + 1
                return


@app.post("/posts/{post_id}/schedule")
def schedule_interview(post_id: str, body: ScheduleBody, hr=Depends(get_current_hr)):
    meet_id = str(uuid.uuid4())
    meet_url = f"https://meet.example.com/{meet_id}"
    entry = {
        "meeting_id": meet_id,
        "post_id": post_id,
        "applicant_id": body.applicant_id,
        "datetime": body.datetime_iso,
        "note": body.note,
        "join_url": meet_url,
    }
    MEETINGS.setdefault(post_id, []).append(entry)
    return {"message": "Interview scheduled", **entry}

@app.get("/posts/{post_id}/meetings")
def list_meetings(post_id: str, hr=Depends(get_current_hr)):
    return MEETINGS.get(post_id, [])

TIE_TESTS: Dict[str, Dict[str, str]] = {}

@app.post("/posts/{post_id}/tiebreak")
def create_tie_break_tests(post_id: str, hr=Depends(get_current_hr)):
    applicants = APPLICANTS.get(post_id, [])
    if not applicants:
        return {"created": 0, "links": {}}
    # find max score and those tied
    scores = [a.get("score") for a in applicants if a.get("score") is not None]
    if not scores:
        return {"created": 0, "links": {}}
    top = max(scores)
    tied = [a for a in applicants if a.get("score") == top]
    links = {}
    for a in tied:
        link = f"https://assess.example.com/test/{post_id}/{a['id']}"
        links[a["id"]] = link
    TIE_TESTS[post_id] = links
    return {"created": len(links), "links": links, "score": top}

@app.get("/posts/{post_id}/tiebreak")
def get_tie_break_tests(post_id: str, hr=Depends(get_current_hr)):
    return TIE_TESTS.get(post_id, {})

# ---------------- Send Tie-Break Test Emails ----------------
@app.post("/posts/{post_id}/tiebreak/send")
def send_tie_break_tests(post_id: str, hr=Depends(get_current_hr)):
    # Check if tie-break tests exist
    tests = TIE_TESTS.get(post_id)
    if not tests:
        raise HTTPException(status_code=404, detail="No tie-break tests found for this post")

    # Simulate sending emails
    emails = []
    for applicant_id, link in tests.items():
        # Find applicant info
        applicant = None
        for apps in APPLICANTS.values():
            for a in apps:
                if a["id"] == applicant_id:
                    applicant = a
                    break
        if not applicant:
            continue

        emails.append({
            "to": applicant["email"],
            "subject": f"Tie-Break Test for {post_id}",
            "body": f"Dear {applicant['name']},\n\nPlease complete your tie-break test using this link:\n{link}\n\nBest Regards,\nHR Team",
            "status": "queued (simulate sending)"
        })

    return {"sent_count": len(emails), "emails": emails}

@app.get("/departments/{department_id}/selected")
def get_selected(department_id: str, hr=Depends(get_current_hr)):
    return SELECTED.get(department_id, [])

@app.get("/departments/{department_id}/selected/export")
def export_selected(department_id: str, hr=Depends(get_current_hr)):
    import csv, io

    output = io.StringIO()
    fieldnames = ["id", "name", "email", "post_id", "selected_at"]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for s in SELECTED.get(department_id, []):
        row = {k: s[k] for k in fieldnames}  # only include allowed fields
        writer.writerow(row)

    csv_bytes = io.BytesIO(output.getvalue().encode("utf-8"))
    response = StreamingResponse(csv_bytes, media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=selected_{department_id}.csv"
    return response


# Applicant profile lookup
@app.get("/applicants/{applicant_id}")
def get_applicant_profile(applicant_id: str, hr=Depends(get_current_hr)):
    for post_apps in APPLICANTS.values():
        for a in post_apps:
            if a["id"] == applicant_id:
                return a
    raise HTTPException(status_code=404, detail="Applicant not found")
REJECTED: Dict[str, List[Dict[str, Any]]] = {}  # store rejected applicants by department

# Example: mark rejected applicants automatically (optional)
for dept_id in POSTS.keys():
    REJECTED[dept_id] = []

@app.get("/departments/{department_id}/rejected")
def get_rejected(department_id: str, hr=Depends(get_current_hr)):
    # Make sure HR can only see their department
    if hr["department_id"] != department_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Gather rejected applicants for this department
    rejected = REJECTED.get(department_id, [])
    return rejected

from pydantic import BaseModel

class SelectRejectBody(BaseModel):
    applicant_id: str


# ---------------- Select Applicant ----------------
@app.post("/posts/{post_id}/select")
def select_candidate(post_id: str, body: SelectRejectBody, hr=Depends(get_current_hr)):
    applicants = APPLICANTS.get(post_id, [])
    cand = next((a for a in applicants if a["id"] == body.applicant_id), None)
    if not cand:
        raise HTTPException(status_code=404, detail="Applicant not found")

    # Check if already selected
    selected_list = SELECTED.get(hr["department_id"], [])
    if any(s["id"] == cand["id"] for s in selected_list):
        raise HTTPException(status_code=400, detail="Applicant already selected")

    # Update status
    cand["status"] = "selected"

    # Remove from REJECTED if present
    REJECTED[hr["department_id"]] = [r for r in REJECTED.get(hr["department_id"], []) if r["id"] != cand["id"]]

    # Add to SELECTED
    selected_entry = {**cand, "post_id": post_id, "selected_at": str(uuid.uuid4())}
    SELECTED.setdefault(hr["department_id"], []).append(selected_entry)

    # Increment positions filled
    for dept_posts in POSTS.values():
        for p in dept_posts:
            if p["id"] == post_id:
                p["positions_filled"] = p.get("positions_filled", 0) + 1

    return {"message": "Candidate selected", "candidate": selected_entry}


# ---------------- Reject Applicant ----------------
@app.post("/posts/{post_id}/reject")
def reject_candidate(post_id: str, body: SelectRejectBody, hr=Depends(get_current_hr)):
    applicants = APPLICANTS.get(post_id, [])
    cand = next((a for a in applicants if a["id"] == body.applicant_id), None)
    if not cand:
        raise HTTPException(status_code=404, detail="Applicant not found")

    # Update status
    cand["status"] = "rejected"

    # Remove from SELECTED if present
    selected_list = SELECTED.get(hr["department_id"], [])
    SELECTED[hr["department_id"]] = [s for s in selected_list if s["id"] != cand["id"]]

    # Decrement positions_filled if candidate was previously selected
    if any(s["id"] == cand["id"] for s in selected_list):
        for dept_posts in POSTS.values():
            for p in dept_posts:
                if p["id"] == post_id:
                    p["positions_filled"] = max(0, p.get("positions_filled", 0) - 1)

    # Add to REJECTED
    REJECTED.setdefault(hr["department_id"], []).append(cand)

    # Optional: Structured rejection email
    post = _find_post(post_id)
    body_text = f"""
Dear {cand['name']},

Thank you for applying for the internship '{post['title']}'.

After careful consideration, we regret to inform you that you have not been selected.

We appreciate your interest and encourage you to apply for future opportunities.

Best Regards,
HR Team
[Organization Name]
"""
    return {
        "message": "Candidate rejected",
        "candidate": cand,
        "email": {
            "to": cand["email"],
            "subject": f"Application Update for {cand['name']} - {post['title']}",
            "body": body_text.strip(),
            "status": "queued (simulate sending)"
        }
    }


    
@app.get("/departments/{department_id}/notifications")
def get_notifications(department_id: str, hr=Depends(get_current_hr)):
    return NOTIFICATIONS.get(department_id, [])


@app.get("/departments/{department_id}/analytics")
def analytics(department_id: str, hr=Depends(get_current_hr)):
    active = len(POSTS.get(department_id, []))
    past = len(PAST_POSTS.get(department_id, []))
    selected = len(SELECTED.get(department_id, []))
    rejected = len(REJECTED.get(department_id, []))
    return {
        "active_internships": active,
        "past_internships": past,
        "selected_candidates": selected,
        "rejected_candidates": rejected
    }

@app.get("/profile")
def profile(email: str):
    user = USERS.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/posts/{post_id}/email")
def send_email(post_id: str, applicant_id: str, subject: str, type: str = "selection", message: str = "", hr=Depends(get_current_hr)):
    applicants = APPLICANTS.get(post_id, [])
    candidate = next((a for a in applicants if a["id"] == applicant_id), None)
    if not candidate:
        raise HTTPException(status_code=404, detail="Applicant not found")

    internship = None
    for p in POSTS.get(hr["department_id"], []):
        if p["id"] == post_id:
            internship = p
    for p in PAST_POSTS.get(hr["department_id"], []):
        if p["id"] == post_id:
            internship = p

    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    # Structured email content
    if type == "selection":
        body = f"""
        Subject: Congratulations! Internship Selection for {internship['title']}

        Dear {candidate['name']},

        We are pleased to inform you that you have been selected for the internship role of {internship['title']} in the {hr['department_id']} department.

        Internship Details:
        - Title: {internship['title']}
        - Duration: [Start Date] to [End Date]
        - Organization: [Organization Name]

        Next Steps:
        Our HR team will contact you shortly with onboarding details.

        Congratulations once again and welcome aboard!

        Best Regards,
        HR Team
        [Organization Name]
        """
    else:
        body = f"""
        Subject: Internship Application Status for {internship['title']}

        Dear {candidate['name']},

        Thank you for applying to the internship role of {internship['title']} in the {hr['department_id']} department.

        After careful consideration, we regret to inform you that you have not been selected for this position.

        We truly appreciate your interest in joining us and encourage you to apply for future opportunities with our organization.

        Best Wishes,
        HR Team
        [Organization Name]
        """

    # Right now, just return instead of actually sending
    return {
        "to": candidate["email"],
        "subject": subject,
        "body": body.strip(),
        "status": "queued (simulate sending)"
    }
@app.post("/posts/{post_id}/auto_select")
def auto_select_candidates(post_id: str, hr=Depends(get_current_hr)):
    post = _find_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    applicants = APPLICANTS.get(post_id, [])
    if not applicants:
        return {"selected_count": 0, "message": "No applicants found"}

    # Ensure scores exist (run matching first if needed)
    for a in applicants:
        if a.get("score") is None:
            a["score"] = 0  # default if match_candidates not run

    # Sort by score descending
    applicants_sorted = sorted(applicants, key=lambda x: x.get("score", 0), reverse=True)

    # Determine how many positions are available
    positions_available = post["positions"] - post.get("positions_filled", 0)
    if positions_available <= 0:
        return {"selected_count": 0, "message": "No positions available"}

    # Select top candidates up to available positions
    selected_candidates = []
    for a in applicants_sorted:
        if a["status"] != "applied":
            continue  # skip already selected/rejected
        if positions_available <= 0:
            break

        # Update status and add to SELECTED
        a["status"] = "selected"
        selected_entry = {**a, "post_id": post_id, "selected_at": str(uuid.uuid4())}
        SELECTED.setdefault(hr["department_id"], []).append(selected_entry)
        selected_candidates.append(selected_entry)

        positions_available -= 1
        post["positions_filled"] = post.get("positions_filled", 0) + 1

        # Remove from REJECTED if present
        REJECTED[hr["department_id"]] = [r for r in REJECTED.get(hr["department_id"], []) if r["id"] != a["id"]]

    return {
        "selected_count": len(selected_candidates),
        "selected_candidates": selected_candidates,
        "message": f"{len(selected_candidates)} candidates auto-selected based on score."
    }


# @app.post("/posts/{post_id}/send_top_emails")
# def send_top_emails(post_id: str, method: str = "top_percent", value: int = 20, hr=Depends(get_current_hr)):
#     # get applicants
#     applicants = APPLICANTS.get(post_id, [])
#     if not applicants:
#         raise HTTPException(status_code=404, detail="No applicants found")
    
#     # ensure scores exist
#     for a in applicants:
#         if a.get("score") is None:
#             a["score"] = 0
    
#     # sort by score
#     applicants_sorted = sorted(applicants, key=lambda x: x.get("score", 0), reverse=True)
    
#     # calculate top N
#     if method == "top_percent":
#         top_count = max(1, len(applicants_sorted) * value // 100)
#     elif method == "top_n":
#         top_count = min(value, len(applicants_sorted))
#     else:
#         top_count = 1
    
#     top_candidates = applicants_sorted[:top_count]

#     # simulate sending emails
#     emails = []
#     for cand in top_candidates:
#         body = f"Dear {cand['name']},\n\nYou are selected for {post_id} internship!\n\nBest Regards"
#         emails.append({
#             "to": cand["email"],
#             "subject": f"Internship Selection: {post_id}",
#             "body": body,
#             "status": "queued (simulate sending)"
#         })

#     return {"sent_count": len(emails), "emails": emails}

@app.post("/posts/{post_id}/send_top_emails")
def send_top_emails(
    post_id: str,
    method: str = Query("top_percent"),
    value: int = Query(20)
):
    applicants = APPLICANTS.get(post_id, [])
    if not applicants:
        raise HTTPException(status_code=404, detail="No applicants found")
    
    # Ensure scores exist
    for a in applicants:
        if a.get("score") is None:
            a["score"] = 0
    
    # Sort by score
    applicants_sorted = sorted(applicants, key=lambda x: x["score"], reverse=True)
    
    # Calculate top N
    if method == "top_percent":
        top_count = max(1, len(applicants_sorted) * value // 100)
    elif method == "top_n":
        top_count = min(value, len(applicants_sorted))
    else:
        top_count = 1
    
    top_candidates = applicants_sorted[:top_count]

    # Simulate sending emails
    emails = []
    for cand in top_candidates:
        body = f"Dear {cand['name']},\n\nYou are selected for {post_id} internship!\n\nBest Regards"
        emails.append({
            "to": cand["email"],
            "subject": f"Internship Selection: {post_id}",
            "body": body,
            "status": "queued (simulate sending)"
        })

    return {"sent_count": len(emails), "emails": emails}
