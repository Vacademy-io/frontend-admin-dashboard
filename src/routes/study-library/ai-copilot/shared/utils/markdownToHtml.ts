/**
 * Convert markdown to HTML, handling mermaid code blocks specially
 * Extracts mermaid code blocks and converts them to <div class="mermaid">...</div>
 * Converts the rest of the markdown to HTML
 */

export function markdownToHtml(markdown: string): string {
    if (!markdown) return '';

    // Check if content is markdown (has markdown syntax)
    const hasMarkdownSyntax = /^#+\s|^\*\s|^-\s|^\d+\.\s|```|\[.*\]\(.*\)/m.test(markdown);
    
    if (!hasMarkdownSyntax) {
        // Not markdown, return as-is (might be HTML already)
        return markdown;
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
                htmlLines.push(`<p>${paraText}</p>`);
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
    html = html
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic (but not if it's part of bold)
        .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Replace mermaid placeholders with <div class="mermaid">...</div>
    mermaidBlocks.forEach(({ code, placeholder }) => {
        html = html.replace(placeholder, `<div class="mermaid">${code}</div>`);
    });

    return html;
}
