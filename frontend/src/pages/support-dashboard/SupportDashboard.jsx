
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  FolderOpen,
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { getSupportStats } from "../../services/adminSupportService";
import "./SupportDashboard.css";

const CARDS = [
  {
    key: "total",
    label: "Total Tickets",
    icon: Ticket,
    iconClass: "total",
  },
  {
    key: "open",
    label: "Open",
    icon: FolderOpen,
    iconClass: "open",
  },
  {
    key: "in_progress",
    label: "In Progress",
    icon: Clock3,
    iconClass: "progress",
  },
  {
    key: "resolved",
    label: "Resolved",
    icon: CheckCircle2,
    iconClass: "resolved",
  },
  {
    key: "closed",
    label: "Closed",
    icon: XCircle,
    iconClass: "closed",
  },
];

export default function SupportDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);

    getSupportStats()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="sd-home">
      {/* Page heading */}
      <div className="sd-home-head">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your customer support activity</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="sd-dashboard-state">
          <span>Loading statistics…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="sd-error">
          <span>Couldn't load statistics.</span>

          <button type="button" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {/* Dashboard */}
      {!loading && !error && stats && (
        <>
          {/* Statistics */}
          <section className="sd-stat-section">
            <div className="sd-section-title-row">
              <h2>Ticket Overview</h2>
            </div>

            <div className="sd-cards">
              {CARDS.map((card) => {
                const Icon = card.icon;

                return (
                  <div className="sd-card" key={card.key}>
                    <div className={`sd-card-icon sd-card-icon-${card.iconClass}`}>
                      <Icon size={20} strokeWidth={1.8} />
                    </div>

                    <div className="sd-card-content">
                      <div className="sd-card-value">
                        {stats[card.key] ?? 0}
                      </div>

                      <div className="sd-card-label">
                        {card.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="sd-quick-actions">
            <div className="sd-section-title-row">
              <h2>Quick Actions</h2>
            </div>

            <div className="sd-actions">
              <Link
                to="/support-dashboard/tickets"
                className="sd-action-card"
              >
                <div className="sd-action-content">
                  <div className="sd-action-icon">
                    <Ticket size={20} strokeWidth={1.8} />
                  </div>

                  <div>
                    <h3>Manage tickets</h3>
                    <p>
                      View every customer ticket, respond and update its
                      status.
                    </p>
                  </div>
                </div>

                <ArrowRight
                  className="sd-action-arrow"
                  size={20}
                  strokeWidth={1.8}
                />
              </Link>

              <Link
                to="/support-dashboard/tickets?status=open"
                className="sd-action-card"
              >
                <div className="sd-action-content">
                  <div className="sd-action-icon">
                    <FolderOpen size={20} strokeWidth={1.8} />
                  </div>

                  <div>
                    <h3>Open tickets</h3>
                    <p>
                      Tickets that haven't been picked up yet.
                    </p>
                  </div>
                </div>

                <ArrowRight
                  className="sd-action-arrow"
                  size={20}
                  strokeWidth={1.8}
                />
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

