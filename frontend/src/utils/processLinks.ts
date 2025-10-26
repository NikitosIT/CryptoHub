export function processLinks(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");

    doc.querySelectorAll("a").forEach((a) => {
        a.classList.add(
            "no-underline",
            "text-sky-400",
            "hover:underline",
            "hover:text-sky-600",
        );

        const currentRel = a.getAttribute("rel") || "";
        const newRel = `${currentRel} nofollow ugc`.trim();
        a.setAttribute("rel", newRel);

        if (!a.hasAttribute("target")) {
            a.setAttribute("target", "_blank");
        }
    });

    return doc.body.innerHTML;
}
