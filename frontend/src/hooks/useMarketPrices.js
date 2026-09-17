import { useCallback, useEffect, useRef, useState } from "react";
import { getMarketPrices } from "../services/api";

/**
 * Fetches the backend-proxied market prices endpoint.
 *
 * - Never calls the external provider directly from the browser.
 * - Does NOT poll on an interval (avoids hammering the API from every
 *   open tab). Manual `refetch()` is exposed for a user-triggered retry.
 * - Returns the raw response shape from /api/v1/market-prices/:
 *     { currency, unit, metals, stones, last_updated, cache_ttl_seconds }
 */
export function useMarketPrices() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const aliveRef = useRef(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getMarketPrices()
      .then((payload) => {
        if (!aliveRef.current) return;
        setData(payload);
        setLastFetched(new Date());
      })
      .catch(() => {
        if (!aliveRef.current) return;
        setError(true);
      })
      .finally(() => {
        if (!aliveRef.current) return;
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  return { data, loading, error, lastFetched, refetch: load };
}

export default useMarketPrices;