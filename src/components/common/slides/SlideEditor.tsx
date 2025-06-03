/* eslint-disable */
// @ts-nocheck
import React, { memo } from 'react';
import ExcalidrawWrapper from './wrapper'; // Adjusted path if necessary
import type {
    ExcalidrawSlideData, // Use the specific type for Excalidraw slides
    AppState, // Expect full AppState from Excalidraw/Wrapper
} from '././utils/types'; // Assuming types.ts
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

export interface Props {
    slide: ExcalidrawSlideData; // Expects data specific to an Excalidraw slide
    editMode: boolean;
    onSlideChange: (
        // CRITICAL FIX: Expect full AppState and files
        elements: readonly ExcalidrawElement[],
        appState: AppState, // Changed from Partial<AppState>
        files: ExcalidrawBinaryFiles
    ) => void;
}

export const SlideEditor = memo(({ slide, editMode, onSlideChange }: Props) => {
    const handleExcalidrawChange = (
        elements: readonly ExcalidrawElement[],
        appState: AppState, // Received full AppState from ExcalidrawWrapper
        files: ExcalidrawBinaryFiles
    ) => {
        // Pass the full AppState and files up to the parent component
        onSlideChange(elements, appState, files);
    };

    return (
        <div
            className="ExcalidrawSlideEditor_Container" // Keep if CSS relies on it
            style={{
                display: 'flex',
                position: 'relative',
                width: '100%',
                height: '100%',
                transform: 'translateZ(0)',
            }}
        >
            <ExcalidrawWrapper
                // Keying ExcalidrawWrapper ensures it re-mounts if the slide ID changes,
                // effectively resetting Excalidraw with new initial data.
                key={slide.id}
                initialData={{
                    // Pass data to ExcalidrawWrapper's initialData prop
                    id: slide.id, // Pass the slide's ID for ExcalidrawWrapper's internal keying
                    elements: slide.elements || [],
                    appState: slide.appState || {}, // Pass stored partial AppState
                    files: slide.files || undefined, // Pass stored files
                }}
                onChange={handleExcalidrawChange}
                editMode={editMode}
            />
        </div>
    );
});

SlideEditor.displayName = 'SlideEditor';
