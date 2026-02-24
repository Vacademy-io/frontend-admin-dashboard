import { useQuery, useMutation } from '@tanstack/react-query';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';
import { getCatalogueConfig, saveCatalogueConfig } from '../-services/catalogue-service';
import { useEditorStore } from '../-stores/editor-store';
import { useEffect } from 'react';
import { ComponentLibrary } from './ComponentLibrary';
import { PageCanvas } from './PageCanvas';
import { PropertyPanel } from './PropertyPanel';
import { PageTabs } from './PageTabs';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Code, LayoutTemplate, Undo2, Redo2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Route } from '../editor/$tagName';
import { CatalogueConfig } from '../-types/editor-types';
import { useCataloguePermissions } from '../-hooks/use-catalogue-permissions';

import { PreviewPanel } from './PreviewPanel';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

export const CatalogueEditorPage = () => {
    const { tagName } = Route.useParams();
    const instituteId = getCurrentInstituteId();
    const {
        setConfig,
        config,
        activeTab,
        setActiveTab,
        updateConfig,
        undo,
        redo,
        canUndo,
        canRedo,
    } = useEditorStore();
    const { toast } = useToast();
    const [showPreview, setShowPreview] = useState(false);
    const { canWrite } = useCataloguePermissions();
    const [jsonText, setJsonText] = useState('');
    const [jsonError, setJsonError] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['catalogueConfig', instituteId, tagName],
        queryFn: () => getCatalogueConfig(instituteId!, tagName),
        enabled: !!instituteId && !!tagName,
    });

    const saveMutation = useMutation({
        mutationFn: (newConfig: CatalogueConfig) =>
            saveCatalogueConfig(instituteId!, tagName, newConfig),
        onSuccess: () => {
            toast({ title: 'Saved', description: 'Changes saved successfully' });
        },
        onError: (err) => {
            toast({
                title: 'Error',
                description: 'Failed to save changes',
                variant: 'destructive',
            });
            console.error(err);
        },
    });

    useEffect(() => {
        if (data && data.catalogue_json) {
            try {
                const parsed = JSON.parse(data.catalogue_json);
                setConfig(parsed);
            } catch (e) {
                console.error('Failed to parse catalogue JSON', e);
            }
        }
    }, [data, setConfig]);

    // Sync JSON text when switching to JSON mode
    useEffect(() => {
        if (activeTab === 'json' && config) {
            setJsonText(JSON.stringify(config, null, 2));
            setJsonError(null);
        }
    }, [activeTab, config]);

    const handleJsonChange = (value: string) => {
        setJsonText(value);
        try {
            const parsed = JSON.parse(value);
            setJsonError(null);
            updateConfig(parsed);
        } catch (e) {
            setJsonError('Invalid JSON');
        }
    };

    // Keyboard shortcuts for Undo/Redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo()) undo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
                e.preventDefault();
                if (canRedo()) redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, canUndo, canRedo]);

    if (isLoading)
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        );
    if (!config) return <div className="p-10">Failed to load configuration.</div>;

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50">
            {/* Top Bar */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4">
                <div className="flex items-center gap-4">
                    <h2 className="font-semibold">Page Editor: {tagName}</h2>
                    {/* Mode Toggle */}
                    <div className="flex rounded-lg border bg-gray-100 p-0.5">
                        <Button
                            variant={activeTab === 'visual' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('visual')}
                            className="gap-1"
                        >
                            <LayoutTemplate className="size-4" />
                            Visual
                        </Button>
                        <Button
                            variant={activeTab === 'json' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('json')}
                            className="gap-1"
                        >
                            <Code className="size-4" />
                            JSON
                        </Button>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Undo/Redo Buttons */}
                    <div className="flex rounded-lg border bg-gray-100 p-0.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={undo}
                            disabled={!canUndo()}
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={redo}
                            disabled={!canRedo()}
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 className="size-4" />
                        </Button>
                    </div>
                    {activeTab === 'visual' && (
                        <Button
                            variant={showPreview ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            {showPreview ? (
                                <EyeOff className="mr-2 size-4" />
                            ) : (
                                <Eye className="mr-2 size-4" />
                            )}
                            {showPreview ? 'Edit Mode' : 'Preview'}
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={() => saveMutation.mutate(config)}
                        disabled={saveMutation.isPending || !canWrite || !!jsonError}
                    >
                        <Save className="mr-2 size-4" />
                        Save
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            {activeTab === 'json' ? (
                /* JSON Editor Mode */
                <div className="flex flex-1 flex-col overflow-hidden bg-gray-900 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-gray-400">Edit JSON Configuration</span>
                        {jsonError && (
                            <span className="rounded bg-red-500 px-2 py-1 text-xs text-white">
                                {jsonError}
                            </span>
                        )}
                    </div>
                    <Textarea
                        value={jsonText}
                        onChange={(e) => handleJsonChange(e.target.value)}
                        className="flex-1 resize-none bg-gray-800 font-mono text-sm text-green-400"
                        spellCheck={false}
                    />
                </div>
            ) : (
                /* Visual Editor Mode */
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar - Components */}
                    <div
                        className={`flex w-64 flex-col border-r bg-white ${showPreview ? 'hidden' : ''}`}
                    >
                        <div className="border-b p-4 font-medium">Components</div>
                        <ComponentLibrary />
                    </div>

                    {/* Center - Canvas or Preview */}
                    <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
                        {showPreview ? (
                            <PreviewPanel tagName={tagName} />
                        ) : (
                            <>
                                <div className="flex w-full flex-1 overflow-auto">
                                    <PageCanvas />
                                </div>
                                {/* Bottom - Page Tabs */}
                                <div className="h-12 shrink-0 border-t bg-white">
                                    <PageTabs />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Sidebar - Properties */}
                    <div
                        className={`flex w-80 flex-col overflow-auto border-l bg-white ${showPreview ? 'hidden' : ''}`}
                    >
                        <div className="border-b p-4 font-medium">Properties</div>
                        <PropertyPanel />
                    </div>
                </div>
            )}
        </div>
    );
};
