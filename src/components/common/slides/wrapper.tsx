import { Excalidraw } from "../excalidraw/packages/excalidraw";
// import "../excalidraw/";
import { useEffect, useRef } from "react";

interface ExcalidrawWrapperProps {
    initialElements: any[];
    onChange: (elements: any[]) => void;
    editMode: boolean;
}

const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({
    initialElements,
    onChange,
   
}) => {
    const excalidrawRef = useRef<any>(null);

    useEffect(() => {
        const disableAllGestures = (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
        };

        // Get the Excalidraw container
        const container = excalidrawRef.current?.getApp()?.canvas?.parentElement;

        if (container) {
            // Disable all possible events that could cause zooming or scrolling
            const events = [
                "wheel",
                "touchmove",
                "gesturestart",
                "gesturechange",
                "gestureend",
                "pointerdown",
                "pointermove",
                "pointerup",
            ];

            events.forEach((eventType) => {
                container.addEventListener(eventType, disableAllGestures, { passive: false });
            });

            // Override Excalidraw's internal event handlers
            const originalWheelHandler = container.onwheel;
            const originalTouchHandler = container.ontouchmove;

            container.onwheel = (event: WheelEvent) => {
                event.preventDefault();
                event.stopPropagation();
            };

            container.ontouchmove = (event: TouchEvent) => {
                event.preventDefault();
                event.stopPropagation();
            };

            // Cleanup
            return () => {
                events.forEach((eventType) => {
                    container.removeEventListener(eventType, disableAllGestures);
                });
                container.onwheel = originalWheelHandler;
                container.ontouchmove = originalTouchHandler;
            };
        }
    }, []);

    return (
        <div className="aspect-video h-[84vh] w-full border">
            <Excalidraw
                ref={excalidrawRef}
                initialData={{
                    elements: initialElements,
                    appState: {
                        zoom: 1.2,
                        scrollX: 0,
                        scrollY: 0,
                    },
                }}
                onChange={(elements) => onChange(elements)}
                UIOptions={{
                    canvasActions: {
                        changeViewBackgroundColor: false,
                        toggleScrollBehavior: true,
                        toggleTheme: false,
                        saveToActiveFile: false,
                        clearCanvas: false,
                        export: false,
                        loadScene: false,
                        toggleGridMode: false,
                        zoom: false, // Disables zoom controls
                    },
                }}
            />
        </div>
    );
};

export default ExcalidrawWrapper;