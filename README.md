# ✈️ Final Sprint — Aviation Frontend (React + Vite)

A single-page React application for viewing airport arrivals and departures, with an admin panel to manage flights. Connects to a Spring Boot backend API.

> **Note:** AWS S3/CloudFront hosting was planned but not fully connected for this submission due to issues out of our control. The frontend is currently run locally and connects directly to the deployed backend API.

---

## 🔗 Live Links
- **Frontend (S3/CloudFront):** _Not connected in final submission_
- **Backend API:** [http://3.145.47.123:8080](http://3.145.47.123:8080)  
- **Trello Board:** [https://trello.com/b/sJ6KUDuZ/s4-final](https://trello.com/b/sJ6KUDuZ/s4-final)  
- **Key PRs:** [#6](https://github.com/NSparkes95/final-sprint-frontend/pull/6), [#5](https://github.com/NSparkes95/final-sprint-frontend/pull/5)

---

# ⚡ Quick Start (Local Development)

## Install dependencies
```bash
npm install
```
## Start development server
```bash
npm run dev
```
## Run tests locally
```bash
npm test
```
CI runs on every PR and push. See .github/workflows/ci.yml for details.

---

# ⚙️ Environment Variables

Create a .env file for local development or .env.production for deployment:

VITE_API_BASE_URL=http://3.145.47.123:8080

---

# 📦 Build & Deploy (Planned S3 / CloudFront)
```bash
npm run build
```
Deploy via AWS CLI (once connected to S3 bucket):
```bash
aws s3 sync dist/ s3://BUCKET-NAME
```
## S3 Static Website Hosting / CloudFront settings:

- Index document: index.html

- Error document: index.html (needed for React Router deep links like /departures and /admin)

---

## ✅ Features Implemented

- Arrivals & Departures pages with loading, empty, and error states

- Airport switching (querystring + localStorage)

- Admin: Add & Edit flights

- Airline + Gate fields in UI

- Centralized API client + data transformers

- Unit tests (Vitest + React Testing Library)

- GitHub Actions CI for automated testing

---

## 🧪 Manual Test Script

See /docs/manual-test-cases.md for detailed frontend testing steps.

---

## 👥 Team & Workflow

Roles:

- Christian Rose — Frontend Development

- Nicole Sparkes — Backend Development

- Dylan Finlay — Additional Support

Workflow:

- Feature branches → Pull Requests → main

- Linked Trello tasks to commits & PRs

- Reviewed via GitHub PRs (#5, #6)