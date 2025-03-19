import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useRef } from "react";

const ExcalidrawWrapper: React.FC = () => {
    const excalidrawRef = useRef<any>(null);

    useEffect(() => {
        const disableScrollAndZoom = (event: WheelEvent | TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();
        };

        // Prevent zooming via scroll, pinch, or touch
        document.addEventListener("wheel", disableScrollAndZoom, { passive: false });
        document.addEventListener("touchmove", disableScrollAndZoom, { passive: false });

        return () => {
            document.removeEventListener("wheel", disableScrollAndZoom);
            document.removeEventListener("touchmove", disableScrollAndZoom);
        };
    }, []);

    return (
        <div className="aspect-video h-[84vh] w-full border">
            <Excalidraw
                ref={excalidrawRef}
                initialData={{
                    appState: {
                        zoom: 1.2,
                        scrollX: 0,
                        scrollY: 0,
                    },
                }}
                UIOptions={{
                    canvasActions: {
                        changeViewBackgroundColor: false,
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
