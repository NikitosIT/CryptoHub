const DEFAULT_DELAY_MS = 500;

type Resolver = {
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
};

type PendingCall = {
  timer?: ReturnType<typeof setTimeout>;
  resolvers: Resolver[];
};

const pending = new Map<string, PendingCall>();

export async function debounceAsync<T>(
  key: string,
  fn: () => Promise<T>,
  delayMs = DEFAULT_DELAY_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let entry = pending.get(key);

    if (entry) {
      clearTimeout(entry.timer);
    } else {
      entry = { resolvers: [] };
      pending.set(key, entry);
    }

    entry.resolvers.push({
      resolve(v) {
        resolve(v as T);
      },
      reject,
    });

    entry.timer = setTimeout(() => {
      pending.delete(key);

      fn()
        .then((result) => {
          entry.resolvers.forEach((r) => {
            r.resolve(result);
          });
        })
        .catch((error: unknown) => {
          entry.resolvers.forEach((r) => {
            r.reject(error);
          });
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
