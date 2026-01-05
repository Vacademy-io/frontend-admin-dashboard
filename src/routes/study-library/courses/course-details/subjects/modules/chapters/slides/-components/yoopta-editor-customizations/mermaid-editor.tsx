import { Suspense, lazy } from 'react';
import { YooptaPlugin } from '@yoopta/editor';
import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { sanitizeMermaidCode } from '@/routes/study-library/ai-copilot/shared/utils/mermaidSanitizer';

// Initialize mermaid once globally
let mermaidInitialized = false;

const initializeMermaid = () => {
    if (!mermaidInitialized) {
        try {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose',
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true,
                    curve: 'basis',
                },
            });
            mermaidInitialized = true;
            console.log('✅ [MermaidPlugin] Mermaid initialized');
        } catch (error) {
            console.error('❌ [MermaidPlugin] Error initializing mermaid:', error);
        }
    }
};

interface MermaidBlockProps {
    element: any;
    attributes: any;
    children: React.ReactNode;
    updateElementProps?: (props: any) => void;
}

export function MermaidBlock({
    element,
    attributes,
    children,
    updateElementProps,
}: MermaidBlockProps) {
    const initialCode = element?.props?.code || '';
    const [code, setCode] = useState(initialCode);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isRendering, setIsRendering] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const renderedCodeRef = useRef<string>('');

    // Initialize mermaid on mount
    useEffect(() => {
        try {
            initializeMermaid();
        } catch (error) {
            console.error('❌ [MermaidBlock] Failed to initialize mermaid:', error);
            setError('Failed to initialize mermaid');
        }
    }, []);

    // Sync code with Yoopta block state
    useEffect(() => {
        if (updateElementProps) {
            updateElementProps({
                code,
                timestamp: Date.now(),
            });
        }
    }, [code, updateElementProps]);

    // Render mermaid diagram
    useEffect(() => {
        if (!code || code.trim() === '') {
            setSvg('');
            setError('');
            return;
        }

        // Skip if code hasn't changed
        if (renderedCodeRef.current === code.trim()) {
            return;
        }

        const renderMermaid = async () => {
            try {
                setIsRendering(true);
                setError('');

                // Check if mermaid is available
                if (!mermaid || typeof mermaid.initialize !== 'function' || typeof mermaid.render !== 'function') {
                    console.error('❌ [MermaidBlock] Mermaid library not available');
                    setError('Mermaid library not loaded');
                    setSvg('');
                    return;
                }

                // Ensure mermaid is initialized
                initializeMermaid();

                let cleanCode = code.trim();

                // Remove "mermaid " prefix if present
                if (cleanCode.toLowerCase().startsWith('mermaid ')) {
                    cleanCode = cleanCode.substring(8).trim();
                }

                if (!cleanCode) {
                    setSvg('');
                    return;
                }

                // Sanitize mermaid code to fix common syntax issues
                cleanCode = sanitizeMermaidCode(cleanCode);

                // Generate a unique render ID
                const renderId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Render the diagram
                const result = await mermaid.render(renderId, cleanCode);

                if (result && result.svg) {
                    setSvg(result.svg);
                    renderedCodeRef.current = cleanCode;
                    setError('');
                } else {
                    throw new Error('mermaid.render() did not return SVG');
                }
            } catch (renderError) {
                console.error('❌ [MermaidBlock] Render error:', renderError);
                setError(renderError instanceof Error ? renderError.message : 'Unknown error');
                setSvg('');
            } finally {
                setIsRendering(false);
            }
        };

        renderMermaid();
    }, [code]);

    return (
        <div
            {...attributes}
            className="yoopta-mermaid-block"
            style={{
                margin: '20px 0',
                padding: '15px',
                backgroundColor: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '8px',
                maxWidth: '100%',
                overflow: 'auto',
            }}
        >
            {isRendering && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Rendering diagram...
                </div>
            )}

            {error && (
                <div style={{
                    padding: '15px',
                    border: '1px solid #ff9800',
                    borderRadius: '4px',
                    background: '#fff3e0',
                    color: '#e65100',
                    marginBottom: '10px',
                }}>
                    <strong>⚠️ Diagram rendering failed:</strong> {error}
                    <pre style={{
                        marginTop: '10px',
                        fontSize: '11px',
                        overflowX: 'auto',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        color: '#333',
                    }}>{code}</pre>
                </div>
            )}

            {svg && !isRendering && (
                <div
                    ref={containerRef}
                    dangerouslySetInnerHTML={{ __html: svg }}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'auto',
                    }}
                />
            )}

            {!svg && !isRendering && !error && code && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No diagram to display
                </div>
            )}

            <style>{`
                .yoopta-mermaid-block svg {
                    max-width: 100% !important;
                    width: 100% !important;
                    height: auto !important;
                }
            `}</style>
        </div>
    );
}

// Yoopta Plugin Definition
export const MermaidPlugin = new YooptaPlugin<{ mermaid: any }>({
    type: 'mermaid',
    elements: {
        mermaid: {
            render: MermaidBlock,
        },
    },
    options: {
        display: {
            title: 'Mermaid Diagram',
            description: 'Add a mermaid diagram',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
        },
        shortcuts: ['mermaid', 'diagram', 'graph'],
    },
    parsers: {
        html: {
            deserialize: {
                nodeNames: ['DIV'],
                parse: (element) => {
                    // Check if this is a mermaid div
                    if (element.classList?.contains('mermaid')) {
                        const code = element.textContent?.trim() || '';
                        return {
                            id: `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            type: 'mermaid',
                            props: {
                                code: code,
                            },
                            children: [{ text: '' }],
                        };
                    }
                    return undefined;
                },
            },
            serialize: (element, children) => {
                const code = element.props?.code || '';
                if (!code) {
                    return '<div class="mermaid"></div>';
                }
                return `<div class="mermaid">${code}</div>`;
            },
        },
    },
});



