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

  const isError = toast.type === "error";
  const borderAccent = isError ? "border-l-2 border-l-red-500" : "border-l-2 border-l-green-500";
  const textColor = isError ? "text-red-400" : "text-green-400";

  return (
    <div
      className={`
        pointer-events-auto min-w-[280px] rounded-2xl backdrop-blur-xl bg-zinc-900/90 border border-zinc-800/50 px-4 py-3 text-sm shadow-2xl shadow-black/50
        transition-all duration-200 ease-out
        ${borderAccent} ${textColor}
        ${visible && !toast.exiting ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}
      `}
    >
      <span className="flex items-center gap-2">
        {isError ? (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
        {toast.message}
      </span>
    </div>
  );
}

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
