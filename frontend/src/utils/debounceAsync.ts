const DEFAULT_DELAY_MS = 1500;

interface PendingCall<T> {
  timer: ReturnType<typeof setTimeout>;
  resolvers: Array<{ resolve: (v: T) => void; reject: (e: unknown) => void }>;
}

const pending = new Map<string, PendingCall<unknown>>();

export function debounceAsync<T>(
  key: string,
  fn: () => Promise<T>,
  delayMs = DEFAULT_DELAY_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const existing = pending.get(key) as PendingCall<T> | undefined;

    if (existing) {
      clearTimeout(existing.timer);
      existing.resolvers.push({ resolve, reject });
    } else {
      pending.set(key, {
        timer: null!,
        resolvers: [{ resolve, reject }],
      } as PendingCall<unknown>);
    }

    const entry = pending.get(key) as PendingCall<T>;
    entry.timer = setTimeout(() => {
      pending.delete(key);
      fn()
        .then((result) => entry.resolvers.forEach((r) => r.resolve(result)))
        .catch((error) => entry.resolvers.forEach((r) => r.reject(error)));
    }, delayMs);
  });
}

export function cancelDebounce(key: string) {
  const entry = pending.get(key);
  if (!entry) return;

  clearTimeout(entry.timer);
  entry.resolvers.forEach((r) =>
    r.reject(new Error("Debounced call cancelled")),
  );
  pending.delete(key);
}
