import { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";
import { getProducts } from "../services/api";
import ProductImage from "./ProductImage";
import { formatINR } from "../utils/formatINR";
import "./SearchBar.css";

export default function SearchBar({ autoFocus = false, onNavigate }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const debounced = useDebounce(query, 350);
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const abortControllerRef = useRef(null);
  const currentTermRef = useRef("");

  useEffect(() => {
    const term = debounced.trim();
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (!term) {
      setResults([]);
      setLoading(false);
      setError(false);
      currentTermRef.current = "";
      return;
    }

    // If it's the same term and already loaded, don't fetch again
    if (currentTermRef.current === term && results.length > 0) {
      return;
    }

    currentTermRef.current = term;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(false);

    getProducts({ search: term, available: "true" }, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setResults(data.slice(0, 6));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [debounced, results.length]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showPanel = focused && query.trim().length > 0;

  const goToResults = () => {
    if (!query.trim()) return;
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    setFocused(false);
    onNavigate?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") goToResults();
    if (e.key === "Escape") setFocused(false);
  };

  return (
    <div className="search-bar" ref={wrapRef}>
      <div className="search-input-wrap">
        {/* <Search className="search-icon" size={17} aria-hidden="true" /> */}
        <input
          type="search"
          className="search-input"
          placeholder="Search for rings, earrings, necklaces…"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search products"
        />
        {query && (
          <button 
            className="search-clear" 
            onClick={() => { 
              setQuery(""); 
              setResults([]); 
              setError(false);
              currentTermRef.current = "";
              if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
              }
            }} 
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="search-panel">
          {loading && (
            <div className="search-state">
              <Loader2 className="spin" size={18} /> Searching…
            </div>
          )}

          {!loading && error && <div className="search-state">Couldn't load results. Try again.</div>}

          {!loading && !error && results.length === 0 && (
            <div className="search-state">No products found for "{query}".</div>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <ul className="search-results">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/products/${product.id}`}
                      onClick={() => { setFocused(false); onNavigate?.(); }}
                      className="search-result"
                    >
                      <div className="search-result-image">
                        <ProductImage src={product.images?.[0]?.image || product.image} alt={product.name} />
                      </div>
                      <div className="search-result-info">
                        <span className="search-result-name">{product.name}</span>
                        <span className="search-result-meta">
                          {product.category}
                          {product.category ? " · " : ""}
                          {formatINR(product.price)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <button className="search-view-all" onClick={goToResults}>
                View all results for "{query}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}


