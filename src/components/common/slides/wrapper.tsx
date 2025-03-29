
/* eslint-disable */
// @ts-nocheck
import { Excalidraw } from "../excalidraw/packages/excalidraw";
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



    const handleWheelCapture = (e: React.WheelEvent<HTMLDivElement>) => {
          e.stopPropagation();
    };
  
    return (
        <div className="aspect-video h-[84vh] w-full border"  onWheelCapture={handleWheelCapture}>
            
            <Excalidraw
                ref={excalidrawRef}
                initialData={{
                    elements: initialElements,
                    appState: {
                       
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
                      
                    },
                }}
            />
        </div>
    );
};

export default ExcalidrawWrapper;