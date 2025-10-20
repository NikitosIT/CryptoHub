// utils/safeLogError.ts
export function safeLogError(err: unknown, context?: string) {
    const prefix = context ? `[${context}]` : "";

    if (err instanceof Error) {
        console.error(`${prefix} ❌ ${err.message}`);
    } else if (typeof err === "string") {
        console.error(`${prefix} ❌ ${err}`);
    } else if (typeof err === "object" && err !== null) {
        console.error(`${prefix} ❌`, JSON.stringify(err, null, 2));
    } else {
        console.error(`${prefix} ❌ Unknown error`, err);
    }
}
