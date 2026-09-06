import { useCallback, useRef, useState } from "react";
import { ToastContext } from "./ToastContextInstance";
import { CircleCheck, TriangleAlert, Info, X } from "lucide-react";



const ICONS = {
  success: CircleCheck,
  error: TriangleAlert,
  info: Info,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = "info") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => dismiss(id), 3600);
    return id;
  }, [dismiss]);

  const toast = {
    success: (message) => push(message, "success"),
    error: (message) => push(message, "error"),
    info: (message) => push(message, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map(({ id, message, type }) => {
          const Icon = ICONS[type] || Info;
          return (
            <div className={`toast toast-${type}`} key={id} role="status">
              <Icon className="toast-icon" aria-hidden="true" />
              <span className="toast-text">{message}</span>
              <button className="toast-close" onClick={() => dismiss(id)} aria-label="Dismiss notification">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};



