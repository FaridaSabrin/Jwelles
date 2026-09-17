
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, Eye, Search } from "lucide-react";
import {
  getStaffTickets,
  getSupportStats,
} from "../../services/adminSupportService";
import "./SupportDashboardTickets.css";

const STATUS_OPTIONS = [
  { value: "", label: "All", key: "total" },
  { value: "open", label: "Open", key: "open" },
  {
    value: "in_progress",
    label: "In Progress",
    key: "in_progress",
  },
  {
    value: "awaiting_customer",
    label: "Awaiting",
    key: "awaiting_customer",
  },
  {
    value: "resolved",
    label: "Resolved",
    key: "resolved",
  },
  { value: "closed", label: "Closed", key: "closed" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All", key: "total" },
  {
    value: "order_issue",
    label: "Order Issue",
    key: "order_issue",
  },
  {
    value: "payment_issue",
    label: "Payment Issue",
    key: "payment_issue",
  },
  {
    value: "product_issue",
    label: "Product Issue",
    key: "product_issue",
  },
  {
    value: "delivery_issue",
    label: "Delivery Issue",
    key: "delivery_issue",
  },
  {
    value: "account_issue",
    label: "Account Issue",
    key: "account_issue",
  },
  {
    value: "custom_jewellery",
    label: "Custom Jewellery",
    key: "custom_jewellery",
  },
  {
    value: "other",
    label: "Other",
    key: "other",
  },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function SupportDashboardTickets() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsError, setStatsError] = useState("");

  const [search, setSearch] = useState(
    searchParams.get("search") || "",
  );

  const [status, setStatus] = useState(
    searchParams.get("status") || "",
  );

  const [category, setCategory] = useState(
    searchParams.get("category") || "",
  );

  const [dateFrom, setDateFrom] = useState(
    searchParams.get("date_from") || "",
  );

  const [dateTo, setDateTo] = useState(
    searchParams.get("date_to") || "",
  );

  const [sort, setSort] = useState(
    searchParams.get("sort") || "newest",
  );

  const [page, setPage] = useState(
    Number(searchParams.get("page") || 1) || 1,
  );

  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("page_size") || 10) || 10,
  );

  /*
   * IMPORTANT:
   * Statistics are loaded separately from the filtered ticket list.
   *
   * Therefore:
   * - Clicking a 0-count filter does NOT make all counts 0.
   * - Status/category counts always represent the complete ticket set.
   */
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError("");

    try {
      const response = await getSupportStats();

      const statistics =
        response?.stats ||
        response?.statistics ||
        response?.counts ||
        response ||
        null;

      setStats(statistics);
    } catch (err) {
      setStatsError(
        err.message || "Could not load ticket statistics.",
      );
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /*
   * Load only the tickets displayed in the table.
   * This can be filtered by status/category/search/date.
   */
  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getStaffTickets({
        search: search || undefined,
        status: status || undefined,
        category: category || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        sort,
        page,
        page_size: pageSize,
      });

      const resultTickets = Array.isArray(response)
        ? response
        : response?.results || response?.tickets || [];

      setTickets(resultTickets);
    } catch (err) {
      setError(err.message || "Could not load tickets.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    status,
    category,
    dateFrom,
    dateTo,
    sort,
    page,
    pageSize,
  ]);

  /*
   * Load permanent counts once when the page opens.
   */
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  /*
   * Load table data whenever filters/pagination change.
   */
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  /*
   * Keep the URL synchronized with the selected filters.
   */
  useEffect(() => {
    const next = new URLSearchParams();

    if (search) {
      next.set("search", search);
    }

    if (status) {
      next.set("status", status);
    }

    if (category) {
      next.set("category", category);
    }

    if (dateFrom) {
      next.set("date_from", dateFrom);
    }

    if (dateTo) {
      next.set("date_to", dateTo);
    }

    if (sort && sort !== "newest") {
      next.set("sort", sort);
    }

    if (page > 1) {
      next.set("page", String(page));
    }

    if (pageSize !== 10) {
      next.set("page_size", String(pageSize));
    }

    setSearchParams(next, { replace: true });
  }, [
    search,
    status,
    category,
    dateFrom,
    dateTo,
    sort,
    page,
    pageSize,
    setSearchParams,
  ]);

  /*
   * Always get counts from the unfiltered statistics response.
   *
   * Never calculate counts from `tickets`, because `tickets`
   * contains only the currently selected filter result.
   */
  const getFilterCount = (key) => {
    if (!stats) {
      return 0;
    }

    return Number(stats[key] ?? 0);
  };

  const totalCount = getFilterCount("total");

  /*
   * If backend provides a filtered total/count, use it for pagination.
   * Otherwise fall back to the current result length.
   */
  const filteredTotal =
    stats?.filtered_total ??
    stats?.filtered_count ??
    stats?.count ??
    (tickets.length < pageSize
      ? (page - 1) * pageSize + tickets.length
      : page * pageSize);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTotal / pageSize),
  );

  const visiblePage = Math.min(page, totalPages);

  const handleStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleCategory = (value) => {
    setCategory(value);
    setPage(1);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleDateFrom = (event) => {
    setDateFrom(event.target.value);
    setPage(1);
  };

  const handleDateTo = (event) => {
    setDateTo(event.target.value);
    setPage(1);
  };

  const handleSort = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const handlePageSize = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  return (
    <div className="sd-tickets-page">
      <div className="sd-tickets-head">
        <div>
          <h1>Tickets</h1>
          <p>
            Manage and respond to customer support requests
          </p>
        </div>

        <div className="sd-ticket-count">
          {totalCount}{" "}
          {totalCount === 1 ? "ticket" : "tickets"}
        </div>
      </div>

      <section className="sd-ticket-filters">
        {/* SEARCH */}

        <div className="sd-search-wrap">
          <Search size={18} strokeWidth={1.8} />

          <input
            type="search"
            value={search}
            onChange={handleSearch}
            placeholder="Search tickets..."
            aria-label="Search tickets"
          />
        </div>

        {/* STATUS */}

        <div className="sd-filter-section">
          <div className="sd-filter-label">STATUS</div>

          <div className="sd-filter-chips">
            {STATUS_OPTIONS.map((option) => {
              const active = status === option.value;

              return (
                <button
                  key={option.value || "all-status"}
                  type="button"
                  className={`sd-filter-chip ${
                    active ? "is-active" : ""
                  }`}
                  onClick={() =>
                    handleStatus(option.value)
                  }
                >
                  <span>{option.label}</span>

                  <strong>
                    {statsLoading
                      ? "—"
                      : getFilterCount(option.key)}
                  </strong>
                </button>
              );
            })}
          </div>
        </div>

        {/* CATEGORY */}

        <div className="sd-filter-section">
          <div className="sd-filter-label">
            CATEGORY
          </div>

          <div className="sd-filter-chips">
            {CATEGORY_OPTIONS.map((option) => {
              const active = category === option.value;

              return (
                <button
                  key={option.value || "all-category"}
                  type="button"
                  className={`sd-filter-chip ${
                    active ? "is-active" : ""
                  }`}
                  onClick={() =>
                    handleCategory(option.value)
                  }
                >
                  <span>{option.label}</span>

                  <strong>
                    {statsLoading
                      ? "—"
                      : getFilterCount(option.key)}
                  </strong>
                </button>
              );
            })}
          </div>
        </div>

        {/* DATE + SORT */}

        <div className="sd-date-sort-row">
          <label className="sd-date-field">
            <span>From Date</span>

            <div className="sd-date-input-wrap">
              <CalendarDays
                size={16}
                strokeWidth={1.8}
              />

              <input
                type="date"
                value={dateFrom}
                onChange={handleDateFrom}
              />
            </div>
          </label>

          <label className="sd-date-field">
            <span>To Date</span>

            <div className="sd-date-input-wrap">
              <CalendarDays
                size={16}
                strokeWidth={1.8}
              />

              <input
                type="date"
                value={dateTo}
                onChange={handleDateTo}
              />
            </div>
          </label>

          <label className="sd-sort-field">
            <span>Sort</span>

            <select
              value={sort}
              onChange={handleSort}
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>
            </select>
          </label>
        </div>

        {statsError && (
          <div className="sd-stats-warning">
            Ticket counts could not be loaded.
            <button
              type="button"
              onClick={loadStats}
            >
              Retry
            </button>
          </div>
        )}
      </section>

      {/* TABLE LOADING */}

      {loading && (
        <div className="sd-ticket-state">
          <span>Loading tickets…</span>
        </div>
      )}

      {/* TABLE ERROR */}

      {!loading && error && (
        <div className="sd-error sd-ticket-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadTickets}
          >
            Retry
          </button>
        </div>
      )}

      {/* TABLE */}

      {!loading && !error && (
        <>
          <div className="sd-ticket-table-wrap">
            <table className="sd-ticket-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="sd-view-column">
                    View
                  </th>
                </tr>
              </thead>

              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="sd-empty">
                        No tickets found for the
                        selected filters.
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr
                      key={
                        ticket.id ||
                        ticket.ticket_id
                      }
                    >
                      <td>
                        <strong className="sd-ticket-id">
                          #{ticket.ticket_id}
                        </strong>
                      </td>

                      <td>
                        <div className="sd-customer">
                          <strong>
                            {ticket.user?.name ||
                              "—"}
                          </strong>

                          <span>
                            {ticket.user?.email ||
                              "—"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="sd-subject">
                          {ticket.subject ||
                            "—"}
                        </div>
                      </td>

                      <td>
                        <span className="sd-category">
                          {ticket.category_display ||
                            ticket.category ||
                            "—"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`sd-pill sd-status-${ticket.status}`}
                        >
                          {ticket.status_display ||
                            ticket.status ||
                            "—"}
                        </span>
                      </td>

                      <td>
                        <span className="sd-created">
                          {formatDate(
                            ticket.created_at,
                          )}
                        </span>
                      </td>

                      <td className="sd-view-column">
                        <Link
                          to={`/support-dashboard/tickets/${ticket.ticket_id}`}
                          className="sd-view-btn"
                          aria-label={`View ticket ${ticket.ticket_id}`}
                          title="View ticket"
                        >
                          <Eye
                            size={18}
                            strokeWidth={1.8}
                          />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="sd-ticket-pagination">
            <button
              type="button"
              disabled={visiblePage <= 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1),
                )
              }
            >
              Previous
            </button>

            <span>
              <strong>{visiblePage}</strong>{" "}
              of {totalPages}
            </span>

            <button
              type="button"
              disabled={
                visiblePage >= totalPages
              }
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    totalPages,
                    current + 1,
                  ),
                )
              }
            >
              Next
            </button>

            <label className="sd-page-size">
              <select
                value={pageSize}
                onChange={handlePageSize}
              >
                {PAGE_SIZE_OPTIONS.map(
                  (size) => (
                    <option
                      key={size}
                      value={size}
                    >
                      {size} / page
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>
        </>
      )}
    </div>
  );
}

