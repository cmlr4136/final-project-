## 1) Goal & Background
- Build a "Physical Fitness & Training Management System" that supports training plan creation, training records, and progress viewing.
- Technical constraints: Backend uses Kotlin; database uses H2 (for easy demonstration and development); frontend only initializes React + Vite project (no commitment to full UI implementation).

## 2) Scope Definition (Basic vs Advanced)

### Basic Version (MVP)
- Account and Identity: Register/Login, Logout, Basic Profile.
- Training Content: Exercise Library (View/Search), Exercise Details.
- Plans: Create training plans, plans contain exercises and set/rep targets.
- Records: Start a training session, log sets/reps/weight/duration per exercise.
- Progress: View training history over time and simple statistics (counts, total training volume).

### Advanced Version (Optional, not included in this delivery)
- Smart Recommendations: Automatically adjust training volume and plans based on history.
- Device Integration: Import from wearables/heart rate/steps.
- Coach Collaboration: Coaches create/assign plans, student feedback.
- Training Groups: Admin-only creation; users join/leave groups, text discussion within groups (minimal version).
- Deeper Analytics: PR curves, fatigue management, periodization reports.

## 3) Key Entities & Feature Mapping
- User: Registration info, height/weight (optional), preferences.
- Exercise: Name, muscle group, equipment, instructions.
- Training Plan: Name, goal, plan items.
- Plan Item: Exercise, target sets/reps/weight/time.
- Training: Date, associated plan (optional), notes.
- Training Set: Reps, weight, duration, RPE (optional).

## 4) Milestones
| Phase | Time | Deliverables |
|---|---|---|
| M0 Definition | 0.5 week | Requirements confirmation, draft data model, API list |
| M1 Frontend Init | 0.5 week | React+Vite initialization, route skeleton, API wrapper stubs (can be empty implementations) |
| M2 Backend Core | 1 week | Kotlin service skeleton, H2 schema, core CRUD (exercises/plans) |
| M3 MVP Closed Loop | 1 week | Login → view exercises → create plan → log training → view history (minimal UI or API verification) |
| M4 Stabilization | 0.5 week | Validation, error handling, minimal testing, document updates |

## 5) Assumptions & Risks
- H2 is suitable for development/demo; can migrate to Postgres for production.
- "Frontend init only" means delivery focuses on API and data correctness.
- Data consistency: Try to use application layer logic constraints instead of strong foreign keys.

# Project Plan (English)

## 1) Goal & Context
- Build a Physical Fitness & Training system that supports training plan creation, workout logging, and progress review.
- Technical constraints: Kotlin backend; H2 database for development/demo; frontend is React + Vite initialization only (no full UI delivery assumed).

## 2) Scope (Basic vs Advanced)

### Basic (MVP)
- Authentication: sign up/in/out, basic profile.
- Exercise library: browse/search exercises and view details.
- Plans: create training plans containing exercises and targets.
- Logging: start a session and record sets (reps/weight/time).
- Progress: view history and simple aggregates (counts, total volume).

### Advanced (Optional, out of current delivery)
- Recommendations: automatically adjust plans based on history.
- Wearables: import heart rate/steps from fitness devices.
- Coach collaboration: coaches assign plans and review client feedback.
- Training groups: admin-only creation; users join/leave and text discussion (minimal version).
- Deeper analytics: PR trends, fatigue management, periodization reports.

## 3) Key Entities & Feature Mapping
- User: account info, optional body metrics, preferences.
- Exercise: name, muscle group, equipment, notes.
- TrainingPlan: name, goal, plan items.
- PlanItem: exercise plus target sets/reps/weight/duration.
- WorkoutSession: date/time, optional plan link, notes.
- SetEntry: reps, weight, duration, optional RPE.

## 4) Milestones
| Phase | Timebox | Deliverables |
|---|---|---|
| M0 Definition | 0.5 week | Requirements confirmation, draft data model, API list |
| M1 Frontend Init | 0.5 week | React+Vite scaffold, route skeleton, API wrapper stubs |
| M2 Backend Core | 1 week | Kotlin service skeleton, H2 schema, core CRUD (exercises/plans) |
| M3 MVP End-to-End | 1 week | Sign in → browse exercises → create plan → log workout → view history (minimal UI or API-verified) |
| M4 Stabilization | 0.5 week | Validation, error handling, minimal tests, docs updates |

## 5) Assumptions & Risks
- H2 is ideal for development/demo; production would likely move to Postgres.
- “Frontend init only” means delivery focuses on API and data correctness.
- Data consistency is primarily enforced in application logic rather than strong DB foreign keys.