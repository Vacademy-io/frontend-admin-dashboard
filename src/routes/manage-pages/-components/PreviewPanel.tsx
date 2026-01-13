import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '../-stores/editor-store';
import { Monitor, Tablet, Smartphone, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { CATALOGUE_EDITOR_CONFIG } from '@/constants/catalogue-editor';
import { fetchBothInstituteAPIs } from '@/services/student-list-section/getInstituteDetails';

interface PreviewPanelProps {
    tagName: string;
}

export const PreviewPanel = ({ tagName }: PreviewPanelProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isReady, setIsReady] = useState(false);

    const config = useEditorStore((state) => state.config);
    const viewport = useEditorStore((state) => state.previewViewport);
    const setViewport = useEditorStore((state) => state.setViewport);
    const { instituteDetails, setInstituteDetails } = useInstituteDetailsStore();

    useEffect(() => {
        if (!instituteDetails) {
            console.log('[PreviewPanel] Fetching institute details from API...');
            fetchBothInstituteAPIs()
                .then((data) => {
                    console.log('[PreviewPanel] Successfully fetched details');
                    setInstituteDetails(data);
                })
                .catch((err) => {
                    console.error('[PreviewPanel] Failed to fetch institute details:', err);
                });
        }
    }, [instituteDetails, setInstituteDetails]);

    let baseUrl =
        instituteDetails?.learner_portal_base_url || CATALOGUE_EDITOR_CONFIG.LEARNER_APP_URL;

    // Ensure protocol
    if (baseUrl && !baseUrl.startsWith('http')) {
        baseUrl = `https://${baseUrl}`;
    }

    const previewUrl = `${baseUrl}/${tagName}?preview=true`;

    console.log('[PreviewPanel] instituteDetails:', instituteDetails);
    console.log(
        '[PreviewPanel] instituteDetails.learner_portal_base_url:',
        instituteDetails?.learner_portal_base_url
    );
    console.log(
        '[PreviewPanel] CATALOGUE_EDITOR_CONFIG.LEARNER_APP_URL:',
        CATALOGUE_EDITOR_CONFIG.LEARNER_APP_URL
    );
    console.log('[PreviewPanel] Selected baseUrl:', baseUrl);
    console.log('[PreviewPanel] Final previewUrl:', previewUrl);

    const sendConfigToPreview = useCallback(() => {
        iframeRef.current?.contentWindow?.postMessage(
            {
                type: 'CATALOGUE_CONFIG_UPDATE',
                payload: config,
            },
            '*' // Target origin - in production should be specific
        );
    }, [config]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Security check
            // if (event.origin !== new URL(CATALOGUE_EDITOR_CONFIG.LEARNER_APP_URL).origin) return;

            if (event.data?.type === 'PREVIEW_READY') {
                setIsReady(true);
                sendConfigToPreview();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [sendConfigToPreview]);

    useEffect(() => {
        if (!isReady || !config) return;

        const timeout = setTimeout(() => {
            sendConfigToPreview();
        }, CATALOGUE_EDITOR_CONFIG.PREVIEW_DEBOUNCE_MS);

        return () => clearTimeout(timeout);
    }, [config, isReady, sendConfigToPreview]);

    const viewportSizes = CATALOGUE_EDITOR_CONFIG.VIEWPORTS;
    const currentSize = viewportSizes[viewport];

    return (
        <div className="flex h-full flex-col border-x bg-gray-100">
            {/* Toolbar */}
            <div className="flex shrink-0 items-center justify-between border-b bg-white p-2">
                <div className="flex rounded-lg border bg-gray-100 p-1">
                    <Button
                        variant={viewport === 'desktop' ? 'default' : 'ghost'}
                        size="sm"
                        className="size-8 p-0"
                        onClick={() => setViewport('desktop')}
                    >
                        <Monitor className="size-4" />
                        <span className="sr-only">Desktop</span>
                    </Button>
                    <Button
                        variant={viewport === 'tablet' ? 'default' : 'ghost'}
                        size="sm"
                        className="size-8 p-0"
                        onClick={() => setViewport('tablet')}
                    >
                        <Tablet className="size-4" />
                        <span className="sr-only">Tablet</span>
                    </Button>
                    <Button
                        variant={viewport === 'mobile' ? 'default' : 'ghost'}
                        size="sm"
                        className="size-8 p-0"
                        onClick={() => setViewport('mobile')}
                    >
                        <Smartphone className="size-4" />
                        <span className="sr-only">Mobile</span>
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (iframeRef.current) iframeRef.current.src = previewUrl;
                        }}
                    >
                        <RefreshCw className="mr-1 size-4" />
                        Refresh
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-1 size-4" />
                            Open
                        </a>
                    </Button>
                </div>
            </div>

            {/* Preview Frame */}
            <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-200 p-4">
                <div
                    className="overflow-hidden border border-gray-300 bg-white shadow-lg transition-all duration-300"
                    style={{
                        width: currentSize.width,
                        height: viewport === 'desktop' ? '100%' : currentSize.height,
                        maxWidth: '100%',
                        maxHeight: '100%',
                    }}
                >
                    <iframe
                        ref={iframeRef}
                        key={previewUrl}
                        src={previewUrl}
                        className="size-full border-0"
                        title="Catalogue Preview"
                        width="100%"
                        height="100%"
                        referrerPolicy="no-referrer"
                    />
                </div>
            </div>
        </div>
    );
};
