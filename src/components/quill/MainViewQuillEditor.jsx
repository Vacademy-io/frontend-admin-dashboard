import katex from "katex";
window.katex = katex;
import "katex/dist/katex.css";

import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./jquery";

import "@edtr-io/mathquill/build/mathquill.js";
import "@edtr-io/mathquill/build/mathquill.css";

import mathquill4quill from "mathquill4quill";
import "mathquill4quill/mathquill4quill.css";
import "./index.css";
import { useEffect, useRef, useState } from "react";
import { GREEK_OPERATORS, MATH_OPERATORS } from "./Operators";

export const MainViewQuillEditor = ({ value, onChange }) => {
    const [selectedFormulaType, setSelectedFormulaType] = useState("Math");
    const operators = selectedFormulaType === "Math" ? MATH_OPERATORS : GREEK_OPERATORS;
    const reactQuillRef = useRef(null);
    const mathQuillInitialized = useRef(false); // Flag to prevent multiple initializations

    const handleSelectFormulaType = (formulaType) => {
        setSelectedFormulaType(formulaType);

        // Update UI for selected button
        const mathButton = document.querySelector(".math-btn");
        const greekButton = document.querySelector(".greek-btn");
        mathButton.style.borderBottom = formulaType === "Math" ? "2px solid blue" : "none";
        greekButton.style.borderBottom = formulaType === "Greek" ? "2px solid blue" : "none";

        // Dynamically update operators in MathQuill
        const quill = reactQuillRef.current?.getEditor();
        if (quill) {
            const formulaAuthoring = quill.getModule("formulaAuthoring");
            if (formulaAuthoring) {
                console.log(`Updating operators for ${formulaType}`);
                formulaAuthoring.setOperators(operators);
            }
        }
    };

    useEffect(() => {
        // Initialize MathQuill formula authoring only once
        if (!mathQuillInitialized.current) {
            const enableMathQuillFormulaAuthoring = mathquill4quill({ Quill, katex });
            const quill = reactQuillRef.current?.getEditor();
            if (quill) {
                enableMathQuillFormulaAuthoring(quill, { operators });
                mathQuillInitialized.current = true; // Mark as initialized
            }
        }
    }, []); // Only run on mount

    useEffect(() => {
        const quill = reactQuillRef.current?.getEditor();
        const formulaTooltip = document.querySelector(".ql-tooltip");

        if (quill && formulaTooltip) {
            // Avoid adding duplicate buttons
            if (!formulaTooltip.querySelector(".custom-button-container")) {
                const buttonContainer = document.createElement("div");
                buttonContainer.className = "custom-button-container";

                const mathButton = document.createElement("button");
                mathButton.innerText = "Math";
                mathButton.className = "math-btn";
                mathButton.style.borderBottom = "2px solid blue";
                mathButton.addEventListener("click", (e) => {
                    e.preventDefault();
                    handleSelectFormulaType("Math");
                });
                buttonContainer.appendChild(mathButton);

                const greekButton = document.createElement("button");
                greekButton.innerText = "Greek";
                greekButton.className = "greek-btn";
                greekButton.addEventListener("click", (e) => {
                    e.preventDefault();
                    handleSelectFormulaType("Greek");
                });
                buttonContainer.appendChild(greekButton);

                formulaTooltip.appendChild(buttonContainer);
            }
        }
    }, []); // Add dependencies

    const rightBarmodules = {
        toolbar: {
            container: [
                ["bold", "italic", "underline"],
                [{ align: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                ["formula"], // Formula button
            ],
        },
        formula: true, // Temporary Disabling formula functionality
    };

    return (
        <ReactQuill
            ref={reactQuillRef}
            modules={rightBarmodules}
            theme="snow"
            value={value}
            onChange={onChange}
            preserveWhitespace={true}
        />
    );
};
