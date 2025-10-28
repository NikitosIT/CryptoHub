export function getFileTypeLabel(mime?: string) {
    if (!mime) return "Файл";
    if (mime.includes("pdf")) return "PDF документ";
    if (mime.includes("zip")) return "Архив ZIP";
    if (mime.includes("excel")) return "Таблица Excel";
    if (mime.includes("word")) return "Документ Word";
    if (mime.includes("text")) return "Текстовый файл";
    return "Файл";
}

/// Реаоизовать чтобы при наведение показывалась маленькая модалка с именем файла
