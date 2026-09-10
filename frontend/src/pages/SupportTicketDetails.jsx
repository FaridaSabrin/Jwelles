import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Send, Lock, ShoppingBag } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { getSupportTicket, sendSupportMessage, closeSupportTicket } from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import TicketStatusBadge from "../components/TicketStatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import ErrorState from "../components/ErrorState";
import { ProductDetailsSkeleton } from "../components/Skeletons";
import "./SupportTicketDetails.css";

const formatDateTime = (value) => new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export default function SupportTicketDetails() {
  const { ticketId } = useParams();
  const toast = useToast();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getSupportTicket(ticketId).then(setTicket).catch(() => setError(true)).finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => { load(); window.scrollTo(0, 0); }, [load]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    try {
      setSending(true);
      await sendSupportMessage(ticketId, reply.trim());
      setReply("");
      await load();
    } catch (err) {
      toast.error(err.message || "Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm("Close this ticket? You can still view it later, but you won't be able to send further messages unless our team reopens it.")) return;

    try {
      setClosing(true);
      await closeSupportTicket(ticketId);
      toast.success("Ticket closed.");
      await load();
    } catch (err) {
      toast.error(err.message || "Could not close the ticket. Please try again.");
    } finally {
      setClosing(false);
    }
  };

  if (loading) return <div className="container"><ProductDetailsSkeleton /></div>;
  if (error || !ticket) return <div className="container"><ErrorState title="Ticket not found" onRetry={load} /></div>;

  const isClosed = ticket.status === "closed";

  return (
    <div className="container ticket-details-page">
      <Breadcrumbs items={[{ label: "Customer Support", to: "/customer-support" }, { label: `#${ticket.ticket_id}` }]} />

      <div className="ticket-details-head">
        <div>
          <h1 className="heading-lg">{ticket.subject}</h1>
          <p className="text-muted">Ticket #{ticket.ticket_id} · Opened on {formatDateTime(ticket.created_at)}</p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="ticket-details-meta">
        <div>
          <span className="text-muted">Category</span>
          <strong>{ticket.category_display}</strong>
        </div>
        <div>
          <span className="text-muted">Priority</span>
          <PriorityBadge priority={ticket.priority} />
        </div>
        <div>
          <span className="text-muted">Last Updated</span>
          <strong>{formatDateTime(ticket.updated_at)}</strong>
        </div>
        {ticket.order && (
          <div>
            <span className="text-muted">Related Order</span>
            <Link to={`/orders/${ticket.order.id}`} className="ticket-order-link"><ShoppingBag size={14} /> #{ticket.order.order_id}</Link>
          </div>
        )}
      </div>

      <div className="ticket-conversation">
        <h2 className="heading-sm">Conversation</h2>

        <div className="ticket-message-list">
          {ticket.messages.map((message) => (
            <div key={message.id} className={`ticket-message ${message.is_admin_reply ? "is-admin" : "is-customer"}`}>
              <div className="ticket-message-head">
                <strong>{message.is_admin_reply ? "Support Team" : (message.sender?.name || "You")}</strong>
                <span className="text-muted">{formatDateTime(message.created_at)}</span>
              </div>
              <p>{message.message}</p>
            </div>
          ))}
        </div>

        {isClosed ? (
          <div className="ticket-closed-notice">
            <Lock size={16} />
            <span>This ticket is closed and no longer accepts new messages.</span>
          </div>
        ) : (
          <form className="ticket-reply-form" onSubmit={handleReply}>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Write a follow-up message…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <div className="ticket-reply-actions">
              <button type="submit" className="btn btn-primary" disabled={sending || !reply.trim()}>
                {sending && <span className="btn-spinner" />} <Send size={15} /> {sending ? "Sending…" : "Send Message"}
              </button>
              <button type="button" className="btn btn-outline" onClick={handleClose} disabled={closing}>
                {closing ? "Closing…" : "Close Ticket"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
