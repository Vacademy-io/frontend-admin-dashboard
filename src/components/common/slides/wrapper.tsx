import { Excalidraw } from "@excalidraw/excalidraw";

import "@excalidraw/excalidraw/index.css";

const ExcalidrawWrapper: React.FC = () => {
    return (
        <div className="m-8 aspect-video w-[70%] border p-4">
            <Excalidraw />
        </div>
    );
};
export default ExcalidrawWrapper;
