import { SlateElement } from "@yoopta/editor";
import { useState } from "react";
import "katex/dist/katex.min.css";
import { MathFormulaEditor } from "@/components/quill/MathFormulaEditor";
import { PPTViewQuillEditor } from "@/components/quill/PPTViewQuillEditor";

// export type MathElement = SlateElement & {
//     type: "math";
//     math: string;
// };

export const MathBlockComponent = ({ element, attributes, children }) => {
    const [editing, setEditing] = useState(true);
    const [value, setValue] = useState(element.math);

    const handleSave = () => {
        setEditing(false);
    };

    // function quillHtmlToPlainTextWithFormulas(html: string): string {
    //     const parser = new DOMParser();
    //     const doc = parser.parseFromString(html, "text/html");

    //     // Replace each formula span with its data-value
    //     doc.querySelectorAll(".ql-formula").forEach((formulaSpan) => {
    //         const latex = formulaSpan.getAttribute("data-value") || "";
    //         const textNode = document.createTextNode(latex);
    //         formulaSpan.parentNode?.replaceChild(textNode, formulaSpan);
    //     });

    //     // Extract and return plain text
    //     return doc.body.textContent || "";
    // }

    return (
        <div {...attributes} contentEditable={false} className="rounded-md bg-gray-50 p-4">
            {editing ? (
                <>
                    <MathFormulaEditor value={value} onChange={setValue} />
                    <div className="mt-2 text-right">
                        <button
                            onClick={handleSave}
                            className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
                        >
                            Save Formula
                        </button>
                    </div>
                </>
            ) : (
                <div onClick={() => setEditing(true)}>
                    <PPTViewQuillEditor value={value} onChange={setValue} />
                </div>
            )}
            <div style={{ display: "none" }}>{children}</div>
        </div>
    );
};
