const DEFAULT_DELAY_MS = 500;

type Resolver = {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
};

interface PendingCall {
  timer?: ReturnType<typeof setTimeout>;
  resolvers: Resolver[];
}

const pending = new Map<string, PendingCall>();

export function debounceAsync<T>(
  key: string,
  fn: () => Promise<T>,
  delayMs = DEFAULT_DELAY_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let entry = pending.get(key);

    if (!entry) {
      entry = { resolvers: [] };
      pending.set(key, entry);
    } else {
      clearTimeout(entry.timer);
    }

    entry.resolvers.push({
      resolve: (v) => resolve(v as T),
      reject,
    });

    entry.timer = setTimeout(() => {
      pending.delete(key);

      fn()
        .then((result) => {
          entry.resolvers.forEach((r) => r.resolve(result));
        })
        .catch((error) => {
          entry.resolvers.forEach((r) => r.reject(error));
        });
    }, delayMs);
  });
}

export function cancelDebounce(key: string) {
  const entry = pending.get(key);
  if (!entry) return;

  clearTimeout(entry.timer);
  pending.delete(key);
}
