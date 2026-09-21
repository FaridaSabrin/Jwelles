// frontend/src/pages/support-dashboard/SupportCharts.jsx
import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    LabelList,
} from "recharts";
import { getStaffTickets } from "../../services/adminSupportService";
import {
    buildCreatedLast7Days,
    buildStatusDistribution,
    buildPriorityDistribution,
    buildResolutionSummary,
    withPercentages,
} from "../../utils/ticketChartHelpers";
import "./SupportCharts.css";

async function fetchAllTickets({ maxPages = 100 } = {}) {
    const all = [];
    let page = 1;

    while (page <= maxPages) {
        const data = await getStaffTickets({ page, page_size: 100 });
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) all.push(...data.results);
        if (!data?.next) break;
        page += 1;
    }
    return all;
}

// ---------------------------------------------------------------------------
// Custom tooltips
// ---------------------------------------------------------------------------
function CreatedTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) return null;
    const row = payload[0].payload;
    return (
        <div className="sd-chart-tooltip">
            <div className="sd-chart-tooltip-title">{row.date}</div>
            <div className="sd-chart-tooltip-row">
                <span className="sd-chart-tooltip-dot" style={{ background: "#8a5f2c" }} />
                Tickets: <strong>{row.count}</strong>
            </div>
            <div className="sd-chart-tooltip-row">
                Share of 7-day total: <strong>{row.percent}%</strong>
            </div>
        </div>
    );
}

function PriorityTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) return null;
    const row = payload[0].payload;
    return (
        <div className="sd-chart-tooltip">
            <div className="sd-chart-tooltip-title">{row.name}</div>
            <div className="sd-chart-tooltip-row">
                <span className="sd-chart-tooltip-dot" style={{ background: row.color }} />
                Tickets: <strong>{row.count}</strong>
            </div>
            <div className="sd-chart-tooltip-row">
                Share: <strong>{row.percent}%</strong>
            </div>
        </div>
    );
}

export default function SupportCharts() {
    const [tickets, setTickets] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = () => {
        setLoading(true);
        setError(false);
        fetchAllTickets()
            .then(setTickets)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const createdSeries = useMemo(
        () => (tickets ? withPercentages(buildCreatedLast7Days(tickets)) : []),
        [tickets]
    );
    const statusSeries = useMemo(
        () => (tickets ? withPercentages(buildStatusDistribution(tickets)) : []),
        [tickets]
    );
    const prioritySeries = useMemo(
        () => (tickets ? withPercentages(buildPriorityDistribution(tickets)) : []),
        [tickets]
    );
    const resolution = useMemo(
        () => (tickets ? buildResolutionSummary(tickets) : null),
        [tickets]
    );

    const hasTickets = tickets && tickets.length > 0;

    // Max value for line chart YAxis (adds headroom so point labels never clip)
    const createdMax = useMemo(() => {
        const m = createdSeries.reduce((mx, r) => Math.max(mx, r.count || 0), 0);
        return Math.max(1, m + 1);
    }, [createdSeries]);

    // Max value for priority chart XAxis (adds room for the right-side label)
    const priorityMax = useMemo(() => {
        const m = prioritySeries.reduce((mx, r) => Math.max(mx, r.count || 0), 0);
        return Math.max(1, m + 1);
    }, [prioritySeries]);

    const totalTickets = statusSeries.reduce((s, r) => s + (r.value || 0), 0);

    // Custom legend for donut — uses our own `percent` field, not Recharts'.
    const renderStatusLegend = (props) => {
        const { payload } = props;
        return (
            <ul className="sd-chart-legend">
                {payload.map((entry) => {
                    const row = entry.payload;
                    return (
                        <li key={row.key} className="sd-chart-legend-item">
                            <span
                                className="sd-chart-legend-dot"
                                style={{ background: row.color }}
                            />
                            <span className="sd-chart-legend-text">
                                {row.name} ({row.value}, {row.percent}%)
                            </span>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <section className="sd-charts-section">
            <div className="sd-section-title-row">
                <h2>Ticket Analytics</h2>
            </div>

            {loading && (
                <div className="sd-dashboard-state">
                    <span>Loading analytics…</span>
                </div>
            )}

            {!loading && error && (
                <div className="sd-error">
                    <span>Couldn't load analytics.</span>
                    <button type="button" onClick={load}>
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && !hasTickets && (
                <div className="sd-charts-empty">
                    No tickets yet — charts will appear as soon as the first ticket is
                    created.
                </div>
            )}

            {!loading && !error && hasTickets && (
                <div className="sd-charts-grid">
                    {/* ============================================================
              1 — Tickets Created — Last 7 Days
              Fixes:
                - margin.top + YAxis domain headroom  => labels no longer clip
                - custom LabelContent reads our own `percent` field
             ============================================================ */}
                    <div className="sd-chart-card sd-chart-card--wide">
                        <div className="sd-chart-card-head">
                            <h3>Tickets Created — Last 7 Days</h3>
                            <span className="sd-chart-card-sub">
                                Share % is out of the 7-day total
                            </span>
                        </div>
                        <div className="sd-chart-body">
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart
                                    data={createdSeries}
                                    margin={{ top: 32, right: 24, bottom: 8, left: -12 }}
                                >
                                    <CartesianGrid stroke="#efe4d3" strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: "#8c7f72", fontSize: 12 }}
                                        stroke="#e6dac8"
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        domain={[0, createdMax]}
                                        tick={{ fill: "#8c7f72", fontSize: 12 }}
                                        stroke="#e6dac8"
                                    />
                                    <Tooltip content={<CreatedTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Tickets"
                                        stroke="#8a5f2c"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: "#8a5f2c" }}
                                        activeDot={{ r: 6 }}
                                    >
                                        {/* Custom label content — reads row.percent directly */}
                                        <LabelList
                                            dataKey="count"
                                            content={({ x, y, value, payload }) => {
                                                const row = payload;
                                                if (!row) return null;
                                                const pct = row.percent ?? 0;
                                                const text = `${value} (${pct}%)`;
                                                const w = text.length * 6.5 + 8;
                                                return (
                                                    <g>
                                                        <rect
                                                            x={x - w / 2}
                                                            y={y - 26}
                                                            width={w}
                                                            height={18}
                                                            rx={5}
                                                            fill="#fffdfb"
                                                            stroke="#e6dac8"
                                                        />
                                                        <text
                                                            x={x}
                                                            y={y - 13}
                                                            textAnchor="middle"
                                                            fontSize={11}
                                                            fill="#4a4035"
                                                            fontWeight={600}
                                                        >
                                                            {text}
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                        />
                                    </Line>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ============================================================
              2 — Status Distribution
              Fixes:
                - slice % labels use our own row.percent (not Recharts')
             ============================================================ */}
                    <div className="sd-chart-card">
                        <div className="sd-chart-card-head">
                            <h3>Status Distribution</h3>
                        </div>
                        <div className="sd-chart-body">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart margin={{ top: 8, bottom: 8 }}>
                                    <Pie
                                        data={statusSeries}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        stroke="#fffdfb"
                                        strokeWidth={2}
                                        /* Custom label — we look up percent from OUR dataset,
                                           not from Recharts' internal `percent` (0-1 float). */
                                        label={({ index, x, y, cx, cy }) => {
                                            const row = statusSeries[index];
                                            if (!row || row.percent === 0) return null;
                                            // Position label outside the slice
                                            const midAngle = Math.atan2(y - cy, x - cx);
                                            const RAD = Math.PI / 180;
                                            const r = 110;
                                            const lx = cx + r * Math.cos(midAngle);
                                            const ly = cy + r * Math.sin(midAngle);
                                            return (
                                                <text
                                                    x={lx}
                                                    y={ly}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    fontSize={12}
                                                    fontWeight={650}
                                                    fill="#4a4035"
                                                >
                                                    {row.percent}%
                                                </text>
                                            );
                                        }}
                                        labelLine={false}
                                    >
                                        {statusSeries.map((row) => (
                                            <Cell key={row.key} fill={row.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 8,
                                            border: "1px solid #e6dac8",
                                            fontSize: 12,
                                        }}
                                        formatter={(value, name, props) => [
                                            `${value} (${props?.payload?.percent ?? 0}%)`,
                                            name,
                                        ]}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        content={renderStatusLegend}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="sd-chart-center">
                                <div className="sd-chart-center-value">{totalTickets}</div>
                                <div className="sd-chart-center-label">TOTAL</div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================================
              3 — Tickets by Priority
              Fixes:
                - horizontal bars, XAxis domain extended so right labels
                  have room and don't clip
             ============================================================ */}
                    <div className="sd-chart-card">
                        <div className="sd-chart-card-head">
                            <h3>Tickets by Priority</h3>
                        </div>
                        <div className="sd-chart-body">
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart
                                    layout="vertical"
                                    data={prioritySeries}
                                    margin={{ top: 10, right: 70, bottom: 8, left: 8 }}
                                >
                                    <CartesianGrid stroke="#efe4d3" strokeDasharray="3 3" />
                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                        domain={[0, priorityMax]}
                                        tick={{ fill: "#8c7f72", fontSize: 12 }}
                                        stroke="#e6dac8"
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fill: "#8c7f72", fontSize: 12 }}
                                        stroke="#e6dac8"
                                        width={70}
                                    />
                                    <Tooltip content={<PriorityTooltip />} />
                                    <Bar dataKey="count" name="Tickets" radius={[0, 6, 6, 0]}>
                                        {prioritySeries.map((row) => (
                                            <Cell key={row.key} fill={row.color} />
                                        ))}
                                        <LabelList
                                            dataKey="count"
                                            content={({ x, y, width, height, value, payload }) => {
                                                const row = payload;
                                                if (!row) return null;
                                                const pct = row.percent ?? 0;
                                                const text = `${value} (${pct}%)`;
                                                return (
                                                    <text
                                                        x={x + width + 8}
                                                        y={y + height / 2}
                                                        textAnchor="start"
                                                        dominantBaseline="middle"
                                                        fontSize={12}
                                                        fontWeight={650}
                                                        fill="#4a4035"
                                                    >
                                                        {text}
                                                    </text>
                                                );
                                            }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ============================================================
              4 — Resolution Summary
             ============================================================ */}
                    <div className="sd-chart-card">
                        <div className="sd-chart-card-head">
                            <h3>Resolution Summary</h3>
                        </div>
                        <div className="sd-chart-body sd-resolution-list">
                            <div className="sd-res-row">
                                <span className="sd-res-row-label">Total Tickets</span>
                                <span className="sd-res-row-value sd-res-blue">
                                    {resolution.total}
                                </span>
                            </div>

                            <div className="sd-res-row">
                                <span className="sd-res-row-label">
                                    Pending (Open + In Progress)
                                </span>
                                <span className="sd-res-row-value sd-res-orange">
                                    {resolution.pending}
                                    <span className="sd-res-row-pct">
                                        {" "}
                                        ({resolution.pendingPercent}%)
                                    </span>
                                </span>
                            </div>

                            <div className="sd-res-row">
                                <span className="sd-res-row-label">Resolved + Closed</span>
                                <span className="sd-res-row-value sd-res-green">
                                    {resolution.resolvedOrClosed}
                                    <span className="sd-res-row-pct">
                                        {" "}
                                        ({resolution.resolutionRate}%)
                                    </span>
                                </span>
                            </div>

                            <div className="sd-res-row sd-res-row--highlight">
                                <span className="sd-res-row-label">Resolution Rate</span>
                                <span className="sd-res-row-value sd-res-blue">
                                    {resolution.resolutionRate}%
                                </span>
                            </div>

                            <div className="sd-res-row">
                                <span className="sd-res-row-label">
                                    Avg. Resolution Time
                                    {resolution.avgResolutionHours == null && (
                                        <span className="sd-res-note">
                                            {" "}
                                            (no resolved timestamps yet)
                                        </span>
                                    )}
                                </span>
                                <span className="sd-res-row-value">
                                    {resolution.avgResolutionHours == null
                                        ? "—"
                                        : `${resolution.avgResolutionHours}h`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}