/* eslint-disable */
// @ts-nocheck
import { useState } from 'react';
import { Slide } from './types';
import './styles.css';
import ExcalidrawWrapper from './wrapper';

export interface Props {
    slide: Slide;
    editMode: boolean;
    onSlideChange: (elements: any[]) => void;
}

const sameElement = (el1: any, el2: any) => {
    const {
        version: el1Version,
        versionNonce: el1VersionNonce,
        seed: el1Seed,
        ...el1Attributes
    } = el1;
    const {
        version: el2Version,
        versionNonce: el2VersionNonce,
        seed: el2Seed,
        ...el2Attributes
    } = el2;
    return JSON.stringify(el1Attributes) === JSON.stringify(el2Attributes);
};

const sameElements = (elements1: any[], elements2: any[]) =>
    elements1.length === elements2.length &&
    elements1.every((el, index) => sameElement(el, elements2[index]));

export const SlideEditor = ({ slide, editMode, onSlideChange }: Props) => {
    const [initialSlide, setInitialSlide] = useState(slide);

    const onChange = (elements: any[], appState: any, files: any) => {
        if (!sameElements(elements, initialSlide)) {
            onSlideChange(elements, appState, files); // Notify parent component of changes
            setInitialSlide(JSON.parse(JSON.stringify(elements))); // Update local state
        }
    };

    return (
        <div
            className="ExcalidrawSlideEditor_Container"
            style={{
                display: 'flex',
                position: 'relative',
                width: '100%',
                height: '100%',
                // The `pt-14` fix (from previous conversation) should be on the PARENT of this component,
                // ensuring this container itself is correctly positioned below the main app header.
            }}
        >
            {!editMode && (
                <style>{`
                    /* These might be redundant if 'viewModeEnabled={!editMode}' works as expected */
                    /* Excalidraw's viewMode should ideally handle hiding these. */
                    .ExcalidrawSlideEditor_Container .excalidraw .App-menu, /* Toolbars, menus */
                    .ExcalidrawSlideEditor_Container .excalidraw .HintViewer, /* Hints at bottom */
                    .ExcalidrawSlideEditor_Container .excalidraw footer.layer-ui__wrapper__footer { /* Zoom, lock, etc. */
                        display: none !important;
                    }
                `}</style>
            )}

            <style>
                {`
                    /* Target the hamburger menu button. Selector might need adjustment for your Excalidraw version. */
                    .ExcalidrawSlideEditor_Container .excalidraw button[data-testid="app-menu-trigger"],
                    .ExcalidrawSlideEditor_Container .excalidraw .App-menu_top > *:first-child > *:first-child { /* Fallback selector */
                        display: none !important;
                    }
                `}
            </style>

            <ExcalidrawWrapper
                initialSlide={initialSlide}
                onChange={onChange}
                editMode={editMode}
            />
        </div>
    );
};
