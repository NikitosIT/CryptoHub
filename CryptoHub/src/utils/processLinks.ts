export function processLinks(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("a").forEach((a) => {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer nofollow ugc");
        a.classList.add(
            "no-underline",
            "text-sky-400",
            "hover:underline",
            "hover:text-sky-600",
        );
    });
    return doc.body.innerHTML;
}
