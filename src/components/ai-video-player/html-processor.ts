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

            html, body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                font-family: 'Inter', sans-serif;
                background: BODY_BACKGROUND_PLACEHOLDER;
                color: var(--text-color);
            }

            /* Ensure content is visible even if animations fail */
            body * {
                opacity: 1 !important;
                visibility: visible !important;
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
 * Get quiz-specific styles for interactive quizzes
 */
function getQuizStyles(): string {
    return `
        <style>
            /* Quiz Container */
            .quiz-container {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 80px;
                box-sizing: border-box;
                font-family: 'Inter', sans-serif;
            }

            .quiz-question-wrapper {
                max-width: 1200px;
                width: 100%;
                text-align: center;
            }

            /* Question Number Badge */
            .quiz-question-number {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                padding: 8px 24px;
                border-radius: 20px;
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 24px;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }

            /* Question Text */
            .quiz-question-text {
                font-family: 'Montserrat', sans-serif;
                font-size: 42px;
                font-weight: 700;
                line-height: 1.3;
                color: #0f172a;
                margin-bottom: 48px;
            }

            /* Options Container */
            .quiz-options {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                max-width: 1000px;
                margin: 0 auto;
            }

            .quiz-options.single-column {
                grid-template-columns: 1fr;
                max-width: 700px;
            }

            /* Individual Option */
            .quiz-option {
                display: flex;
                align-items: center;
                padding: 20px 28px;
                background: #f8fafc;
                border: 3px solid #e2e8f0;
                border-radius: 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
            }

            .quiz-option:hover {
                border-color: #3b82f6;
                background: #eff6ff;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
            }

            .quiz-option.selected {
                border-color: #3b82f6;
                background: #eff6ff;
            }

            .quiz-option.correct {
                border-color: #22c55e;
                background: #f0fdf4;
            }

            .quiz-option.correct .quiz-option-letter {
                background: #22c55e;
                border-color: #22c55e;
            }

            .quiz-option.incorrect {
                border-color: #ef4444;
                background: #fef2f2;
            }

            .quiz-option.incorrect .quiz-option-letter {
                background: #ef4444;
                border-color: #ef4444;
            }

            .quiz-option.disabled {
                pointer-events: none;
                opacity: 0.7;
            }

            /* Option Letter (A, B, C, D) */
            .quiz-option-letter {
                width: 44px;
                height: 44px;
                min-width: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                border: 2px solid #cbd5e1;
                border-radius: 12px;
                font-family: 'Montserrat', sans-serif;
                font-size: 18px;
                font-weight: 700;
                color: #475569;
                margin-right: 16px;
                transition: all 0.2s ease;
            }

            .quiz-option:hover .quiz-option-letter,
            .quiz-option.selected .quiz-option-letter {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
            }

            /* Option Text */
            .quiz-option-text {
                font-size: 20px;
                color: #1e293b;
                font-weight: 500;
                flex: 1;
            }

            /* Check Icon for correct/incorrect */
            .quiz-option-icon {
                width: 32px;
                height: 32px;
                margin-left: 12px;
                display: none;
            }

            .quiz-option.correct .quiz-option-icon.correct-icon,
            .quiz-option.incorrect .quiz-option-icon.incorrect-icon {
                display: block;
            }

            /* Submit/Check Button */
            .quiz-submit-btn {
                margin-top: 40px;
                padding: 16px 48px;
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
            }

            .quiz-submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
            }

            .quiz-submit-btn:disabled {
                background: #94a3b8;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }

            /* Feedback Container */
            .quiz-feedback {
                margin-top: 32px;
                padding: 24px 32px;
                border-radius: 16px;
                max-width: 800px;
                margin-left: auto;
                margin-right: auto;
                display: none;
            }

            .quiz-feedback.show {
                display: block;
                animation: slideUp 0.3s ease;
            }

            .quiz-feedback.correct {
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                border: 2px solid #22c55e;
            }

            .quiz-feedback.incorrect {
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
                border: 2px solid #ef4444;
            }

            .quiz-feedback-title {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .quiz-feedback.correct .quiz-feedback-title {
                color: #16a34a;
            }

            .quiz-feedback.incorrect .quiz-feedback-title {
                color: #dc2626;
            }

            .quiz-feedback-text {
                font-size: 18px;
                color: #475569;
                line-height: 1.5;
            }

            /* Progress indicator */
            .quiz-progress {
                position: absolute;
                top: 24px;
                right: 40px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .quiz-progress-text {
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
            }

            .quiz-progress-bar {
                width: 120px;
                height: 6px;
                background: #e2e8f0;
                border-radius: 3px;
                overflow: hidden;
            }

            .quiz-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                border-radius: 3px;
                transition: width 0.3s ease;
            }

            /* Score display */
            .quiz-score {
                position: absolute;
                top: 24px;
                left: 40px;
                background: #f1f5f9;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                color: #475569;
            }

            .quiz-score-correct {
                color: #22c55e;
            }

            /* Animations */
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            .quiz-option.incorrect {
                animation: shake 0.5s ease;
            }

            .quiz-option.correct {
                animation: pulse 0.5s ease;
            }

            /* Timer (optional) */
            .quiz-timer {
                position: absolute;
                top: 24px;
                left: 50%;
                transform: translateX(-50%);
                background: #fef3c7;
                border: 2px solid #f59e0b;
                padding: 8px 20px;
                border-radius: 20px;
                font-size: 16px;
                font-weight: 600;
                color: #92400e;
            }

            .quiz-timer.warning {
                background: #fee2e2;
                border-color: #ef4444;
                color: #dc2626;
                animation: pulse 1s infinite;
            }

            /* True/False specific styling */
            .quiz-options.true-false {
                grid-template-columns: repeat(2, 1fr);
                max-width: 600px;
            }

            .quiz-options.true-false .quiz-option {
                justify-content: center;
            }

            .quiz-options.true-false .quiz-option-letter {
                display: none;
            }

            .quiz-options.true-false .quiz-option-text {
                text-align: center;
                font-size: 24px;
            }

            /* Fill in the blank */
            .quiz-blank-input {
                display: inline-block;
                min-width: 150px;
                border: none;
                border-bottom: 3px solid #3b82f6;
                background: transparent;
                font-size: 24px;
                font-family: 'Inter', sans-serif;
                text-align: center;
                padding: 4px 8px;
                margin: 0 8px;
                outline: none;
            }

            .quiz-blank-input:focus {
                border-bottom-color: #8b5cf6;
            }

            .quiz-blank-input.correct {
                border-bottom-color: #22c55e;
                color: #22c55e;
            }

            .quiz-blank-input.incorrect {
                border-bottom-color: #ef4444;
                color: #ef4444;
            }

            /* Explanation toggle */
            .quiz-explanation-toggle {
                margin-top: 16px;
                color: #3b82f6;
                cursor: pointer;
                font-size: 14px;
                text-decoration: underline;
            }

            .quiz-explanation {
                margin-top: 12px;
                padding: 16px;
                background: #f8fafc;
                border-radius: 8px;
                font-size: 16px;
                color: #475569;
                display: none;
            }

            .quiz-explanation.show {
                display: block;
            }
        </style>
    `;
}

/**
 * Get flashcard specific styles
 */
function getFlashcardStyles(): string {
    return `
        <style>
            .flashcard-container {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                perspective: 1000px;
            }

            .flashcard {
                width: 600px;
                height: 400px;
                position: relative;
                transform-style: preserve-3d;
                transition: transform 0.6s;
                cursor: pointer;
            }

            .flashcard.flipped {
                transform: rotateY(180deg);
            }

            .flashcard-face {
                position: absolute;
                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                border-radius: 24px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            }

            .flashcard-front {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
            }

            .flashcard-back {
                background: white;
                color: #1e293b;
                transform: rotateY(180deg);
                border: 3px solid #e2e8f0;
            }

            .flashcard-label {
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                opacity: 0.8;
                margin-bottom: 16px;
            }

            .flashcard-content {
                font-size: 32px;
                font-weight: 600;
                text-align: center;
                line-height: 1.4;
            }

            .flashcard-hint {
                position: absolute;
                bottom: 20px;
                font-size: 14px;
                opacity: 0.7;
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

            // Fallback: Force all elements visible after a delay (in case GSAP fails to load)
            setTimeout(function() {
                document.querySelectorAll('[style*="opacity"]').forEach(function(el) {
                    el.style.opacity = '1';
                });
                document.querySelectorAll('[style*="visibility"]').forEach(function(el) {
                    el.style.visibility = 'visible';
                });
            }, 500);
        </script>
    `;
}

/**
 * Process HTML content based on content type
 */
export function processHtmlContent(
    html: string,
    contentType: ContentType = 'VIDEO',
    isOverlay: boolean = false
): string {
    let processedHtml = html;

    // Fix any absolute file paths
    processedHtml = processedHtml.replace(/file:\/\/\/.*\/generated_images\//g, '');

    // Remove opacity:0 from inline styles (backend sets these for animations, but they fail if GSAP doesn't load)
    // Match patterns like: style="opacity:0;" or style="opacity: 0; other-styles"
    processedHtml = processedHtml.replace(/opacity\s*:\s*0\s*;?/gi, '');

    // Build the complete HTML with appropriate libraries and styles
    const libs = getCommonLibraries();
    let baseStyles = getBaseStyles();

    // For overlay iframes, use transparent background so content below shows through
    const bodyBackground = isOverlay ? 'transparent' : 'var(--background-color)';
    baseStyles = baseStyles.replace('BODY_BACKGROUND_PLACEHOLDER', bodyBackground);

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
        case 'QUIZ':
            contentStyles = getQuizStyles();
            break;
        case 'FLASHCARDS':
            contentStyles = getFlashcardStyles();
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
