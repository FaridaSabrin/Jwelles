import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMarketPrices } from "../hooks/useMarketPrices";
import { formatINR } from "../utils/formatINR";
import "./LiveMarketPrices.css";

const STATUS_META = {
  live:               { label: "Live",           modifier: "is-live" },
  cached:             { label: "Live",           modifier: "is-live" },
  stale:              { label: "Last known",     modifier: "is-stale" },
  unavailable:        { label: "Unavailable",    modifier: "is-unavailable" },
  reference_required: { label: "Reference only", modifier: "is-reference" },
};

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

function formatTimestamp(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * Generic currency-aware formatter. Never assumes INR.
 * The backend is responsible for the actual currency (e.g. Diamond
 * is converted USD->INR server-side and arrives as currency=INR).
 */
function formatPriceValue(amount, currency) {
  const num = Number(amount);
  if (Number.isNaN(num)) return null;
  const symbol = CURRENCY_SYMBOLS[currency] || "";
  const formatted = num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return symbol ? `${symbol}${formatted}` : `${formatted} ${currency || ""}`.trim();
}

function formatUnit(unit) {
  if (unit === "gram") return "g";
  if (unit === "carat") return "carat";
  return unit || "";
}

function ChangeIndicator({ change, changePercentage }) {
//   if (change === null || change === undefined || change === "") {
//     return <span className="market-change market-change-flat"><Minus size={12} /> —</span>;
//   }
  const numeric = Number(change);
//   if (Number.isNaN(numeric) || numeric === 0) {
//     return <span className="market-change market-change-flat"><Minus size={12} /> —</span>;
//   }
  const up = numeric > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const pct = changePercentage ? ` (${changePercentage}%)` : "";
  return (
    <span className={`market-change ${up ? "market-change-up" : "market-change-down"}`}>
      <Icon size={12} /> {up ? "+" : ""}{change}{pct}
    </span>
  );
}

function MetalTile({ metal }) {
  const status = STATUS_META[metal.data_status] || STATUS_META.unavailable;
  const hasPrice = metal.price !== null && metal.price !== undefined && metal.price !== "";

  return (
    <div className={`market-tile ${status.modifier}`}>
      <div className="market-tile-head">
        <span className="market-tile-name">{metal.material}</span>
        <span className={`market-tile-status ${status.modifier}`}>{status.label}</span>
      </div>

      {hasPrice ? (
        <p className="market-tile-price">
          {formatINR(Number(metal.price))}
          <span className="market-tile-unit">/ {formatUnit(metal.unit)}</span>
        </p>
      ) : (
        <p className="market-tile-price market-tile-price-muted">—</p>
      )}

      {/* {hasPrice && (
        <ChangeIndicator change={metal.change} changePercentage={metal.change_percentage} />
      )} */}

      {/* {metal.note && <p className="market-tile-note">{metal.note}</p>} */}
    </div>
  );
}

/**
 * Generic stone tile. Currency-aware, not INR-only.
 * Diamond currently arrives with currency=INR + unit=carat because
 * the backend converts USD->INR server-side.
 */
function StoneTile({ stone }) {
  const status = STATUS_META[stone.data_status] || STATUS_META.unavailable;
  const hasPrice =
    stone.price !== null && stone.price !== undefined && stone.price !== "";

  const formattedPrice = hasPrice
    ? formatPriceValue(stone.price, stone.currency)
    : null;

  return (
    <div className={`market-tile market-tile-stone ${status.modifier}`}>
      <div className="market-tile-head">
        <span className="market-tile-name">{stone.material}</span>
        <span className={`market-tile-status ${status.modifier}`}>{status.label}</span>
      </div>

      {formattedPrice ? (
        <p className="market-tile-price">
          {formattedPrice}
          <span className="market-tile-unit">/ {formatUnit(stone.unit)}</span>
        </p>
      ) : (
        <p className="market-tile-price market-tile-price-muted">—</p>
      )}

      {/* {stone.note && <p className="market-tile-note">{stone.note}</p>} */}
    </div>
  );
}

export default function LiveMarketPrices() {
  const { data, loading, error, lastFetched, refetch } = useMarketPrices();

  const metals = data?.metals || [];
  const stones = data?.stones || null;
  const stoneItems = stones?.items || [];
  const lastUpdated = data?.last_updated || (lastFetched ? lastFetched.toISOString() : null);

  return (
    <section className="section section-alt market-section">
      <div className="container">
        <div className="section-heading market-heading">
          <span className="eyebrow">Today's Rates</span>
          <h2 className="heading-lg">Live Market Prices</h2>
          <p className="section-sub">
            Indicative metal and diamond benchmark rates for reference.
            Final jewellery pricing includes making charges, purity, and
            stone valuation.
          </p>
        </div>

        {loading && (
          <div className="market-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="market-tile is-loading">
                <div className="market-tile-head">
                  <span className="market-tile-name skeleton-line skeleton-line-sm" />
                </div>
                <p className="market-tile-price skeleton-line skeleton-line-lg" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="market-error">
            <p>Unable to load live market prices right now.</p>
            <button className="btn btn-outline btn-sm" onClick={refetch}>
              <RefreshCw size={13} /> Try again
            </button>
          </div>
        )}

        {!loading && !error && metals.length > 0 && (
          <>
            <div className="market-grid">
              {metals.map((m) => <MetalTile key={m.material} metal={m} />)}
            </div>

            {stoneItems.length > 0 && (
              <>
                <h3 className="market-stones-heading">Gemstone Benchmarks</h3>
                <div className="market-grid market-grid-stones">
                  {stoneItems.map((s) => (
                    <StoneTile key={s.material} stone={s} />
                  ))}
                </div>
              </>
            )}

            <div className="market-footer">
              <span className="market-updated">
                {lastUpdated ? `Updated ${formatTimestamp(lastUpdated)}` : ""}
              </span>
              <button className="market-refresh" onClick={refetch} aria-label="Refresh market prices">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </>
        )}

        {!loading && !error && metals.length === 0 && (
          <div className="market-error">
            <p>Market prices are not available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}