import createDOMPurify from "dompurify";

const DOMPurify = createDOMPurify(window);

export function sanitizeHtml(html: string) {
    const cleanHtml = DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ADD_TAGS: ["a"],
        ADD_ATTR: ["href", "target", "rel"],
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanHtml, "text/html");
    const currentHost = window.location.hostname;

    doc.querySelectorAll<HTMLAnchorElement>("a[target='_blank']").forEach(
        (a) => {
            const href = a.getAttribute("href") ?? "";
            const isExternal = !href.startsWith("/") &&
                !href.startsWith("#") &&
                !href.includes(currentHost);

            if (isExternal) {
                a.setAttribute("rel", "noopener noreferrer");
            }
        },
    );

    return doc.body.innerHTML;
}
