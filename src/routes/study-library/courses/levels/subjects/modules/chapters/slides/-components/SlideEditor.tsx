import { getPublicUrl, UploadFileInS3 } from '@/services/upload_file';
/* eslint-disable */
// @ts-nocheck
import { Excalidraw } from '@excalidraw/excalidraw';
import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import type React from 'react';
import { useRef, useCallback, useEffect, useState } from 'react';
import { getTokenFromCookie, getTokenDecodedData } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

interface SlideEditorProps {
    slideId: string;
    initialData: {
        elements: any[];
        files: BinaryFiles;
        appState: Partial<AppState>;
    };
    fileId?: string; // S3 file ID to load data from
    onChange?: (elements: any[], appState: AppState, files: BinaryFiles, fileId?: string) => void;
    editable?: boolean;
    isSaving?: boolean;
}

const SlideEditor: React.FC<SlideEditorProps> = ({
    slideId,
    initialData,
    fileId,
    onChange,
    editable = true,
    isSaving = false,
}) => {
    const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [loadedData, setLoadedData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastLoadedFileId, setLastLoadedFileId] = useState<string | undefined>(undefined);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

    // Get user and institute info for S3 uploads
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && Object.keys(data.authorities)[0];
    const USER_ID = data?.sub;

    // Upload Excalidraw JSON to S3
    const uploadToS3 = useCallback(async (excalidrawData: any, existingFileId?: string): Promise<string | null> => {
        try {
            const jsonBlob = new Blob([JSON.stringify(excalidrawData)], { type: 'application/json' });
            
            // Use existing filename if updating, otherwise create new
            const fileName = existingFileId 
                ? `excalidraw_${slideId}_${existingFileId.slice(-8)}.json` 
                : `excalidraw_${slideId}_${Date.now()}.json`;
                
            const jsonFile = new File([jsonBlob], fileName, {
                type: 'application/json',
            });

            const uploadedFileId = await UploadFileInS3(
                jsonFile,
                () => {}, // No progress callback needed
                USER_ID || '',
                INSTITUTE_ID,
                'ADMIN',
                true // public URL
            );

            return uploadedFileId || null;
        } catch (error) {
            console.error(`[SlideEditor ${slideId}] Error uploading to S3:`, error);
            return null;
        }
    }, [slideId, USER_ID, INSTITUTE_ID]);

    // Load data from S3 using fileId - only on initial mount
    useEffect(() => {
        // Only load data once when component first mounts with initial fileId
        if (hasLoadedInitialData) {
            console.log(`[SlideEditor ${slideId}] Already loaded data, skipping reload for fileId: ${fileId}`);
            return;
        }

        const loadData = async () => {
            const initialFileId = fileId; // Capture the current fileId at mount time
            console.log(`[SlideEditor ${slideId}] Initial load with fileId: ${initialFileId}`);
            setIsLoading(true);
            setError(null);

            try {
                if (initialFileId) {
                    console.log(`[SlideEditor ${slideId}] Loading from S3 fileId: ${initialFileId}`);
                    const publicUrl = await getPublicUrl(initialFileId);
                    const response = await fetch(publicUrl);

                    if (!response.ok) {
                        throw new Error(`Failed to fetch data from S3: ${response.statusText}`);
                    }

                    const excalidrawData = await response.json();
                    setLoadedData(excalidrawData);
                    setLastLoadedFileId(initialFileId);
                    console.log(`[SlideEditor ${slideId}] S3 data loaded:`, excalidrawData);
                } else {
                    console.log(`[SlideEditor ${slideId}] No fileId provided, showing empty state`);
                    setLoadedData(null);
                    setLastLoadedFileId(undefined);
                }
                setHasLoadedInitialData(true);
            } catch (error) {
                console.error(`[SlideEditor ${slideId}] Error loading slide data:`, error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
                setHasLoadedInitialData(true); // Set this even on error to prevent retries
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [slideId]); // Remove fileId from dependency array to prevent loop

    const saveToS3 = useCallback(
        (elements: readonly OrderedExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(async () => {
                setIsAutoSaving(true);
                
                const excalidrawData = {
                    isExcalidraw: true,
                    elements,
                    files,
                    appState,
                    lastModified: Date.now(),
                };

                try {
                    // Try to update existing file first, otherwise create new
                    const uploadedFileId = await uploadToS3(excalidrawData, fileId);
                    if (uploadedFileId) {
                        console.log(`[SlideEditor ${slideId}] Data saved to S3 with fileId:`, uploadedFileId);
                        
                        // Always trigger onChange to update the database with the fileId
                        // The parent component will handle whether this causes a re-render
                        onChange?.(elements as any[], appState, files, uploadedFileId);
                    }
                } catch (error) {
                    console.error(`[SlideEditor ${slideId}] Error saving to S3:`, error);
                } finally {
                    setIsAutoSaving(false);
                }
            }, 5000); // Auto-save after 5 seconds of inactivity to reduce frequency
        },
        [slideId, uploadToS3, onChange, fileId]
    );

    const handleChange = useCallback(
        (elements: readonly OrderedExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
            if (editable) {
                saveToS3(elements, appState, files);
            }
        },
        [editable, saveToS3]
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

        // Deep clone the data to ensure complete isolation between slides
        const clonedElements = JSON.parse(JSON.stringify(dataToUse.elements || []));
        const clonedFiles = JSON.parse(JSON.stringify(dataToUse.files || {}));
        const clonedAppState = JSON.parse(JSON.stringify(dataToUse.appState || {}));

        // Ensure appState has all required properties
        const defaultAppState = {
            scrollX: 0,
            scrollY: 0,
            collaborators: new Map(), // Initialize as Map
            ...clonedAppState,
        };

        // If collaborators exists but is not a Map, convert it
        if (defaultAppState.collaborators && !(defaultAppState.collaborators instanceof Map)) {
            defaultAppState.collaborators = new Map();
        }

        const finalData = {
            elements: clonedElements,
            files: clonedFiles,
            appState: defaultAppState,
        };
        
        console.log(`[SlideEditor ${slideId}] Initial data prepared:`, finalData);
        return finalData;
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

    // Show empty state if no fileId and no initial data
    if (!fileId && (!loadedData || (loadedData && 'elements' in loadedData && loadedData.elements.length === 0))) {
        return (
            <div
                className="aspect-[4/3] w-full border relative"
                style={{ 
                    height: '85vh',
                    zIndex: 9999
                }}
                onWheelCapture={(e) => e.stopPropagation()}
            >
                <Excalidraw
                    key={`excalidraw-${slideId}`}
                    excalidrawAPI={(api) => {
                        excalidrawRef.current = api;
                    }}
                    initialData={{
                        elements: [],
                        files: {},
                        appState: {
                            scrollX: 0,
                            scrollY: 0,
                            collaborators: new Map(),
                        },
                    }}
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
    }

    return (
        <div
            className="aspect-[4/3] w-full border relative"
            style={{ 
                height: '85vh',
                zIndex: 9999 // Ensure Excalidraw toolbar appears above other elements
            }}
            onWheelCapture={(e) => e.stopPropagation()}
        >
            <Excalidraw
                key={`excalidraw-${slideId}`}
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
