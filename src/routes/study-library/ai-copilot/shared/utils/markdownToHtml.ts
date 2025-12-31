/**
 * Convert markdown to HTML, handling mermaid code blocks specially
 * Extracts mermaid code blocks and converts them to <div class="mermaid">...</div>
 * Converts the rest of the markdown to HTML
 */

/**
 * Converts ONLY mermaid code blocks to <div class="mermaid">...</div>
 * Useful when content is already HTML but contains mermaid code blocks
 */
export function convertMermaidCodeToDiv(text: string): string {
    if (!text) return '';

    // Check if there are any mermaid blocks
    if (!/```mermaid[\s\S]*?```/m.test(text)) {
        return text;
    }

    // Replace mermaid code blocks with div.mermaid
    // We use a regex that captures the code inside the block
    return text.replace(/```mermaid\s*\n?([\s\S]*?)\n?```/g, (match, code) => {
        // Preserve the exact mermaid code, trimming only leading/trailing whitespace
        const trimmedCode = code.trim();
        return `<div class="mermaid">\n${trimmedCode}\n</div>`;
    });
}

export function markdownToHtml(markdown: string): string {
    if (!markdown) return '';

    // Check if content is markdown (has markdown syntax)
    const hasMarkdownSyntax = /^#+\s|^\*\s|^-\s|^\d+\.\s|```|\[.*\]\(.*\)/m.test(markdown);

    // If it doesn't look like markdown, just check/convert mermaid blocks
    if (!hasMarkdownSyntax) {
        return convertMermaidCodeToDiv(markdown);
    }

    // Extract mermaid code blocks first
    const mermaidBlocks: Array<{ code: string; placeholder: string }> = [];
    let processedMarkdown = markdown;
    let mermaidIndex = 0;

    // Replace mermaid code blocks with placeholders
    processedMarkdown = processedMarkdown.replace(/```mermaid\s*\n?([\s\S]*?)\n?```/g, (match, code) => {
        const placeholder = `__MERMAID_PLACEHOLDER_${mermaidIndex}__`;
        mermaidBlocks.push({
            code: code.trim(),
            placeholder
        });
        mermaidIndex++;
        return `\n${placeholder}\n`;
    });

    // Also handle non-mermaid code blocks
    processedMarkdown = processedMarkdown.replace(/```(\w+)?\s*\n?([\s\S]*?)\n?```/g, (match, lang, code) => {
        if (lang === 'mermaid') return match; // Should have been replaced already
        // Preserve code formatting
        return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Convert markdown to HTML line by line
    const lines = processedMarkdown.split('\n');
    const htmlLines: string[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
        if (currentParagraph.length > 0) {
            const paraText = currentParagraph.join(' ').trim();
            if (paraText) {
                // Check if the paragraph is actually an HTML block (starts with <)
                // If so, don't wrap in <p>
                if (paraText.startsWith('<') && !paraText.startsWith('<a') && !paraText.startsWith('<span') && !paraText.startsWith('<strong') && !paraText.startsWith('<em') && !paraText.startsWith('<code')) {
                    htmlLines.push(paraText);
                } else {
                    htmlLines.push(`<p>${paraText}</p>`);
                }
            }
            currentParagraph = [];
        }
    };

    const flushList = () => {
        if (inList && listType) {
            htmlLines.push(`</${listType}>`);
            inList = false;
            listType = null;
        }
    };

    // Helper to check if a line is an HTML block tag
    const isHtmlBlock = (line: string): boolean => {
        const trimmed = line.trim();
        return /^\s*<(div|p|h[1-6]|ul|ol|li|blockquote|section|article|header|footer|nav|table|form|hr|br|pre|iframe)/i.test(trimmed);
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]?.trim() || '';

        // Check if this line is a mermaid placeholder
        if (line.startsWith('__MERMAID_PLACEHOLDER_') && line.endsWith('__')) {
            flushParagraph();
            flushList();
            htmlLines.push(line); // Keep placeholder as-is, will replace later
            continue;
        }

        if (!line) {
            flushParagraph();
            flushList();
            continue;
        }

        // If line is already HTML block, preserve it
        if (isHtmlBlock(line)) {
            flushParagraph();
            flushList();
            htmlLines.push(line);
            continue;
        }

        // Headers
        if (line.startsWith('### ')) {
            flushParagraph();
            flushList();
            htmlLines.push(`<h3>${line.substring(4)}</h3>`);
            continue;
        }
        if (line.startsWith('## ')) {
            flushParagraph();
            flushList();
            htmlLines.push(`<h2>${line.substring(3)}</h2>`);
            continue;
        }
        if (line.startsWith('# ')) {
            flushParagraph();
            flushList();
            htmlLines.push(`<h1>${line.substring(2)}</h1>`);
            continue;
        }

        // Unordered lists
        if (/^[\*\-\+]\s+/.test(line)) {
            flushParagraph();
            const listItem = line.replace(/^[\*\-\+]\s+/, '');
            if (!inList || listType !== 'ul') {
                flushList();
                htmlLines.push('<ul>');
                inList = true;
                listType = 'ul';
            }
            htmlLines.push(`<li>${listItem}</li>`);
            continue;
        }

        // Ordered lists
        if (/^\d+\.\s+/.test(line)) {
            flushParagraph();
            const listItem = line.replace(/^\d+\.\s+/, '');
            if (!inList || listType !== 'ol') {
                flushList();
                htmlLines.push('<ol>');
                inList = true;
                listType = 'ol';
            }
            htmlLines.push(`<li>${listItem}</li>`);
            continue;
        }

        // Regular paragraph text
        flushList();
        currentParagraph.push(line);
    }

    flushParagraph();
    flushList();

    let html = htmlLines.join('\n');

    // Process inline markdown in the HTML
    // Be careful not to replace things inside attributes or existing HTML tags
    // This is a naive implementation, but should work for basic content

    // We only apply inline formatting if there are no HTML tags in the text
    // or if we are careful. For safety, let's keep it simple for now. 
    // Ideally we should tokenize, but regex is what we have.

    html = html
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic (but not if it's part of bold)
        .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
        // Inline code (avoid converting inside existing HTML)
        .replace(/`([^`]+)`/g, (match, code) => {
            return `<code>${code}</code>`;
        })
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Replace mermaid placeholders with <div class="mermaid">...</div>
    mermaidBlocks.forEach(({ code, placeholder }) => {
        html = html.replace(placeholder, `<div class="mermaid">\n${code}\n</div>`);
    });

    return html;
}
