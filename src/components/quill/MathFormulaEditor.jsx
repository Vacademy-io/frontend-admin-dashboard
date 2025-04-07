import React, { useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import mathquill4quill from "mathquill4quill";
import katex from "katex";
import "katex/dist/katex.min.css";
import "@edtr-io/mathquill/build/mathquill.css";
import "@edtr-io/mathquill/build/mathquill.js";
import "mathquill4quill/mathquill4quill.css";
import { ALL_OPERATORS } from "@/components/quill/Operators";


export const MathFormulaEditor = ({ value, onChange }) => {
    const quillRef = useRef<ReactQuill | null>(null);
    const mathQuillInitialized = useRef(false);
    const [isFormulaBoxOpen, setIsFormulaBoxOpen] = useState(false);

    useEffect(() => {
        const quill = quillRef.current?.getEditor();
        if (quill && !mathQuillInitialized.current) {
            const enableMathQuillFormulaAuthoring = mathquill4quill({ Quill, katex });
            enableMathQuillFormulaAuthoring(quill, {
                operators: ALL_OPERATORS,
                displayHistory: false,
            });
            mathQuillInitialized.current = true;
        }
    }, []);

    useEffect(() => {
        const checkFormulaBox = () => {
            const formulaBox = document.querySelector(".mq-editable-field");
            setIsFormulaBoxOpen(!!formulaBox);
        };

        const interval = setInterval(checkFormulaBox, 200);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className={`${isFormulaBoxOpen ? "h-96" : ""} overflow-auto rounded border p-2`}>
                <ReactQuill
                    ref={quillRef}
                    value={value}
                    onChange={onChange}
                    theme="snow"
                    modules={{
                        toolbar: [["formula"]],
                        formula: true,
                    }}
                />
            </div>
        </>
    );
};
