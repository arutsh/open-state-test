const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }
  return response.json();
}

export function fetchJurisdictions() {
  return request("/api/jurisdictions");
}

export function fetchLegislators(jurisdictionId, { party, chamber } = {}) {
  const params = new URLSearchParams();
  if (party) params.set("party", party);
  if (chamber) params.set("chamber", chamber);
  const query = params.toString() ? `?${params.toString()}` : "";
  // jurisdiction_id itself contains "/" (Open States uses OCD ids like
  // "ocd-jurisdiction/country:us/state:ca/government"), matched on the
  // backend via a path-type route param, so it is interpolated as-is
  // rather than percent-encoded.
  return request(`/api/jurisdictions/${jurisdictionId}/legislators${query}`);
}

export function fetchPartySummary(jurisdictionId) {
  return request(`/api/jurisdictions/${jurisdictionId}/party-summary`);
}
