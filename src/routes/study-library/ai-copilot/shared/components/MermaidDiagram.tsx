import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { sanitizeMermaidCode } from '../utils/mermaidSanitizer';

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
        } catch (error) {
            console.error('Error initializing mermaid:', error);
        }
    }
};

interface MermaidDiagramProps {
    /**
     * The mermaid diagram code (e.g., "graph TD\nA-->B")
     */
    code: string;
    /**
     * Optional className for the container
     */
    className?: string;
    /**
     * Optional unique ID for the diagram (auto-generated if not provided)
     */
    id?: string;
}

/**
 * MermaidDiagram component for client-side rendering of mermaid diagrams
 * 
 * This component initializes mermaid and renders diagrams from code.
 * It handles re-rendering when the code changes.
 */
export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ 
    code, 
    className = '', 
    id 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const diagramIdRef = useRef<string>(id || `mermaid-${Math.random().toString(36).substr(2, 9)}`);
    const renderedCodeRef = useRef<string>('');
    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string>('');

    // Log component mount and props
    useEffect(() => {
        console.log('🔵 [MermaidDiagram] Component mounted/updated', {
            hasCode: !!code,
            codeLength: code?.length || 0,
            codePreview: code?.substring(0, 100) || 'NO CODE',
            hasContainer: !!containerRef.current,
            id: id || diagramIdRef.current
        });
    }, [code, id]);

    useEffect(() => {
        // Initialize mermaid once globally
        try {
            console.log('🔵 [MermaidDiagram] Initializing mermaid...');
            initializeMermaid();
            console.log('✅ [MermaidDiagram] Mermaid initialized');
        } catch (error) {
            console.error('❌ [MermaidDiagram] Failed to initialize mermaid:', error);
        }
    }, []);

    useEffect(() => {
        console.log('🔵 [MermaidDiagram] useEffect triggered', {
            hasContainer: !!containerRef.current,
            hasCode: !!code,
            codeLength: code?.length || 0,
            codeTrimmed: code?.trim() || '',
            codePreview: code?.substring(0, 100) || 'NO CODE'
        });

        if (!containerRef.current) {
            console.warn('⚠️ [MermaidDiagram] Container ref is null, cannot render');
            return;
        }

        if (!code || code.trim() === '') {
            console.warn('⚠️ [MermaidDiagram] Code is empty or whitespace only');
            return;
        }

        // Skip if the code hasn't changed
        if (renderedCodeRef.current === code.trim()) {
            return;
        }

        // Reset error state
        setHasError(false);
        setErrorMessage('');

        const renderDiagram = async () => {
            try {
                // Clear previous content
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }

                let cleanCode = code.trim();
                if (!cleanCode) {
                    return;
                }
                
                // Remove "mermaid " prefix if present (safety check)
                if (cleanCode.toLowerCase().startsWith('mermaid ')) {
                    cleanCode = cleanCode.substring(8).trim();
                }
                
                if (!cleanCode) {
                    return;
                }

                // Sanitize mermaid code to fix common syntax issues
                cleanCode = sanitizeMermaidCode(cleanCode);

                // Ensure mermaid is initialized
                try {
                    initializeMermaid();
                } catch (initError) {
                    console.error('Mermaid initialization error:', initError);
                    throw new Error('Failed to initialize mermaid');
                }

                // Generate a unique render ID (must be unique per render call)
                const renderId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                // Use mermaid.render() API for v11 - this is the correct method
                try {
                    console.log('🎨 [MermaidDiagram] Rendering diagram, code length:', cleanCode.length, 'preview:', cleanCode.substring(0, 100));
                    const result = await mermaid.render(renderId, cleanCode);
                    
                        if (result && result.svg) {
                            // Successfully rendered - insert SVG with width constraints
                            console.log('✅ [MermaidDiagram] Diagram rendered successfully, SVG length:', result.svg.length);
                            if (containerRef.current) {
                                // Wrap SVG in a div with width constraints
                                const svgWrapper = document.createElement('div');
                                svgWrapper.style.cssText = 'width: 100%; max-width: 100%; overflow: auto; display: flex; justify-content: center;';
                                
                                // Create a temporary div to parse the SVG
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = result.svg;
                                const svgElement = tempDiv.querySelector('svg');
                                
                                if (svgElement) {
                                    // Set SVG to be responsive
                                    svgElement.setAttribute('width', '100%');
                                    svgElement.setAttribute('height', 'auto');
                                    svgElement.style.maxWidth = '100%';
                                    svgElement.style.height = 'auto';
                                    svgWrapper.appendChild(svgElement);
                                } else {
                                    svgWrapper.innerHTML = result.svg;
                                }
                                
                                containerRef.current.innerHTML = '';
                                containerRef.current.appendChild(svgWrapper);
                                renderedCodeRef.current = cleanCode;
                            }
                        } else {
                        console.error('❌ [MermaidDiagram] mermaid.render() did not return SVG, result:', result);
                        throw new Error('mermaid.render() did not return SVG');
                    }
                } catch (renderError) {
                    console.error('❌ [MermaidDiagram] Render error:', renderError);
                    console.error('❌ [MermaidDiagram] Failed code:', cleanCode);
                    // If render fails, show the code as text instead of breaking
                    if (containerRef.current) {
                        containerRef.current.innerHTML = `
                            <div style="padding: 15px; border: 1px solid #ff9800; border-radius: 4px; background: #fff3e0; max-width: 100%; overflow: hidden;">
                                <div style="font-size: 12px; color: #e65100; margin-bottom: 8px;">
                                    <strong>⚠️ Diagram rendering failed. Showing code:</strong>
                                </div>
                                <pre style="margin: 0; font-size: 11px; overflow-x: auto; word-break: break-word; white-space: pre-wrap; color: #333;">${cleanCode}</pre>
                            </div>
                        `;
                    }
                    setHasError(true);
                    setErrorMessage(renderError instanceof Error ? renderError.message : 'Unknown error');
                }
            } catch (error) {
                console.error('Error in renderDiagram:', error);
                // Don't break - just show error message
                if (containerRef.current) {
                    containerRef.current.innerHTML = `
                        <div style="padding: 15px; border: 1px solid #ff9800; border-radius: 4px; background: #fff3e0; max-width: 100%; overflow: hidden;">
                            <div style="font-size: 12px; color: #e65100; margin-bottom: 8px;">
                                <strong>⚠️ Diagram rendering failed. Showing code:</strong>
                            </div>
                            <pre style="margin: 0; font-size: 11px; overflow-x: auto; word-break: break-word; white-space: pre-wrap; color: #333;">${code}</pre>
                        </div>
                    `;
                }
                setHasError(true);
                setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
            }
        };

        renderDiagram();
    }, [code]);

    return (
        <div
            ref={containerRef}
            className={`mermaid-diagram-container ${className}`}
            style={{
                margin: '20px 0',
                padding: '10px',
                backgroundColor: '#f9f9f9',
                border: '1px solid #ccc',
                borderRadius: '4px',
                textAlign: 'center',
                maxWidth: '100%',
                width: '100%',
                overflow: 'hidden',
                boxSizing: 'border-box',
            }}
        >
            <style>{`
                .mermaid-diagram-container svg {
                    max-width: 100% !important;
                    width: 100% !important;
                    height: auto !important;
                }
            `}</style>
        </div>
    );
};

