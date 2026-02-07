"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAutosave<T>(options: {
  data: T;
  onSave: (data: T) => Promise<void>;
  delayMs?: number;
  enabled?: boolean;
}) {
  const { data, onSave, delayMs = 2000, enabled = true } = options;
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const dataStr = JSON.stringify(data);

  const save = useCallback(async () => {
    if (lastSavedRef.current === dataStr) return;
    setStatus("saving");
    try {
      await onSave(data);
      lastSavedRef.current = dataStr;
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }, [data, dataStr, onSave]);

  useEffect(() => {
    if (!enabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(save, delayMs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [dataStr, delayMs, enabled, save]);

  return { status, save };
}
