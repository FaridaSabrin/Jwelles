import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import {
  getStaffTicket,
  sendStaffReply,
  updateStaffTicket,
} from "../../services/adminSupportService";
import "./SupportDashboardTicketDetail.css";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_customer", label: "Awaiting Customer" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const formatDateTime = (v) =>
  v
    ? new Date(v).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

export default function SupportDashboardTicketDetail() {
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getStaffTicket(ticketId)
      .then(setTicket)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReply = async (e) => {
    e.preventDefault();
    const text = reply.trim();
    if (!text) return;

    setSendError("");
    setSendSuccess("");
    try {
      setSending(true);
      await sendStaffReply(ticketId, text);
      setReply("");
      setSendSuccess("Message sent.");
      await load();
    } catch (err) {
      setSendError(err.message || "Could not send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === ticket.status) return;

    setUpdatingStatus(true);
    try {
      const updated = await updateStaffTicket(ticketId, { status: newStatus });
      setTicket(updated);
    } catch (err) {
      alert(err.message || "Could not update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    if (newPriority === ticket.priority) return;

    setUpdatingPriority(true);
    try {
      const updated = await updateStaffTicket(ticketId, {
        priority: newPriority,
      });
      setTicket(updated);
    } catch (err) {
      alert(err.message || "Could not update priority.");
    } finally {
      setUpdatingPriority(false);
    }
  };

  if (loading) {
    return <div className="sd-muted">Loading ticket…</div>;
  }

  if (error || !ticket) {
    return (
      <div className="sd-error">
        Ticket not found.{" "}
        <button type="button" onClick={load}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="sd-detail">
      <Link to="/support-dashboard/tickets" className="sd-back">
        <ArrowLeft size={16} /> Back to Tickets
      </Link>

      <div className="sd-detail-head">
        <div>
          <h1>{ticket.subject}</h1>
          <p className="sd-muted">
            Ticket #{ticket.ticket_id} · Opened {formatDateTime(ticket.created_at)}
          </p>
        </div>
        <span className={`sd-pill sd-status-${ticket.status}`}>
          {ticket.status_display}
        </span>
      </div>

      <div className="sd-detail-grid">
        <div className="sd-panel">
          <h2>Ticket Information</h2>
          <div className="sd-info-row">
            <span>Category</span>
            <strong>{ticket.category_display}</strong>
          </div>
          <div className="sd-info-row">
            <span>Created</span>
            <strong>{formatDateTime(ticket.created_at)}</strong>
          </div>
          <div className="sd-info-row">
            <span>Updated</span>
            <strong>{formatDateTime(ticket.updated_at)}</strong>
          </div>

          <div className="sd-info-row">
            <span>Status</span>
            <select
              className="sd-input"
              value={ticket.status}
              onChange={handleStatusChange}
              disabled={updatingStatus}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sd-info-row">
            <span>Priority</span>
            <select
              className="sd-input"
              value={ticket.priority}
              onChange={handlePriorityChange}
              disabled={updatingPriority}
            >
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sd-panel">
          <h2>Customer Information</h2>
          <div className="sd-info-row">
            <span>Name</span>
            <strong>{ticket.user?.name}</strong>
          </div>
          <div className="sd-info-row">
            <span>Email</span>
            <strong>{ticket.user?.email}</strong>
          </div>
        </div>

        {ticket.order && (
          <div className="sd-panel">
            <h2>Related Order</h2>
            <div className="sd-info-row">
              <span>Order ID</span>
              <strong>#{ticket.order.order_id}</strong>
            </div>
            <div className="sd-info-row">
              <span>Status</span>
              <strong>{ticket.order.status}</strong>
            </div>
            <div className="sd-info-row">
              <span>Date</span>
              <strong>{formatDateTime(ticket.order.created_at)}</strong>
            </div>
            <div className="sd-info-row">
              <span>Total</span>
              <strong>₹{ticket.order.total}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="sd-panel sd-conversation">
        <h2>Conversation</h2>

        <div className="sd-messages">
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((m) => (
              <div
                key={m.id}
                className={`sd-message ${
                  m.is_admin_reply ? "is-admin" : "is-customer"
                }`}
              >
                <div className="sd-message-head">
                  <strong>
                    {m.is_admin_reply
                      ? "Support Team"
                      : m.sender?.name || "Customer"}
                  </strong>
                  <span className="sd-muted-sm">
                    {formatDateTime(m.created_at)}
                  </span>
                </div>
                <p>{m.message}</p>
              </div>
            ))
          ) : (
            <p className="sd-muted">No messages yet.</p>
          )}
        </div>

        <form className="sd-reply" onSubmit={handleReply}>
          <textarea
            className="sd-input sd-textarea"
            rows={4}
            placeholder="Write a reply…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            disabled={sending}
          />

          {sendError && <div className="sd-error">{sendError}</div>}
          {sendSuccess && <div className="sd-success">{sendSuccess}</div>}

          <div className="sd-reply-actions">
            <button
              type="submit"
              className="sd-btn"
              disabled={sending || !reply.trim()}
            >
              {sending ? "Sending…" : (
                <>
                  <Send size={14} /> Send Reply
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}