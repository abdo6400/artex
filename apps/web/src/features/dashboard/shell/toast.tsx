"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "./icons";

type Tone = "success" | "error" | "info";
type Toast = {
  id: number;
  tone: Tone;
  message: string;
  action?: { label: string; run: () => void };
};
type ToastApi = {
  notify: (message: string, tone?: Tone, action?: Toast["action"]) => void;
};

const ToastContext = createContext<ToastApi>({ notify: () => undefined });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback<ToastApi["notify"]>(
    (message, tone = "success", action) => {
      const id = nextId.current++;
      setToasts((current) => [
        ...current.slice(-3),
        { id, tone, message, action },
      ]);
      window.setTimeout(() => dismiss(id), action ? 7000 : 4500);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.tone}`}>
            <Icon
              name={
                toast.tone === "error"
                  ? "alert"
                  : toast.tone === "info"
                    ? "sparkle"
                    : "check"
              }
            />
            <span>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  toast.action?.run();
                  dismiss(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              className="toast-close"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
