"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}

type ToastFn = (message: string, type?: ToastType) => void;

const ToastContext = createContext<ToastFn | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    // Remove from DOM after fade-out animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const toast: ToastFn = useCallback(
    (message, type = "success") => {
      const id = nextId++;
      setToasts((prev) => {
        const next = [...prev, { id, message, type, exiting: false }];
        // Keep max 3 visible — mark oldest for exit
        if (next.filter((t) => !t.exiting).length > 3) {
          const oldest = next.find((t) => !t.exiting);
          if (oldest) oldest.exiting = true;
          setTimeout(() => {
            setToasts((p) => p.filter((t) => t.id !== oldest?.id));
          }, 200);
        }
        return next;
      });

      // Auto-dismiss after 2s
      setTimeout(() => removeToast(id), 2000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation on next frame
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const borderColor = toast.type === "error" ? "border-red-500/60" : "border-green-500/60";
  const textColor = toast.type === "error" ? "text-red-400" : "text-green-400";

  return (
    <div
      className={`
        pointer-events-auto rounded-lg border bg-zinc-900 px-4 py-2.5 text-sm shadow-lg
        transition-all duration-200 ease-out
        ${borderColor} ${textColor}
        ${visible && !toast.exiting ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}
      `}
    >
      {toast.message}
    </div>
  );
}

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
