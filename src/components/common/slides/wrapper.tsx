import { Excalidraw } from "@excalidraw/excalidraw";

import "@excalidraw/excalidraw/index.css";

const ExcalidrawWrapper: React.FC = () => {
    return (
        <div className="aspect-video w-[70%] border p-4 mt-20">
            <Excalidraw />
        </div>
    );
};
export default ExcalidrawWrapper;
