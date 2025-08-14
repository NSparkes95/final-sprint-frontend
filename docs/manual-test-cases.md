# Manual Test Cases — Aviation Frontend (React + Vite)

**Project:** Final Sprint — Aviation Frontend  
**Deployed Frontend:** `<ADD_S3_OR_CLOUDFRONT_URL>`  
**Backend API:** `http://3.145.47.123:8080`

---

## Test Environment
- Browser: Chrome/Edge/Firefox (latest)
- Backend reachable at `http://3.145.47.123:8080`
- Frontend env var set:
  - Local: `VITE_API_BASE_URL=http://localhost:8080`
  - Deployed: `VITE_API_BASE_URL=http://3.145.47.123:8080`
- Open **DevTools → Network** to observe requests/responses.

---

## Legend
- ✅ Pass ❌ Fail N/A Not applicable

---

## TC-01 — Arrivals page loads and renders data
**Steps**
1. Open **`<FRONTEND_URL>/`** (default page: Arrivals).
2. Wait for loading to complete.

**Expected**
- Brief **loading** indicator, then a table/list of **Arrivals**.
- Each row shows **airline**, **from/to**, **gate** (if present).
- If there are no arrivals, an **empty state** message is shown.

**Result:** ☐✅ ☐❌ ☐N/A **Notes:** _______________________

---

## TC-02 — Switch airport updates Arrivals
**Steps**
1. Use the **Airport Switcher** (top of page).
2. Select a different airport.

**Expected**
- Arrivals list refreshes with the new airport’s flights.
- Selection persists (URL query and/or localStorage).

**Result:** ☐✅ ☐❌ ☐N/A **Notes:** _______________________

---

## TC-03 — Departures page loads and matches selected airport
**Steps**
1. Navigate to **`/departures`**.
2. Wait for loading to complete.

**Expected**
- Brief **loading** indicator, then **Departures** for the **currently selected airport**.
- Empty state appears if no departures.

**Result:** ☐✅ ☐❌ ☐N/A **Notes:** _______________________

---

## TC-04 — Admin: add a new flight
**Steps**
1. Go to **`/admin`**.
2. Fill required fields: **Airline Name**, **Type (aircraft)**, **Departure Airport**, **Arrival Airport**, **Gate** (and times if required).
3. Click **Save**.

**Expected**
- **POST** request succeeds (200/201).
- New flight appears in Admin list.
- Returning to Arrivals/Departures shows the new flight when applicable.

**Result:** ☐✅ ☐❌ ☐N/A **Notes:** _______________________

---

## TC-05 — Admin: edit an existing flight
**Steps**
1. On **`/admin`**, click **Edit** on a flight.
2. Change one field (e.g., **Gate**) and **Save**.

**Expected**
- **PUT** request succeeds (200).
- Updated value appears in Admin list and on Arrivals/Departures if relevant.

**Result:** ☐✅ ☐❌ ☐N/A **Notes:** _______________________

---

## TC-06 — Form validation prevents bad submits
**Steps**
1. On **`/admin`**, clear a required field (e.g., Airline Name).
2. Attempt to **Save**.

**Expected**
- Submit is blocked with a **validation message**.
- No network request is sent until the form is valid.

**Result:** ☐✅ ☐❌ ☐N/A **Notes:** _______________________

---

## TC-07 — Deep links (SPA routing) work on refresh
**Steps**
1. Direct-load **`<FRONTEND_URL>/departures`** (type URL and press Enter).
2. Refresh the page on **`/departures`**.
3. Repeat for **`/admin`**.

**Expected**
- Pages load (S3/CloudFront **Error document = `index.html`** configured).
- No 404 from the static host.

**Result:** ☐✅ ☐❌ ☐N/A **Notes:** _______________________

---

## TC-08 — Error state appears when backend is unreachable
**Steps**
- Temporarily stop backend **or** temporarily set a wrong base URL (e.g., `http://localhost:9999`) and restart dev server.
- Load Arrivals/Departures.

**Expected**
- UI shows a clear **error** state (not blank).
- Network tab shows failed HTTP request.

**Result:** ☐✅ ☐❌ ☐N/A **Notes:** _______________________

---

## TC-09 — Empty state appears when no flights exist (optional)
**Steps**
- Select an airport with **no flights** (if available) or temporarily filter to an empty result set.

**Expected**
- UI shows a clear **empty state** and no console errors.

**Result:** ☐✅ ☐❌ ☐N/A **Notes:** _______________________

---

## Pass/Fail Summary

| TC  | Description                | Result | Notes |
|-----|----------------------------|--------|-------|
| 01  | Arrivals loads              |        |       |
| 02  | Switch airport              |        |       |
| 03  | Departures loads            |        |       |
| 04  | Admin add flight            |        |       |
| 05  | Admin edit flight           |        |       |
| 06  | Form validation             |        |       |
| 07  | Deep link refresh           |        |       |
| 08  | Error state (backend down)  |        |       |
| 09  | Empty state                 |        |       |

---

**Tester:** ____________________ **Date/Time:** ____________________  
**Overall:** ☐✅ Pass ☐❌ Needs fixes
