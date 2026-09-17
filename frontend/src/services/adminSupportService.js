// Staff-only Support Dashboard API calls.
// Kept separate from `services/api.js` so customer-side ticket functions
// remain untouched and it's obvious which endpoints require staff access.

import { getCookie } from "./api";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

function toQuery(params = {}) {
  const cleaned = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  return new URLSearchParams(cleaned).toString();
}

async function request(path, options = {}) {
  const token = getCookie("auth_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body.detail ||
        Object.values(body).flat().join(" ") ||
        "Request failed."
    );
  }
  return response.status === 204 ? null : response.json();
}

export const getSupportStats = () =>
  request("/admin/support/tickets/stats/");

export const getStaffTickets = (params = {}) =>
  request(`/admin/support/tickets/?${toQuery(params)}`);

export const getStaffTicket = (ticketId) =>
  request(`/admin/support/tickets/${ticketId}/`);

export const updateStaffTicket = (ticketId, data) =>
  request(`/admin/support/tickets/${ticketId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const sendStaffReply = (ticketId, message) =>
  request(`/admin/support/tickets/${ticketId}/messages/`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });