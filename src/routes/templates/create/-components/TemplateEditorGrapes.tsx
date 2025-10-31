import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import presetNewsletter from 'grapesjs-preset-newsletter';
import 'grapesjs/dist/css/grapes.min.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Save, X, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
    getMessageTemplate,
    createMessageTemplate,
    updateMessageTemplate,
} from '@/services/message-template-service';
import type { MessageTemplate, CreateTemplateRequest } from '@/types/message-template-types';
import { ALL_TEMPLATE_VARIABLES, TEMPLATE_VARIABLES } from '@/types/message-template-types';
import { extractVariablesFromContent } from '@/components/templates/shared/TemplateEditorUtils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface TemplateEditorGrapesProps {
    templateId: string | null;
}

export const TemplateEditorGrapes: React.FC<TemplateEditorGrapesProps> = ({ templateId }) => {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<any>(null);
    const isEditorInitialized = useRef(false);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(!!templateId);
    const [isSaving, setIsSaving] = useState(false);
    const [template, setTemplate] = useState<MessageTemplate | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'EMAIL' as 'EMAIL' | 'WHATSAPP',
        subject: '',
        templateType: 'utility' as 'marketing' | 'utility' | 'transactional',
        isDefault: false,
    });
    const [showVariablesDialog, setShowVariablesDialog] = useState(false);

    // Load template if editing
    useEffect(() => {
        const loadTemplate = async () => {
            if (templateId) {
                try {
                    setIsLoading(true);
                    console.log('Loading template with ID:', templateId);
                    const loadedTemplate = await getMessageTemplate(templateId);
                    console.log('Template loaded successfully:', {
                        id: loadedTemplate.id,
                        name: loadedTemplate.name,
                        hasContent: !!loadedTemplate.content,
                        contentLength: loadedTemplate.content?.length || 0,
                    });
                    setTemplate(loadedTemplate);
                    setFormData({
                        name: loadedTemplate.name,
                        type: loadedTemplate.type,
                        subject: loadedTemplate.subject || '',
                        templateType: loadedTemplate.templateType || 'utility',
                        isDefault: loadedTemplate.isDefault || false,
                    });
                } catch (error: any) {
                    console.error('Error loading template:', error);
                    const errorMessage = error?.message || 'Unknown error occurred';
                    console.error('Error details:', {
                        templateId,
                        errorMessage,
                        errorType: error?.constructor?.name,
                    });
                    toast.error(`Failed to load template: ${errorMessage}`);
                    // Don't navigate away immediately, let user see the error
                    setTimeout(() => {
                        navigate({ to: '/settings', search: { selectedTab: 'templates' } });
                    }, 2000);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadTemplate();
    }, [templateId, navigate]);

    // Initialize GrapesJS editor
    useEffect(() => {
        if (!editorContainerRef.current || isLoading) return;
        if (templateId && !template) return; // Wait for template to load
        if (isEditorInitialized.current) return; // Don't initialize twice

        // Handle window resize to refresh editor
        const handleResize = () => {
            if (editorRef.current) {
                editorRef.current.refresh();
            }
        };

        // Wait for container to have dimensions
        const initEditor = () => {
            const container = editorContainerRef.current;
            if (!container) return;

            // Check if container has proper dimensions
            const containerHeight = container.offsetHeight || container.clientHeight;
            const containerWidth = container.offsetWidth || container.clientWidth;

            if (containerHeight === 0 || containerWidth === 0) {
                console.log('Container not ready, retrying...', { containerHeight, containerWidth });
                setTimeout(initEditor, 100);
                return;
            }

            console.log('Initializing GrapesJS editor', {
                containerHeight,
                containerWidth,
            });

            const editor = grapesjs.init({
                container: container,
                height: '100%',
                width: '100%',
                fromElement: false,
                storageManager: false,
                canvas: {
                    styles: [],
                    scripts: [],
                },
                dragMode: 'absolute', // Enable absolute positioning for dragging
                deviceManager: {
                    devices: [
                        {
                            name: 'Desktop',
                            width: '',
                        },
                        {
                            name: 'Tablet',
                            width: '768px',
                            widthMedia: '992px',
                        },
                        {
                            name: 'Mobile',
                            width: '320px',
                            widthMedia: '768px',
                        },
                    ],
                },
                plugins: [presetNewsletter],
                pluginsOpts: {
                    [presetNewsletter as unknown as string]: {
                        modalImportTitle: '',
                        modalImportLabel: '',
                    },
                },
            });

            // Configure canvas after editor is ready
            const configureCanvas = () => {
                try {
                    // Ensure the main GrapesJS container fills space
                    const gjsContainer = container.parentElement?.querySelector('.gjs-editor') || container.querySelector('.gjs-editor');
                    if (gjsContainer) {
                        (gjsContainer as HTMLElement).style.height = '100%';
                        (gjsContainer as HTMLElement).style.display = 'flex';
                        (gjsContainer as HTMLElement).style.flexDirection = 'column';
                        (gjsContainer as HTMLElement).style.flex = '1';
                    }

                    // Make the canvas wrapper fill available space and scrollable
                    const canvasWrapper = (editor.Canvas as any).getWrapperEl();
                    if (canvasWrapper) {
                        canvasWrapper.style.height = '100%';
                        canvasWrapper.style.flex = '1';
                        canvasWrapper.style.minHeight = '0';
                        canvasWrapper.style.display = 'flex';
                        canvasWrapper.style.flexDirection = 'column';
                        canvasWrapper.style.overflowY = 'auto';
                        canvasWrapper.style.overflowX = 'hidden';
                        
                        // Find and configure the canvas view
                        const canvasView = canvasWrapper.querySelector('.gjs-cv-canvas');
                        if (canvasView) {
                            (canvasView as HTMLElement).style.height = '100%';
                            (canvasView as HTMLElement).style.flex = '1';
                            (canvasView as HTMLElement).style.minHeight = '0';
                            (canvasView as HTMLElement).style.display = 'flex';
                            (canvasView as HTMLElement).style.flexDirection = 'column';
                            (canvasView as HTMLElement).style.overflowY = 'auto';
                            (canvasView as HTMLElement).style.overflowX = 'hidden';
                        }
                    }

                    // Configure iframe to fill space and expand with content
                    const canvasEl = editor.Canvas.getCanvasView().el;
                    if (canvasEl) {
                        const iframe = canvasEl.querySelector('iframe') as HTMLIFrameElement;
                        if (iframe) {
                            iframe.style.width = '100%';
                            iframe.style.minHeight = '100%';
                            iframe.style.height = 'auto';
                            iframe.style.display = 'block';
                            
                            const checkIframe = () => {
                                try {
                                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                                    if (iframeDoc) {
                                        // Set html element
                                        if (iframeDoc.documentElement) {
                                            iframeDoc.documentElement.style.height = 'auto';
                                            iframeDoc.documentElement.style.minHeight = '100%';
                                        }
                                        
                                        // Configure body to expand with content
                                        if (iframeDoc.body) {
                                            const iframeBody = iframeDoc.body;
                                            iframeBody.style.minHeight = '100%';
                                            iframeBody.style.height = 'auto';
                                            iframeBody.style.overflowY = 'visible';
                                            iframeBody.style.overflowX = 'hidden';
                                        }
                                    }
                                } catch (e) {
                                    console.log('Iframe access handled via iframe styling');
                                }
                            };

                            if (iframe.contentDocument) {
                                checkIframe();
                            } else {
                                iframe.onload = checkIframe;
                                setTimeout(checkIframe, 500);
                            }
                        }
                    }

                    // Ensure dragging is enabled - check toolbar buttons
                    const toolbarButtons = document.querySelectorAll('.gjs-toolbar-item');
                    toolbarButtons.forEach((btn) => {
                        (btn as HTMLElement).style.pointerEvents = 'auto';
                        (btn as HTMLElement).style.cursor = 'pointer';
                    });

                    // Refresh the editor to apply changes
                    setTimeout(() => {
                        editor.refresh();
                    }, 100);
                } catch (error) {
                    console.error('Error configuring canvas:', error);
                }
            };

            // Ensure device manager is properly initialized
            const dm = editor.DeviceManager;
            if (dm) {
                console.log('Device Manager initialized:', dm.getDevices());
            }

            editorRef.current = editor;
            isEditorInitialized.current = true;

            const bm = editor.BlockManager;

            // Add custom email blocks
            bm.add('email-header', {
            label: 'Header',
            category: 'Email',
            content:
                '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7"><tr><td data-email-cell="true" align="center" style="padding:20px;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold"><div data-gjs-type="text">Company</div></td></tr></table>',
        });

            bm.add('email-hero', {
                label: 'Hero',
                category: 'Email',
                content:
                    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td data-email-cell="true" style="padding:0"><img data-email-img="true" src="https://via.placeholder.com/800x250" width="100%" style="display:block;border:0;outline:0;text-decoration:none" alt="" /></td></tr><tr><td data-email-cell="true" align="center" style="padding:20px 15px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1.5"><div data-gjs-type="text">Welcome to our newsletter</div></td></tr></table>',
            });

            bm.add('email-two-cols', {
                label: 'Two Columns',
                category: 'Email',
                content:
                    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td data-email-cell="true" valign="top" width="50%" style="padding:10px;font-family:Arial,Helvetica,sans-serif"><div data-gjs-type="text">Left content</div></td><td data-email-cell="true" valign="top" width="50%" style="padding:10px;font-family:Arial,Helvetica,sans-serif"><div data-gjs-type="text">Right content</div></td></tr></table>',
            });

            bm.add('email-cta', {
                label: 'Button',
                category: 'Email',
                content:
                    '<table role="presentation" align="center" cellpadding="0" cellspacing="0"><tr><td data-email-cell="true" align="center" bgcolor="#4f46e5" style="border-radius:4px"><a data-email-link="true" href="#" style="display:inline-block;padding:12px 24px;font-family:Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;font-weight:bold"><span data-gjs-type="text">Call to action</span></a></td></tr></table>',
            });

            bm.add('email-footer', {
                label: 'Footer',
                category: 'Email',
                content:
                    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7"><tr><td data-email-cell="true" align="center" style="padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#555"><div data-gjs-type="text">You received this email because you signed up on our website.<br/>Unsubscribe</div></td></tr></table>',
            });

            // Add alignment traits dynamically on selection
            const setCellTraits = (cmp: any) => {
                const traits = [
                    {
                        type: 'select',
                        name: 'align',
                        label: 'Align',
                        options: [
                            { id: 'left', name: 'Left' },
                            { id: 'center', name: 'Center' },
                            { id: 'right', name: 'Right' },
                        ],
                    },
                    {
                        type: 'select',
                        name: 'valign',
                        label: 'V Align',
                        options: [
                            { id: 'top', name: 'Top' },
                            { id: 'middle', name: 'Middle' },
                            { id: 'bottom', name: 'Bottom' },
                        ],
                    },
                    {
                        type: 'text',
                        name: 'width',
                        label: 'Width',
                        placeholder: 'e.g., 50%, 100%',
                    },
                    {
                        type: 'select',
                        name: 'colspan',
                        label: 'Colspan',
                        options: [
                            { id: '1', name: '1 Column' },
                            { id: '2', name: '2 Columns (1/2)' },
                            { id: '3', name: '3 Columns (1/3)' },
                            { id: '4', name: '4 Columns (1/4)' },
                        ],
                    },
                ];
                cmp.get('traits').reset(traits);
                
                // Enable resizing for cells
                cmp.set('resizable', true);
            };

            const setImageTraits = (cmp: any) => {
                const traits = [
                    'src',
                    'alt',
                    {
                        type: 'select',
                        name: 'align',
                        label: 'Align',
                        options: [
                            { id: 'left', name: 'Left' },
                            { id: 'center', name: 'Center' },
                            { id: 'right', name: 'Right' },
                        ],
                    },
                    { name: 'width' },
                ];
                cmp.get('traits').reset(traits);
                cmp.addStyle({ display: 'block', border: '0', outline: '0', 'text-decoration': 'none' });
            };

            const setLinkTraits = (cmp: any) => {
                const traits = [
                    { type: 'text', name: 'href', label: 'Href' },
                    {
                        type: 'select',
                        name: 'target',
                        label: 'Target',
                        options: [
                            { id: '', name: 'Same tab' },
                            { id: '_blank', name: 'New tab' },
                        ],
                    },
                    { type: 'text', name: 'rel', label: 'rel' },
                ];
                cmp.get('traits').reset(traits);
            };

            editor.on('component:selected', (cmp: any) => {
                const anchorCmp = cmp.closest && cmp.closest('a');
                const targetCmp = anchorCmp || cmp;
                const el = targetCmp.getEl && targetCmp.getEl();

                if (!el) return;

                // Ensure component is draggable and selectable
                targetCmp.set('draggable', true);
                targetCmp.set('selectable', true);

                // Set traits based on element type
                if (el.hasAttribute && el.hasAttribute('data-email-cell')) {
                    setCellTraits(targetCmp);
                    // Enable resizing for table cells
                    targetCmp.set('resizable', {
                        tl: 0,
                        tc: 0,
                        tr: 0,
                        cl: 1, // horizontal resize from left
                        cr: 1, // horizontal resize from right
                        bl: 0,
                        bc: 0,
                        br: 0,
                        minDim: 50,
                        maxDim: '100%',
                    });
                } else if (el.hasAttribute && el.hasAttribute('data-email-img')) {
                    setImageTraits(targetCmp);
                } else if (el.tagName === 'A' || (el.hasAttribute && el.hasAttribute('data-email-link'))) {
                    setLinkTraits(targetCmp);
                } else if (el.tagName === 'TABLE') {
                    // Enable full resizing for tables (all corners and edges)
                    setTimeout(() => {
                        targetCmp.set('resizable', {
                            tl: 1, // top-left corner
                            tc: 1, // top-center edge
                            tr: 1, // top-right corner
                            cl: 1, // center-left edge
                            cr: 1, // center-right edge
                            bl: 1, // bottom-left corner
                            bc: 1, // bottom-center edge
                            br: 1, // bottom-right corner
                            minDim: 100,
                            maxDim: '100%',
                        });
                        
                        // Force refresh to show resizers
                        editor.refresh();
                    }, 50);
                    
                    // Update width and height on resize
                    targetCmp.on('resize', () => {
                        const width = targetCmp.getStyle('width');
                        const height = targetCmp.getStyle('height');
                        if (width && typeof width === 'string') {
                            targetCmp.addAttribute('width', width);
                        }
                        if (height && typeof height === 'string') {
                            targetCmp.addStyle({ height: height });
                        }
                    });
                    
                    // For tables, also enable resizing for all nested cells
                    enableResizingForNestedCells(targetCmp);
                } else if (el.tagName === 'TD' || el.tagName === 'TH') {
                    // Enable resizing for ALL table cells with all corners (including preset-newsletter blocks)
                    setTimeout(() => {
                        targetCmp.set('resizable', {
                            tl: 1, // top-left corner
                            tc: 1, // top-center edge
                            tr: 1, // top-right corner
                            cl: 1, // center-left edge
                            cr: 1, // center-right edge
                            bl: 1, // bottom-left corner
                            bc: 1, // bottom-center edge
                            br: 1, // bottom-right corner
                            minDim: 50,
                            maxDim: '100%',
                        });
                        
                        // Force refresh to show resizers
                        editor.refresh();
                    }, 50);
                    
                    // Update width and height on resize
                    targetCmp.on('resize', () => {
                        const width = targetCmp.getStyle('width');
                        const height = targetCmp.getStyle('height');
                        if (width && typeof width === 'string') {
                            targetCmp.addAttribute('width', width);
                        }
                        if (height && typeof height === 'string') {
                            targetCmp.addStyle({ height: height });
                        }
                    });
                    
                    // Also set cell traits if not already set
                    if (!el.hasAttribute('data-email-cell')) {
                        // Add data-email-cell attribute for consistency
                        targetCmp.addAttributes({ 'data-email-cell': 'true' });
                        setCellTraits(targetCmp);
                    }
                } else if (el.tagName === 'TR') {
                    // Enable full resizing for table rows
                    targetCmp.set('resizable', {
                        tl: 1,
                        tc: 1,
                        tr: 1,
                        cl: 1,
                        cr: 1,
                        bl: 1,
                        bc: 1,
                        br: 1,
                        minDim: 50,
                        maxDim: '100%',
                    });
                    
                    // For table rows, also enable resizing for all nested cells
                    enableResizingForNestedCells(targetCmp);
                } else if (el.tagName === 'DIV' || el.tagName === 'SECTION') {
                    // Enable resizing for divs and sections
                    targetCmp.set('resizable', true);
                }
                
                // Enable move command toolbar button
                setTimeout(() => {
                    const toolbarButtons = document.querySelectorAll('.gjs-toolbar-item');
                    toolbarButtons.forEach((btn) => {
                        const title = (btn as HTMLElement).getAttribute('title') || '';
                        if (title.toLowerCase().includes('move')) {
                            (btn as HTMLElement).style.pointerEvents = 'auto';
                            (btn as HTMLElement).style.cursor = 'pointer';
                            (btn as HTMLElement).style.opacity = '1';
                        }
                    });
                }, 50);
            });

            // Handle block drop from block manager (preset-newsletter blocks)
            editor.on('block:drag:stop', () => {
                // After a block is dropped, enable resizing for all table elements and cells
                setTimeout(() => {
                    const allComponents = editor.getComponents();
                    const traverseAndEnable = (components: any) => {
                        components.each((component: any) => {
                            const el = component.getEl && component.getEl();
                            if (el) {
                                if (el.tagName === 'TABLE') {
                                    // Enable full resizing for tables
                                    component.set('resizable', {
                                        tl: 1,
                                        tc: 1,
                                        tr: 1,
                                        cl: 1,
                                        cr: 1,
                                        bl: 1,
                                        bc: 1,
                                        br: 1,
                                        minDim: 100,
                                        maxDim: '100%',
                                    });
                                    enableResizingForNestedCells(component);
                                } else if (el.tagName === 'TD' || el.tagName === 'TH') {
                                    component.set('resizable', {
                                        tl: 1,
                                        tc: 1,
                                        tr: 1,
                                        cl: 1,
                                        cr: 1,
                                        bl: 1,
                                        bc: 1,
                                        br: 1,
                                        minDim: 50,
                                        maxDim: '100%',
                                    });
                                } else if (el.tagName === 'TR') {
                                    component.set('resizable', {
                                        tl: 1,
                                        tc: 1,
                                        tr: 1,
                                        cl: 1,
                                        cr: 1,
                                        bl: 1,
                                        bc: 1,
                                        br: 1,
                                        minDim: 50,
                                        maxDim: '100%',
                                    });
                                }
                            }
                            if (component.components) {
                                traverseAndEnable(component.components());
                            }
                        });
                    };
                    traverseAndEnable(allComponents);
                }, 100);
            });

            const applyCellAlign = (cmp: any) => {
                const align = cmp.getAttributes().align;
                if (align) cmp.addStyle({ 'text-align': align });
                
                // Apply width if set
                const width = cmp.getAttributes().width;
                if (width) {
                    cmp.addStyle({ width: width });
                    cmp.addAttribute('width', width);
                }
                
                // Apply colspan if set
                const colspan = cmp.getAttributes().colspan;
                if (colspan && cmp.is('td')) {
                    cmp.addAttribute('colspan', colspan);
                    // Adjust width based on colspan
                    const table = cmp.closest('table');
                    if (table) {
                        const cols = table.components().length > 0 
                            ? table.components().at(0).components().length 
                            : 1;
                        const percentWidth = (100 / cols) * parseInt(colspan);
                        cmp.addStyle({ width: `${percentWidth}%` });
                    }
                }
            };

            const applyImgAlign = (cmp: any) => {
                const align = cmp.getAttributes().align;
                if (align === 'center') {
                    cmp.addStyle({ display: 'block', margin: '0 auto', float: 'none' });
                } else if (align === 'right') {
                    cmp.addStyle({ display: 'block', margin: '0 0 0 auto', float: 'none' });
                } else if (align === 'left') {
                    cmp.addStyle({ display: 'block', margin: '0 auto 0 0', float: 'none' });
                }
            };

            editor.on('component:update:attributes:align', (cmp: any) => {
                const el = cmp.getEl && cmp.getEl();
                if (!el) return;

                if (el.hasAttribute && el.hasAttribute('data-email-cell')) applyCellAlign(cmp);
                if (el.hasAttribute && el.hasAttribute('data-email-img')) applyImgAlign(cmp);
            });

            // Handle width and colspan updates
            editor.on('component:update:attributes:width', (cmp: any) => {
                const el = cmp.getEl && cmp.getEl();
                if (!el) return;
                if (el.hasAttribute && el.hasAttribute('data-email-cell')) applyCellAlign(cmp);
            });

            editor.on('component:update:attributes:colspan', (cmp: any) => {
                const el = cmp.getEl && cmp.getEl();
                if (!el) return;
                if (el.hasAttribute && el.hasAttribute('data-email-cell')) applyCellAlign(cmp);
            });

            // Helper function to enable resizing for all nested table cells with all corners
            const enableResizingForNestedCells = (component: any) => {
                // Check if this component is a table cell
                const el = component.getEl && component.getEl();
                if (el && (el.tagName === 'TD' || el.tagName === 'TH' || el.hasAttribute('data-email-cell'))) {
                    setTimeout(() => {
                        component.set('resizable', {
                            tl: 1, // top-left corner
                            tc: 1, // top-center edge
                            tr: 1, // top-right corner
                            cl: 1, // center-left edge
                            cr: 1, // center-right edge
                            bl: 1, // bottom-left corner
                            bc: 1, // bottom-center edge
                            br: 1, // bottom-right corner
                            minDim: 50,
                            maxDim: '100%',
                        });
                        
                        // Force refresh to show resizers
                        editor.refresh();
                    }, 50);
                    
                    // Update width and height on resize
                    component.on('resize', () => {
                        const width = component.getStyle('width');
                        const height = component.getStyle('height');
                        if (width && typeof width === 'string') {
                            component.addAttribute('width', width);
                        }
                        if (height && typeof height === 'string') {
                            component.addStyle({ height: height });
                        }
                    });
                }
                
                // Recursively check children
                const children = component.components ? component.components().models : [];
                if (children && children.length > 0) {
                    children.forEach((child: any) => {
                        enableResizingForNestedCells(child);
                    });
                }
            };

            // Enable resizing for all table cells and common elements
            editor.on('component:add', (component: any) => {
                const el = component.getEl && component.getEl();
                if (!el) return;
                
                // Enable resizing for table elements (tables, rows, cells)
                if (el.tagName === 'TABLE') {
                    // Force enable resizing for the table itself
                    setTimeout(() => {
                        // Enable full resizing for the table itself (all corners and edges)
                        component.set('resizable', {
                            tl: 1, // top-left corner
                            tc: 1, // top-center edge
                            tr: 1, // top-right corner
                            cl: 1, // center-left edge
                            cr: 1, // center-right edge
                            bl: 1, // bottom-left corner
                            bc: 1, // bottom-center edge
                            br: 1, // bottom-right corner
                            minDim: 100,
                            maxDim: '100%',
                        });
                        
                        // Force refresh to show resizers
                        editor.refresh();
                    }, 50);
                    
                    // Update width and height on resize
                    component.on('resize', () => {
                        const width = component.getStyle('width');
                        const height = component.getStyle('height');
                        if (width && typeof width === 'string') {
                            component.addAttribute('width', width);
                        }
                        if (height && typeof height === 'string') {
                            component.addStyle({ height: height });
                        }
                    });
                    
                    // Enable resizing for all cells in the table
                    enableResizingForNestedCells(component);
                    
                    // Also enable resizing for rows
                    const rows = component.components ? component.components().models : [];
                    rows.forEach((row: any) => {
                        enableResizingForNestedCells(row);
                    });
                }
                // Enable resizing for table cells (all corners and edges)
                else if (el.tagName === 'TD' || el.tagName === 'TH' || el.hasAttribute('data-email-cell')) {
                    setTimeout(() => {
                        component.set('resizable', {
                            tl: 1, // top-left corner
                            tc: 1, // top-center edge
                            tr: 1, // top-right corner
                            cl: 1, // center-left edge
                            cr: 1, // center-right edge
                            bl: 1, // bottom-left corner
                            bc: 1, // bottom-center edge
                            br: 1, // bottom-right corner
                            minDim: 50,
                            maxDim: '100%',
                        });
                        
                        // Force refresh to show resizers
                        editor.refresh();
                    }, 50);
                    
                    // Update width and height on resize
                    component.on('resize', () => {
                        const width = component.getStyle('width');
                        const height = component.getStyle('height');
                        if (width && typeof width === 'string') {
                            component.addAttribute('width', width);
                        }
                        if (height && typeof height === 'string') {
                            component.addStyle({ height: height });
                        }
                    });
                    
                    // Also enable for nested cells
                    enableResizingForNestedCells(component);
                }
                // Enable resizing for table rows (all corners)
                else if (el.tagName === 'TR') {
                    component.set('resizable', {
                        tl: 1,
                        tc: 1,
                        tr: 1,
                        cl: 1,
                        cr: 1,
                        bl: 1,
                        bc: 1,
                        br: 1,
                        minDim: 50,
                        maxDim: '100%',
                    });
                    enableResizingForNestedCells(component);
                }
                // Enable resizing for divs and sections
                else if (el.tagName === 'DIV' || el.tagName === 'SECTION') {
                    component.set('resizable', true);
                }
            });

            // Load template content if editing
            if (template && template.content) {
                try {
                    let htmlContent = template.content;
                    let cssContent = '';

                    // Extract CSS from style tag if present
                    if (template.content.includes('<style>')) {
                        const styleMatch = template.content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
                        if (styleMatch && styleMatch[1]) {
                            cssContent = styleMatch[1];
                            // Remove style tag from HTML
                            htmlContent = template.content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
                        }
                    }

                    // Set HTML content in GrapesJS
                    editor.setComponents(htmlContent.trim());
                    
                    // Set CSS if we extracted any
                    if (cssContent) {
                        editor.setStyle(cssContent);
                    }

                    console.log('Template loaded successfully:', { htmlContent: htmlContent.substring(0, 100), hasCss: !!cssContent });
                } catch (error) {
                    console.error('Error loading template content:', error);
                    toast.error('Failed to load template content');
                }
            }

            // Wait for editor to be fully loaded
            editor.on('load', () => {
                console.log('GrapesJS editor loaded successfully');
                
                // Enable resizing for all existing table elements and cells after load
                const allComponents = editor.getComponents();
                const traverseComponents = (components: any) => {
                    components.each((component: any) => {
                        const el = component.getEl && component.getEl();
                        if (el) {
                            // Enable full resizing for tables
                            if (el.tagName === 'TABLE') {
                                component.set('resizable', {
                                    tl: 1,
                                    tc: 1,
                                    tr: 1,
                                    cl: 1,
                                    cr: 1,
                                    bl: 1,
                                    bc: 1,
                                    br: 1,
                                    minDim: 100,
                                    maxDim: '100%',
                                });
                            }
                            // Enable full resizing for table cells
                            else if (el.tagName === 'TD' || el.tagName === 'TH' || el.hasAttribute('data-email-cell')) {
                                component.set('resizable', {
                                    tl: 1,
                                    tc: 1,
                                    tr: 1,
                                    cl: 1,
                                    cr: 1,
                                    bl: 1,
                                    bc: 1,
                                    br: 1,
                                    minDim: 50,
                                    maxDim: '100%',
                                });
                            }
                            // Enable full resizing for table rows
                            else if (el.tagName === 'TR') {
                                component.set('resizable', {
                                    tl: 1,
                                    tc: 1,
                                    tr: 1,
                                    cl: 1,
                                    cr: 1,
                                    bl: 1,
                                    bc: 1,
                                    br: 1,
                                    minDim: 50,
                                    maxDim: '100%',
                                });
                            }
                        }
                        
                        // Recursively check children
                        if (component.components) {
                            traverseComponents(component.components());
                        }
                    });
                };
                traverseComponents(allComponents);
                
                // Configure canvas after load
                setTimeout(() => {
                    configureCanvas();
                }, 100);
            });

            // Also try to configure immediately if already loaded
            setTimeout(() => {
                try {
                    if (editor.getHtml && typeof editor.getHtml === 'function') {
                        configureCanvas();
                    }
                } catch (e) {
                    // Editor might not be fully ready yet
                }
            }, 200);

            // Handle device change
            editor.on('change:device', () => {
                console.log('Device changed:', editor.getDevice());
                // Refresh the canvas when device changes
                setTimeout(() => {
                    editor.refresh();
                    configureCanvas();
                }, 50);
            });

            // Update canvas configuration when content changes
            editor.on('component:add', () => {
                setTimeout(() => {
                    configureCanvas();
                }, 100);
            });

            editor.on('component:remove', () => {
                setTimeout(() => {
                    configureCanvas();
                }, 100);
            });


            window.addEventListener('resize', handleResize);
        };

        // Initialize with a small delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            initEditor();
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
            if (editorRef.current && isEditorInitialized.current) {
                editorRef.current.destroy();
                isEditorInitialized.current = false;
            }
        };
    }, [isLoading, template, templateId]);

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Please enter a template name');
            return;
        }

        if (!editorRef.current) {
            toast.error('Editor not initialized');
            return;
        }

        setIsSaving(true);
        try {
            const htmlContent = editorRef.current.getHtml();
            const cssContent = editorRef.current.getCss();

            // Combine HTML and CSS for variable extraction and storage
            // GrapesJS generates email-safe HTML, so we'll include CSS in a style tag
            const finalContent = cssContent
                ? `${htmlContent}<style>${cssContent}</style>`
                : htmlContent;

            // Extract variables from content and subject
            const contentVariables = extractVariablesFromContent(finalContent);
            const subjectVariables = formData.subject
                ? extractVariablesFromContent(formData.subject)
                : [];
            // Combine and deduplicate variables
            const allVariableNames = [...new Set([...contentVariables, ...subjectVariables])];
            // Convert to full variable format with {{ }}
            const variables = allVariableNames.map((name) => `{{${name}}}`);

            const templateData: CreateTemplateRequest = {
                name: formData.name,
                type: formData.type,
                subject: formData.subject,
                content: finalContent,
                variables: variables,
                isDefault: formData.isDefault,
                templateType: formData.templateType,
            };

            if (templateId && template) {
                await updateMessageTemplate({
                    id: templateId,
                    ...templateData,
                });
                toast.success('Template updated successfully!');
            } else {
                await createMessageTemplate(templateData);
                toast.success('Template created successfully!');
            }

            // Navigate back to settings
            navigate({ to: '/settings', search: { selectedTab: 'templates' } });
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error(templateId ? 'Failed to update template' : 'Failed to create template');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate({ to: '/settings', search: { selectedTab: 'templates' } });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-background">
                <Loader2 className="size-6 animate-spin" />
                <span className="ml-2">Loading template...</span>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen bg-background overflow-hidden flex flex-col">
            {/* Form Section - Above Editor with matching background - Compact Single Line */}
            <div className="mx-4 mt-4 mb-0 bg-[#f8f9fa] border border-gray-200 rounded-t-lg px-3 py-2 flex-shrink-0">
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Template Name */}
                    <div className="flex items-center gap-1.5 min-w-[180px]">
                        <Label htmlFor="name" className="text-xs text-gray-600 whitespace-nowrap">Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Template name"
                            className="h-7 text-xs bg-white flex-1"
                        />
                    </div>

                    {/* Type */}
                    <div className="flex items-center gap-1.5 min-w-[120px]">
                        <Label htmlFor="type" className="text-xs text-gray-600 whitespace-nowrap">Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value: 'EMAIL' | 'WHATSAPP') =>
                                setFormData({ ...formData, type: value })
                            }
                        >
                            <SelectTrigger id="type" className="h-7 text-xs bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EMAIL">Email</SelectItem>
                                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Subject (only for EMAIL) */}
                    {formData.type === 'EMAIL' && (
                        <div className="flex items-center gap-1.5 min-w-[180px]">
                            <Label htmlFor="subject" className="text-xs text-gray-600 whitespace-nowrap">Subject</Label>
                            <Input
                                id="subject"
                                value={formData.subject}
                                onChange={(e) =>
                                    setFormData({ ...formData, subject: e.target.value })
                                }
                                placeholder="Email subject"
                                className="h-7 text-xs bg-white flex-1"
                            />
                        </div>
                    )}

                    {/* Template Type */}
                    <div className="flex items-center gap-1.5 min-w-[140px]">
                        <Label htmlFor="templateType" className="text-xs text-gray-600 whitespace-nowrap">Category</Label>
                        <Select
                            value={formData.templateType}
                            onValueChange={(value: 'marketing' | 'utility' | 'transactional') =>
                                setFormData({ ...formData, templateType: value })
                            }
                        >
                            <SelectTrigger id="templateType" className="h-7 text-xs bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="utility">Utility</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="transactional">Transactional</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowVariablesDialog(true)}
                                        className="h-7 w-7 p-0 bg-white hover:bg-gray-100"
                                    >
                                        <Info className="size-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View available template variables</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button 
                            size="sm" 
                            onClick={handleSave} 
                            disabled={isSaving} 
                            className="h-7 px-2 text-xs"
                        >
                            {isSaving ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <Save className="size-3.5" />
                            )}
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleCancel} 
                            className="h-7 w-7 p-0 bg-white hover:bg-gray-100"
                        >
                            <X className="size-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* GrapesJS Editor - Full Viewport Height with Scrollable Canvas */}
            <div 
                className="border border-gray-200 border-t-0 mx-4 mb-4 rounded-b-lg bg-white flex-1 min-h-0" 
                style={{ 
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <style>{`
                    /* Ensure GrapesJS editor fills container */
                    #gjs {
                        height: 100% !important;
                        width: 100% !important;
                        flex: 1 !important;
                        min-height: 0 !important;
                        display: flex !important;
                        flex-direction: column !important;
                    }
                    
                    /* Ensure GrapesJS main container fills space */
                    .gjs-editor {
                        height: 100% !important;
                        display: flex !important;
                        flex-direction: column !important;
                        flex: 1 !important;
                    }
                    
                    /* Ensure GrapesJS canvas wrapper fills available space */
                    .gjs-cv-canvas {
                        flex: 1 !important;
                        min-height: 0 !important;
                        height: 100% !important;
                        overflow-y: auto !important;
                        overflow-x: hidden !important;
                        display: flex !important;
                        flex-direction: column !important;
                    }
                    
                    /* Make canvas frame fill available space */
                    .gjs-frame {
                        flex: 1 !important;
                        min-height: 100% !important;
                        height: auto !important;
                        display: block !important;
                    }
                    
                    /* Ensure iframe fills the frame */
                    .gjs-frame iframe {
                        width: 100% !important;
                        min-height: 100% !important;
                        height: auto !important;
                        display: block !important;
                    }
                    
                    /* Enable proper dragging for components */
                    .gjs-comp-selected {
                        outline: 2px solid #3b82f6 !important;
                        outline-offset: 2px !important;
                    }
                    
                    /* Ensure toolbar buttons work */
                    .gjs-toolbar-item {
                        cursor: pointer !important;
                    }
                    
                    /* Fix for move button */
                    .gjs-toolbar-item[title*="Move"] {
                        pointer-events: auto !important;
                    }
                    
                    /* Resize handles styling - all corners and edges */
                    .gjs-resizer {
                        border: 2px solid #3b82f6 !important;
                        background: #3b82f6 !important;
                        width: 8px !important;
                        height: 8px !important;
                        z-index: 1000 !important;
                    }
                    
                    /* Horizontal edges (left and right) */
                    .gjs-resizer-h,
                    .gjs-resizer-cl,
                    .gjs-resizer-cr {
                        cursor: ew-resize !important;
                    }
                    
                    /* Vertical edges (top and bottom) */
                    .gjs-resizer-v,
                    .gjs-resizer-tc,
                    .gjs-resizer-bc {
                        cursor: ns-resize !important;
                    }
                    
                    /* Diagonal corners */
                    .gjs-resizer-tl {
                        cursor: nwse-resize !important;
                    }
                    
                    .gjs-resizer-tr {
                        cursor: nesw-resize !important;
                    }
                    
                    .gjs-resizer-bl {
                        cursor: nesw-resize !important;
                    }
                    
                    .gjs-resizer-br {
                        cursor: nwse-resize !important;
                    }
                    
                    /* Enable resize for table cells and tables */
                    .gjs-comp-selected[data-email-cell],
                    .gjs-comp-selected table,
                    .gjs-comp-selected[data-gjs-type="table"] {
                        position: relative !important;
                    }
                    
                    /* Show resize handles */
                    .gjs-comp-selected .gjs-resizer {
                        opacity: 1 !important;
                        visibility: visible !important;
                        display: block !important;
                    }
                    
                    /* Ensure resizers are visible and clickable */
                    .gjs-resizer:hover {
                        background: #2563eb !important;
                        border-color: #2563eb !important;
                    }
                `}</style>
                <div id="gjs" ref={editorContainerRef} style={{ height: '100%', width: '100%', flex: 1 }} />
            </div>

            {/* Variables Dialog */}
            <Dialog open={showVariablesDialog} onOpenChange={setShowVariablesDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Available Template Variables</DialogTitle>
                        <DialogDescription>
                            You can use these variables in your template. They will be replaced with
                            actual values when the template is used.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {Object.entries(TEMPLATE_VARIABLES).map(([category, variables]) => (
                            <div key={category}>
                                <h4 className="font-semibold mb-2 capitalize">
                                    {category.replace('_', ' ')}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {variables.map((variable) => (
                                        <code
                                            key={variable}
                                            className="px-2 py-1 bg-muted rounded text-sm"
                                        >
                                            {variable}
                                        </code>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};


