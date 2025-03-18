import { Canvas } from "fabric";
import useFabric from "./canvas"; // Adjust the import path as necessary
import { FaPen } from "react-icons/fa6";
import { Check, Trash2, Type, X } from "lucide-react";
import { Circle, Rectangle } from "phosphor-react";

const useCanvasTools = (fabricCanvas: Canvas | null) => {
    const canvasUtils = useFabric(fabricCanvas);

    const tools = [
        {
            icon: FaPen,
            label: "Pen",
            color: "text-blue-600",
            action: () => canvasUtils.addPenTool("black"),
        },
        {
            icon: Check,
            label: "Tick",
            color: "text-green-600",
            action: () => canvasUtils.addSymbol("✓", "green"),
        },
        {
            icon: X,
            label: "Cross",
            color: "text-red-600",
            action: () => canvasUtils.addSymbol("✗", "red"),
        },
        {
            icon: Type,
            label: "Text",
            color: "text-black",
            action: canvasUtils.addTextBox,
        },
        {
            icon: Rectangle,
            label: "Box",
            color: "text-black",
            action: canvasUtils.addRectangle,
        },
        {
            icon: Circle,
            label: "Circle",
            color: "text-black",
            action: canvasUtils.addCircle,
        },
        {
            icon: Trash2,
            label: "Delete",
            color: "text-red-600",
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
