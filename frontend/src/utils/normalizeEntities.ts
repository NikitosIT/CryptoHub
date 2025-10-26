import type { MessageEntity } from "@telegraf/entity/types/types";

export function normalizeEntities(raw: unknown): MessageEntity[] {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw as MessageEntity[];

    if (typeof raw === "object") return [raw as MessageEntity];

    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed as MessageEntity[];
            if (parsed && typeof parsed === "object") {
                return [parsed as MessageEntity];
            }
        } catch {
            // Игнорируем ошибку парсинга
        }
    }

    return [];
}
