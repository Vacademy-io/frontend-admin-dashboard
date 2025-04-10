import { SlateElement, PluginElementRenderProps } from "@yoopta/editor";
import { useState } from "react";
import "katex/dist/katex.min.css";
import { MathFormulaEditor } from "@/components/quill/MathFormulaEditor";
import { PPTViewQuillEditor } from "@/components/quill/PPTViewQuillEditor";
import { MyButton } from "@/components/design-system/button";

export type MathElement = SlateElement & {
    type: "math";
    math: string;
};

export const MathBlockComponent = ({ element, attributes, children }: PluginElementRenderProps) => {
    // Cast safely to MathElement
    const mathElement = element as MathElement;

    const [editing, setEditing] = useState(true);
    const [value, setValue] = useState(mathElement.math);

    const handleSave = () => {
        setEditing(false);
    };

    return (
        <div {...attributes} className="rounded-md bg-gray-50 p-4">
            {editing ? (
                <>
                    {/* <div contentEditable={false}> */}
                    <MathFormulaEditor value={value} onChange={setValue} />
                    <div className="mt-2 text-right">
                        <MyButton onClick={handleSave}>Save Formula</MyButton>
                    </div>
                    {/* </div> */}
                </>
            ) : (
                <div contentEditable={false} onClick={() => setEditing(true)}>
                    <PPTViewQuillEditor value={value} onChange={setValue} />
                </div>
            )}
            {/* This is needed to allow Slate to track children */}
            <div className="hidden">{children}</div>
        </div>
    );
};
