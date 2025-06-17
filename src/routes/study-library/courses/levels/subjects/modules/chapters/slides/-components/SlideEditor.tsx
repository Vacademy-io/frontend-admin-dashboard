import { getPublicUrl } from '@/services/upload_file';
/* eslint-disable */
// @ts-nocheck
import { Excalidraw } from '@excalidraw/excalidraw';
import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import type React from 'react';
import { useRef, useCallback, useEffect, useState } from 'react';

interface SlideEditorProps {
    slideId: string;
    initialData: {
        elements: any[];
        files: BinaryFiles;
        appState: Partial<AppState>;
    };
    published_data?: {
        fileId: string;
    };
    onChange?: (elements: any[], appState: AppState, files: BinaryFiles) => void;
    editable?: boolean;
    isSaving?: boolean;
}

const SlideEditor: React.FC<SlideEditorProps> = ({
    slideId,
    initialData,
    published_data,
    onChange,
    editable = true,
    isSaving = false,
}) => {
    const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [loadedData, setLoadedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load data from published_data or localStorage on mount
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // If published_data has fileId, fetch from public URL
                if (published_data?.fileId) {
                    const publicUrl = await getPublicUrl(published_data.fileId);
                    const response = await fetch(publicUrl);

                    if (!response.ok) {
                        throw new Error(`Failed to fetch published data: ${response.statusText}`);
                    }

                    const publishedExcalidrawData = await response.json();
                    setLoadedData(publishedExcalidrawData);

                    // Also save to localStorage for future local edits
                    localStorage.setItem(
                        `excalidraw_${slideId}`,
                        JSON.stringify(publishedExcalidrawData)
                    );
                    console.log('publishedExcalidrawData', publishedExcalidrawData);
                    console.log('slideId', slideId);
                } else {
                    // Fallback to localStorage
                    const savedData = localStorage.getItem(`excalidraw_${slideId}`);
                    if (savedData) {
                        const parsedData = JSON.parse(savedData);
                        setLoadedData(parsedData);
                    }
                }
            } catch (error) {
                console.error('Error loading slide data:', error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');

                // Fallback to localStorage if published data fails
                try {
                    const savedData = localStorage.getItem(`excalidraw_${slideId}`);
                    if (savedData) {
                        const parsedData = JSON.parse(savedData);
                        setLoadedData(parsedData);
                    }
                } catch (localStorageError) {
                    console.error('Error loading from localStorage:', localStorageError);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [slideId, published_data?.fileId]);

    const saveToLocalStorage = useCallback(
        (elements: readonly OrderedExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(() => {
                const excalidrawData = {
                    isExcalidraw: true,
                    elements,
                    files,
                    appState,
                    lastModified: Date.now(),
                };

                try {
                    localStorage.setItem(`excalidraw_${slideId}`, JSON.stringify(excalidrawData));
                } catch (error) {
                    console.error('Error saving to localStorage:', error);
                }
            }, 1000);
        },
        [slideId]
    );

    const handleChange = useCallback(
        (elements: readonly OrderedExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
            if (editable) {
                saveToLocalStorage(elements, appState, files);
                onChange?.(elements as any[], appState, files);
            }
        },
        [editable, onChange, saveToLocalStorage]
    );

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    // Create properly structured initial data
    const getInitialData = () => {
        const dataToUse = loadedData || initialData;

        // Ensure appState has all required properties
        const defaultAppState = {
            scrollX: 0,
            scrollY: 0,
            collaborators: new Map(), // Initialize as Map
            ...dataToUse.appState,
        };

        // If collaborators exists but is not a Map, convert it
        if (defaultAppState.collaborators && !(defaultAppState.collaborators instanceof Map)) {
            defaultAppState.collaborators = new Map();
        }

        return {
            elements: dataToUse.elements || [],
            files: dataToUse.files || {},
            appState: defaultAppState,
        };
    };

    // Show loading state
    if (isLoading) {
        return (
            <div
                className="flex aspect-[4/3] w-full items-center justify-center border"
                style={{ height: '85vh' }}
            >
                <div className="text-center">
                    <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                    <p className="text-gray-600">Loading slide data...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div
                className="flex aspect-[4/3] w-full items-center justify-center border"
                style={{ height: '85vh' }}
            >
                <div className="text-center text-red-600">
                    <p className="mb-2">Error loading slide data:</p>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="aspect-[4/3] w-full border"
            style={{ height: '85vh' }}
            onWheelCapture={(e) => e.stopPropagation()}
        >
            <Excalidraw
                excalidrawAPI={(api) => {
                    excalidrawRef.current = api;
                }}
                initialData={getInitialData()}
                onChange={handleChange}
                UIOptions={{
                    canvasActions: {
                        changeViewBackgroundColor: false,
                        toggleScrollBehavior: true,
                        toggleTheme: false,
                        saveToActiveFile: false,
                        clearCanvas: false,
                        export: false,
                        loadScene: false,
                    },
                }}
                viewModeEnabled={isSaving}
            />
        </div>
    );
};

export default SlideEditor;
