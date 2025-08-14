# Final Sprint — Aviation Frontend (React + Vite)

A single-page React application for viewing airport arrivals and departures, with an admin panel to add and edit flights. Connects to a Spring Boot backend API.

---

# Live Links

**Frontend (S3/CloudFront):** <Frontend Live Link> - add once connected

**Backend API:** http://3.145.47.123:8080

**Trello Board:** https://trello.com/b/sJ6KUDuZ/s4-final

**Key PRs:** <https://github.com/NSparkes95/final-sprint-frontend/pull/6>, <https://github.com/NSparkes95/final-sprint-frontend/pull/5>

---

# Quick Start (Local Development)

**Install dependencies**
npm install

**Start development server**
npm run dev


**Run tests locally:**
npm test


CI runs on every PR and push. See .github/workflows/ci.yml.

---

# Environment Variables

**Create a .env (local) or .env.production (for deployment):**

VITE_API_BASE_URL=http://3.145.47.123:8080

---

# Build & Deploy (S3 / CloudFront)
npm run build

**Deploy via AWS Console or CLI:**
aws s3 sync dist/ s3://<your-bucket-name> --add when conencted


**S3 Static Website Hosting / CloudFront settings:**

- Index document: index.html

- Error document: index.html (needed for React Router deep links like /departures and /admin)

---

# Features Implemented

- Arrivals & Departures pages with loading, empty, and error states

- Airport switching (querystring + localStorage)

- Admin: Add & Edit flights

- Airline + Gate fields in UI

- Centralized API client + data transformers

- Unit tests (Vitest + React Testing Library)

- GitHub Actions CI for automated testing

---

# Manual Test Script

See /docs/manual-test-cases.md for detailed frontend testing steps.

---

# Team & Workflow

**Roles:**

- Christian Rose — Frontend Development

- Nicole Sparkes — Backend Development

- Dylan Finlay — Additional Support

**Workflow:**

- Feature branches → Pull Requests → main

- Linked Trello tasks to commits & PRs

- Reviewed via GitHub PRs (#5, #6)