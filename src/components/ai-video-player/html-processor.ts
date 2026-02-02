/**
 * HTML Content Processor
 * Responsible for processing and fixing HTML content for different content types
 */

import { ContentType } from './types';

/**
 * Get the common libraries and styles for iframe content
 */
function getCommonLibraries(): string {
    return `
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/MotionPathPlugin.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
        <script src="https://unpkg.com/rough-notation/lib/rough-notation.iife.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/vivus@0.4.6/dist/vivus.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    `;
}

/**
 * Get base styles for all content types
 */
function getBaseStyles(): string {
    return `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Inter:wght@400;600&family=Fira+Code&display=swap');

            :root {
                --text-color: #1e293b;
                --text-secondary: #475569;
                --primary-color: #2563eb;
                --accent-color: #f59e0b;
                --background-color: #ffffff;
            }

            * { box-sizing: border-box; }

            body {
                margin: 0;
                padding: 0;
                font-family: 'Inter', sans-serif;
                background: var(--background-color);
                color: var(--text-color);
            }

            .text-display { font-family: 'Montserrat', sans-serif; font-size: 64px; font-weight: 800; line-height: 1.1; }
            .text-h2 { font-family: 'Montserrat', sans-serif; font-size: 48px; font-weight: 700; margin-bottom: 16px; }
            .text-body { font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 400; line-height: 1.5; }
            .text-label { font-family: 'Fira Code', monospace; font-size: 18px; text-transform: uppercase; letter-spacing: 0.1em; }

            .full-screen-center {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 60px 80px;
            }

            .highlight {
                background: linear-gradient(120deg, rgba(255, 226, 89, 0.6) 0%, rgba(255, 233, 148, 0.4) 100%);
                padding: 0 4px;
                border-radius: 4px;
            }

            .emphasis { color: var(--primary-color); font-weight: bold; }
            .mermaid { display: flex; justify-content: center; width: 100%; margin: 20px auto; }

            .layout-split {
                display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
                width: 90%; max-width: 1700px; align-items: center;
            }
        </style>
    `;
}

/**
 * Get print-specific styles for WORKSHEET content
 */
function getWorksheetStyles(): string {
    return `
        <style>
            @media print {
                body { background: white !important; }
                .no-print, .nav-controls, .audio-player { display: none !important; }
                .worksheet-container { max-width: 100%; padding: 20px; }
                .worksheet-header { page-break-after: avoid; }
                .worksheet-section { page-break-inside: avoid; }
            }

            .worksheet-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
            }

            .answer-line {
                border-bottom: 2px solid #ccc;
                min-height: 40px;
                margin: 10px 0;
            }

            .checkbox-item {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 8px 0;
            }

            .checkbox-item input[type="checkbox"] {
                width: 20px;
                height: 20px;
            }
        </style>
    `;
}

/**
 * Get code playground specific styles
 */
function getCodePlaygroundStyles(): string {
    return `
        <style>
            .code-editor {
                font-family: 'Fira Code', monospace;
                background: #1e1e1e;
                color: #d4d4d4;
                padding: 16px;
                border-radius: 8px;
                overflow-x: auto;
            }

            .run-button {
                background: #10b981;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: background 0.2s;
            }

            .run-button:hover {
                background: #059669;
            }

            .output-panel {
                background: #0f172a;
                color: #22c55e;
                padding: 16px;
                border-radius: 8px;
                font-family: 'Fira Code', monospace;
                margin-top: 16px;
                min-height: 100px;
            }

            .hint-toggle {
                color: #3b82f6;
                cursor: pointer;
                text-decoration: underline;
            }
        </style>
    `;
}

/**
 * Get conversation/dialogue specific styles
 */
function getConversationStyles(): string {
    return `
        <style>
            .conversation-container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }

            .message-bubble {
                margin: 16px 0;
                padding: 16px 20px;
                border-radius: 20px;
                max-width: 80%;
            }

            .message-bubble.left {
                background: #e2e8f0;
                margin-right: auto;
                border-bottom-left-radius: 4px;
            }

            .message-bubble.right {
                background: #3b82f6;
                color: white;
                margin-left: auto;
                border-bottom-right-radius: 4px;
            }

            .audio-btn {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 20px;
                opacity: 0.7;
                transition: opacity 0.2s;
            }

            .audio-btn:hover {
                opacity: 1;
            }

            .translation-toggle {
                font-size: 12px;
                color: #64748b;
                margin-top: 8px;
                cursor: pointer;
            }

            .translation-text {
                font-size: 14px;
                color: #94a3b8;
                font-style: italic;
                margin-top: 8px;
            }
        </style>
    `;
}

/**
 * Get timeline specific styles
 */
function getTimelineStyles(): string {
    return `
        <style>
            .timeline-container {
                position: relative;
                padding: 20px 0;
            }

            .timeline-line {
                position: absolute;
                left: 50%;
                top: 0;
                bottom: 0;
                width: 4px;
                background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
                transform: translateX(-50%);
            }

            .timeline-event {
                display: flex;
                align-items: center;
                margin: 40px 0;
                position: relative;
            }

            .timeline-event.left {
                flex-direction: row-reverse;
                text-align: right;
            }

            .timeline-dot {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #3b82f6;
                border: 4px solid white;
                box-shadow: 0 0 0 4px #3b82f6;
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
            }

            .timeline-content {
                width: 45%;
                padding: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }

            .timeline-date {
                color: #64748b;
                font-size: 14px;
                font-weight: 600;
            }
        </style>
    `;
}

/**
 * Get helper scripts for interactivity
 */
function getHelperScripts(): string {
    return `
        <script>
            // Re-render Math using KaTeX
            window.renderMath = function(selector) {
                if (window.renderMathInElement && window.katex) {
                    const el = selector ? (typeof selector === 'string' ? document.querySelector(selector) : selector) : document.body;
                    if(el) {
                        try {
                            renderMathInElement(el, {
                                delimiters: [
                                    {left: '$$', right: '$$', display: true},
                                    {left: '$', right: '$', display: false},
                                ],
                                throwOnError: false
                            });
                        } catch (e) {
                            console.warn('KaTeX render error:', e);
                        }
                    }
                }
            };

            // Highlight Code using Prism
            window.highlightCode = function() {
                if (window.Prism) {
                    Prism.highlightAll();
                }
            };

            // Animation helpers
            window.fadeIn = function(selector, duration, delay) {
                try {
                    gsap.fromTo(selector,
                        {opacity: 0},
                        {opacity: 1, duration: duration || 0.5, delay: delay || 0, ease: 'power2.out'}
                    );
                } catch (e) { console.warn('fadeIn error', e); }
            };

            window.popIn = function(selector, duration, delay) {
                try {
                    gsap.fromTo(selector,
                        {opacity: 0, scale: 0.85},
                        {opacity: 1, scale: 1, duration: duration || 0.4, delay: delay || 0, ease: 'back.out(1.7)'}
                    );
                } catch (e) { console.warn('popIn error', e); }
            };

            window.slideUp = function(selector, duration, delay) {
                try {
                    gsap.fromTo(selector,
                        {opacity: 0, y: 30},
                        {opacity: 1, y: 0, duration: duration || 0.5, delay: delay || 0, ease: 'power2.out'}
                    );
                } catch (e) { console.warn('slideUp error', e); }
            };

            // Initialize on load
            window.addEventListener('load', () => {
                if(window.gsap && window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);
                if(window.mermaid) mermaid.initialize({startOnLoad:true});
                if(window.renderMathInElement && window.katex) window.renderMath();
                if(window.Prism) window.highlightCode();
            });
        </script>
    `;
}

/**
 * Process HTML content based on content type
 */
export function processHtmlContent(html: string, contentType: ContentType = 'VIDEO'): string {
    let processedHtml = html;

    // Fix any absolute file paths
    processedHtml = processedHtml.replace(/file:\/\/\/.*\/generated_images\//g, '');

    // Build the complete HTML with appropriate libraries and styles
    const libs = getCommonLibraries();
    const baseStyles = getBaseStyles();
    const helperScripts = getHelperScripts();

    // Add content-type specific styles
    let contentStyles = '';
    switch (contentType) {
        case 'WORKSHEET':
            contentStyles = getWorksheetStyles();
            break;
        case 'CODE_PLAYGROUND':
            contentStyles = getCodePlaygroundStyles();
            break;
        case 'CONVERSATION':
            contentStyles = getConversationStyles();
            break;
        case 'TIMELINE':
            contentStyles = getTimelineStyles();
            break;
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${libs}
            ${baseStyles}
            ${contentStyles}
        </head>
        <body>
            ${processedHtml}
            ${helperScripts}
        </body>
        </html>
    `;
}

/**
 * Legacy function for backward compatibility
 */
export function fixHtmlContent(html: string): string {
    return processHtmlContent(html, 'VIDEO');
}
