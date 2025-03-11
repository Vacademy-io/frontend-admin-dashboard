import { Canvas } from "fabric";
import useFabric from "./canvas"; // Adjust the import path as necessary
import { FaPen } from "react-icons/fa6";
import { Check, Trash2, Type, X } from "lucide-react";
import { Circle, Rectangle } from "phosphor-react";

const useCanvasTools = (fabricCanvas: Canvas | null) => {
    const canvasUtils = useFabric(fabricCanvas);

    const tools = [
        {
            icon: <FaPen className="size-6 text-blue-600" />,
            label: "Pen",
            action: () => canvasUtils.addPenTool("black"),
        },
        {
            icon: <Check className="size-6 text-green-600" />,
            label: "Tick",
            action: () => canvasUtils.addSymbol("✓", "green"),
        },
        {
            icon: <X className="size-6 text-red-600" />,
            label: "Cross",
            action: () => canvasUtils.addSymbol("✗", "red"),
        },
        { icon: <Type className="size-6" />, label: "Text", action: canvasUtils.addTextBox },
        {
            icon: <Rectangle className="size-5 text-red-600" />,
            label: "Box",
            action: canvasUtils.addRectangle,
        },
        {
            icon: <Circle className="size-5 text-red-600" />,
            label: "Circle",
            action: canvasUtils.addCircle,
        },
        {
            icon: <Trash2 className="size-6 text-red-600" />,
            label: "Delete",
            action: canvasUtils.deleteSelectedShape,
        },
    ];

    const numbers = [
        ...Array.from({ length: 10 }, (_, i) => ({
            value: i.toString(),
            action: () => canvasUtils.addNumber(i.toString()),
        })),
        { value: "1/2", action: () => canvasUtils.addNumber("1/2") },
        { value: "3/4", action: () => canvasUtils.addNumber("3/4") },
        { value: "0.5", action: () => canvasUtils.addNumber("0.5") },
        { value: "0.75", action: () => canvasUtils.addNumber("0.75") },
    ];

    return { tools, numbers };
};

export default useCanvasTools;
