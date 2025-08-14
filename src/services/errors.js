export function explain(err, fallback = "Something went wrong.") {
  const s = err?.response?.status;
  const body = String(err?.response?.data ?? "").toLowerCase();

  if (s === 415) return "Server expects JSON (Content-Type: application/json).";
  if (s === 409 || /constraint|foreign key|in use|duplicate|unique/.test(body)) {
    if (/airport/.test(body)) return "Airport is in use (has gates/aircraft/flights). Remove them first.";
    if (/gate/.test(body))    return "Gate is in use (assigned to flights). Unassign first.";
    return "Operation violates database constraints.";
  }
  return err?.message || fallback;
}
