import { useEffect, useState } from "react";

const DEFAULT_COUNTDOWN_DURATION = 60000;
const STORAGE_KEY_PREFIX = "countdown_";

interface UseCountdownOptions {
  duration?: number;
  storageKey?: string;
}

function getStorageKey(key?: string): string | null {
  if (!key) return null;
  return `${STORAGE_KEY_PREFIX}${key}`;
}

function loadCountdownFromStorage(storageKey: string | null): number | null {
  if (!storageKey || typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const storedDate = parseInt(stored, 10);
    if (isNaN(storedDate)) return null;

    if (storedDate > Date.now()) {
      return storedDate;
    }

    localStorage.removeItem(storageKey);
    return null;
  } catch (error) {
    console.error("Failed to load countdown from localStorage:", error);
    return null;
  }
}

function saveCountdownToStorage(
  storageKey: string | null,
  date: number | null,
): void {
  if (!storageKey || typeof window === "undefined") return;

  try {
    if (date === null) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, date.toString());
    }
  } catch {
    // Ignore write errors
  }
}

export function useCountdown({
  duration = DEFAULT_COUNTDOWN_DURATION,
  storageKey,
}: UseCountdownOptions = {}) {
  const fullStorageKey = getStorageKey(storageKey);

  const [countdownDate, setCountdownDate] = useState<number | null>(() => {
    return loadCountdownFromStorage(fullStorageKey);
  });

  useEffect(() => {
    const stored = loadCountdownFromStorage(fullStorageKey);
    setCountdownDate(stored);
  }, [fullStorageKey]);

  useEffect(() => {
    saveCountdownToStorage(fullStorageKey, countdownDate);
  }, [countdownDate, fullStorageKey]);

  const start = () => {
    const endDate = Date.now() + duration;
    setCountdownDate(endDate);
  };

  const handleComplete = () => {
    setCountdownDate(null);
    saveCountdownToStorage(fullStorageKey, null);
  };

  const isActive = countdownDate !== null && countdownDate > Date.now();

  return {
    countdownDate,
    isActive,
    start,
    handleComplete,
  };
}
