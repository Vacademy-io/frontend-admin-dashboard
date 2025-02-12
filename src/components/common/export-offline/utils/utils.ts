export function parseHtmlToString(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || doc.body.innerText || "";
}

export function extractImagesFromHtml(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const images = Array.from(doc.body.querySelectorAll("img")).map((img) => img);
    return images;
}

/**
 * Processes an HTML string and extracts its content and images
 * @param htmlString The HTML string to process
 * @returns An array of content items (text or image)
 */
export const processHtmlString = (htmlString: string) => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;

    // Array to store processed content
    const processedContent: Array<{ type: "text" | "image"; content: string }> = [];

    // Iterate through child nodes
    tempDiv.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            // Process text nodes
            const trimmedText = node.textContent?.trim();
            if (trimmedText) {
                processedContent.push({
                    type: "text",
                    content: trimmedText,
                });
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;

            // Process image nodes
            if (element.tagName.toLowerCase() === "img") {
                const src = element.getAttribute("src");
                if (src) {
                    processedContent.push({
                        type: "image",
                        content: src,
                    });
                }
            } else {
                // Process other elements' text content
                const text = element.textContent?.trim();
                if (text) {
                    processedContent.push({
                        type: "text",
                        content: text,
                    });
                }
            }
        }
    });

    return processedContent;
};
