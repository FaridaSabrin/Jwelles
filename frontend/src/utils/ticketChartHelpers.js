// frontend/src/utils/ticketChartHelpers.js
//
// Pure helpers that turn raw AdminSupportTicketListSerializer objects
// into chart-ready arrays. Field names below come from the actual
// Jwelles backend serializer — do not rename them without updating
// serializers.py.

// Canonical order + labels, matching SupportTicket.STATUS_CHOICES and
// SupportTicket.PRIORITY_CHOICES in models.py. If you ever add a new
// choice, add it here too.
export const STATUS_ORDER = [
  "open",
  "in_progress",
  "awaiting_customer",
  "resolved",
  "closed",
];

export const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  awaiting_customer: "Awaiting Customer",
  resolved: "Resolved",
  closed: "Closed",
};

export const STATUS_COLORS = {
  open: "#9a691f",
  in_progress: "#4c7592",
  awaiting_customer: "#a07a3a",
  resolved: "#3f7d52",
  closed: "#6e6b65",
};

// Jwelles SupportTicket.PRIORITY_CHOICES only has low / medium / high.
// (The dashboard prompt mentioned "Urgent" but the DB does not have it.)
export const PRIORITY_ORDER = ["low", "medium", "high"];

export const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_COLORS = {
  low: "#7c9c6a",
  medium: "#c98a2c",
  high: "#b3452f",
};

// Build a YYYY-MM-DD key in the user's LOCAL time from an ISO timestamp.
// The backend returns ISO strings (DRF default) for created_at.
function localDateKey(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shortDayLabel(dateKey) {
  // dateKey = "YYYY-MM-DD"; return e.g. "Mon 12"
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
  });
}

/**
 * Chart 1 — Tickets created on each of the last 7 days (including today).
 * Returns 7 buckets, zero-filled, oldest first.
 *
 * @param {Array<{created_at: string}>} tickets
 * @returns {Array<{date: string, label: string, count: number}>}
 */
export function buildCreatedLast7Days(tickets = []) {
  const buckets = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = localDateKey(d.toISOString());
    buckets.set(key, 0);
  }

  for (const t of tickets) {
    if (!t?.created_at) continue;
    const key = localDateKey(t.created_at);
    if (buckets.has(key)) {
      buckets.set(key, buckets.get(key) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({
    date,
    label: shortDayLabel(date),
    count,
  }));
}

/**
 * Chart 2 — Ticket status distribution.
 * Only includes statuses that are present in the data (or all, if you
 * prefer to always show every slice — flip `includeEmpty`).
 *
 * @param {Array<{status: string}>} tickets
 * @param {boolean} includeEmpty
 */
export function buildStatusDistribution(tickets = [], includeEmpty = false) {
  const counts = new Map(STATUS_ORDER.map((s) => [s, 0]));
  for (const t of tickets) {
    if (t?.status && counts.has(t.status)) {
      counts.set(t.status, counts.get(t.status) + 1);
    }
  }
  return STATUS_ORDER
    .map((s) => ({
      key: s,
      name: STATUS_LABELS[s],
      value: counts.get(s),
      color: STATUS_COLORS[s],
    }))
    .filter((row) => includeEmpty || row.value > 0);
}

/**
 * Chart 3 — Tickets by priority.
 */
export function buildPriorityDistribution(tickets = [], includeEmpty = true) {
  const counts = new Map(PRIORITY_ORDER.map((p) => [p, 0]));
  for (const t of tickets) {
    if (t?.priority && counts.has(t.priority)) {
      counts.set(t.priority, counts.get(t.priority) + 1);
    }
  }
  return PRIORITY_ORDER
    .map((p) => ({
      key: p,
      name: PRIORITY_LABELS[p],
      count: counts.get(p),
      color: PRIORITY_COLORS[p],
    }))
    .filter((row) => includeEmpty || row.count > 0);
}

/**
 * Chart 4 — Resolution summary.
 * Uses only fields that exist on SupportTicket: status, created_at,
 * resolved_at. Never invents a value.
 *
 * - `pending`        = open + in_progress + awaiting_customer
 * - `pendingPercent` = pending / total * 100 (integer)
 * - `resolvedOrClosed` = resolved + closed
 * - `resolutionRate` = resolvedOrClosed / total * 100 (integer)
 * - `avgResolutionHours` is only computed over tickets that actually
 *    have non-null resolved_at AND valid created_at. If nothing has
 *    been resolved yet, this is null (caller shows "—").
 *
 * NOTE: resolved_at is present on AdminSupportTicketDetailSerializer but
 * NOT on AdminSupportTicketListSerializer by default. Add "resolved_at"
 * to AdminSupportTicketListSerializer.Meta.fields in serializers.py if
 * you want this average to actually compute.
 */
export function buildResolutionSummary(tickets = []) {
  const total = tickets.length;
  let resolvedOrClosed = 0;
  let pending = 0; // open + in_progress + awaiting_customer
  let resolvedWithTimestamp = 0;
  let totalResolutionMs = 0;

  for (const t of tickets) {
    if (!t) continue;

    if (t.status === "resolved" || t.status === "closed") {
      resolvedOrClosed += 1;
    }

    if (
      t.status === "open" ||
      t.status === "in_progress" ||
      t.status === "awaiting_customer"
    ) {
      pending += 1;
    }

    if (t.status === "resolved" && t.resolved_at && t.created_at) {
      const start = new Date(t.created_at).getTime();
      const end = new Date(t.resolved_at).getTime();
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
        resolvedWithTimestamp += 1;
        totalResolutionMs += end - start;
      }
    }
  }

  const resolutionRate =
    total > 0 ? Math.round((resolvedOrClosed / total) * 100) : 0;

  const pendingPercent =
    total > 0 ? Math.round((pending / total) * 100) : 0;

  const avgResolutionHours =
    resolvedWithTimestamp > 0
      ? Math.round((totalResolutionMs / resolvedWithTimestamp / 36e5) * 10) / 10
      : null;

  return {
    total,
    resolvedOrClosed,
    pending,
    pendingPercent,
    resolutionRate,
    avgResolutionHours,
    resolvedWithTimestamp,
  };
}

/**
 * Attach a `percent` field (0-100, integer) to any array of rows that
 * have either `count` or `value`. Used by charts to display both the
 * raw number and its share of the total.
 */
export function withPercentages(rows = []) {
  const total = rows.reduce((sum, r) => {
    const n = r.count ?? r.value ?? 0;
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return rows.map((r) => {
    const n = r.count ?? r.value ?? 0;
    const percent = total > 0 ? Math.round((n / total) * 100) : 0;
    return { ...r, percent };
  });
}