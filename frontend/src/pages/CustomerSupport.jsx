import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LifeBuoy, Plus, X, ChevronRight, Inbox } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { createSupportTicket, getMySupportTickets, getOrders } from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import TicketStatusBadge from "../components/TicketStatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import { ListRowSkeleton } from "../components/Skeletons";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import "./CustomerSupport.css";

const CATEGORY_OPTIONS = [
  { value: "order_issue", label: "Order Issue" },
  { value: "payment_issue", label: "Payment Issue" },
  { value: "product_issue", label: "Product Issue" },
  { value: "delivery_issue", label: "Delivery Issue" },
  { value: "account_issue", label: "Account Issue" },
  { value: "custom_jewellery_issue", label: "Custom Jewellery Issue" },
  { value: "other", label: "Other" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_customer", label: "Awaiting Your Reply" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const emptyForm = { category: "order_issue", order_id: "", subject: "", priority: "medium", description: "" };

export default function CustomerSupport() {
  const toast = useToast();
  const formRef = useRef(null);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = useCallback(() => {
    setLoading(true);
    setError(false);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    getMySupportTickets(params)
      .then(setTickets)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [statusFilter, priorityFilter]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  // Orders are only needed to populate the optional "link an order" dropdown
  // — fetched once, lazily, the first time the create form is opened.
  const ordersLoadedRef = useRef(false);
  useEffect(() => {
    if (!showForm || ordersLoadedRef.current) return;
    ordersLoadedRef.current = true;
    getOrders().then(setOrders).catch(() => setOrders([]));
  }, [showForm]);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openForm = () => {
    setShowForm(true);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setErrors({});
  };

  const validate = () => {
    const next = {};

    // ✅ Subject sirf tab required hai jab Category = "Other" ho.
    if (form.category === "other" && !form.subject.trim()) {
      next.subject = "Subject is required.";
    }

    if (!form.description.trim()) next.description = "Please describe the issue.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      // ✅ Agar Category "Other" nahi hai, to subject ke liye category
      // ka label + description ka pehla hissa auto-generate karo.
      // Isse backend ko empty subject nahi milta aur existing
      // SupportTicket model bina change chalta hai.
      const categoryLabel =
        CATEGORY_OPTIONS.find((c) => c.value === form.category)?.label ||
        "Support Request";

      const finalSubject =
        form.category === "other"
          ? form.subject.trim()
          : `${categoryLabel} — ${form.description.trim().slice(0, 60)}${form.description.trim().length > 60 ? "…" : ""}`;

      await createSupportTicket({
        category: form.category,
        subject: finalSubject,
        description: form.description.trim(),
        priority: form.priority,
        order_id: form.order_id ? Number(form.order_id) : null,
      });
      toast.success("Your support ticket has been created.");
      closeForm();
      loadTickets();
    } catch (err) {
      toast.error(err.message || "Could not create the ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container support-page">
      <Breadcrumbs items={[{ label: "Customer Support" }]} />

      {/* =========================================================
          HEADER — icon + text ek line me, CTA right side
          ========================================================= */}
      <div className="support-header">
        <div className="support-header-main">
          <div className="support-header-icon">
            <LifeBuoy aria-hidden="true" />
          </div>

          <div className="support-header-text">
            <h1 className="heading-lg">Customer Support</h1>
            <p className="text-muted">
              Have an issue with an order, payment, or product? Raise a ticket and our team will get back to you here.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => (showForm ? closeForm() : openForm())}
        >
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Create Support Ticket</>}
        </button>
      </div>

      {/* =========================================================
          CREATE FORM PANEL
          ========================================================= */}
      {showForm && (
        <div className="support-panel" ref={formRef}>
          <h2 className="heading-md">New Support Ticket</h2>

          <form className="support-form" onSubmit={handleSubmit} noValidate>
            <div className="support-form-grid">
              <div className="field">
                <label>Category</label>
                <select className="input" value={form.category} onChange={setField("category")}>
                  {CATEGORY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <div className="field">
                <label>Priority</label>
                <select className="input" value={form.priority} onChange={setField("priority")}>
                  {PRIORITY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              {orders.length > 0 && (
                <div className="field support-grid-full">
                  <label>Related Order (optional)</label>
                  <select className="input" value={form.order_id} onChange={setField("order_id")}>
                    <option value="">No specific order</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>#{o.order_id} — {new Date(o.created_at).toLocaleDateString("en-IN")}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* ✅ Subject field sirf tab dikhta hai jab Category = "Other" ho.
                  Baaki categories me category khud issue batati hai. */}
              {form.category === "other" && (
                <div className="field support-grid-full">
                  <label>Subject</label>
                  <input
                    className={`input ${errors.subject ? "has-error" : ""}`}
                    value={form.subject}
                    onChange={setField("subject")}
                    placeholder="A short summary of the issue"
                  />
                  {errors.subject && <p className="field-error">{errors.subject}</p>}
                </div>
              )}

              <div className="field support-grid-full">
                <label>Description</label>
                <textarea
                  className={`textarea ${errors.description ? "has-error" : ""}`}
                  value={form.description}
                  onChange={setField("description")}
                  placeholder="Tell us what happened, including any order ID or details that would help us assist you."
                  rows={5}
                />
                {errors.description && <p className="field-error">{errors.description}</p>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting && <span className="btn-spinner" />} {submitting ? "Submitting…" : "Submit Ticket"}
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          TICKET LIST PANEL
          ========================================================= */}
      <div className="support-panel">
        <div className="support-list-header">
          <h2 className="heading-md">My Support Tickets</h2>

          <div className="support-filters">
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_FILTER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select className="input" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              {PRIORITY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {loading && <ListRowSkeleton count={4} />}

        {!loading && error && <ErrorState title="Couldn't load your tickets" onRetry={loadTickets} />}

        {/* ✅ EmptyState me ab koi action button nahi — sirf message.
            Primary CTA top-right header me hai. Isse duplicate button nahi dikhega. */}
        {!loading && !error && tickets.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="No support tickets yet"
            message='Click "Create Support Ticket" at the top to raise your first ticket.'
          />
        )}

        {!loading && !error && tickets.length > 0 && (
          <ul className="ticket-list">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link to={`/customer-support/${ticket.ticket_id}`} className="ticket-card">
                  <div className="ticket-card-top">
                    <div>
                      <strong>#{ticket.ticket_id}</strong>
                      <span className="text-muted">{ticket.subject}</span>
                    </div>
                    <TicketStatusBadge status={ticket.status} />
                  </div>
                  <div className="ticket-card-bottom">
                    <span>{ticket.category_display}</span>
                    <PriorityBadge priority={ticket.priority} />
                    <span className="text-muted">{new Date(ticket.created_at).toLocaleDateString("en-IN")}</span>
                    <ChevronRight size={16} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}