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

const QuillEditor = ({ value, onChange }) => {
    const [selectedFormulaType, setSelectedFormulaType] = useState("Math");
    const operators = selectedFormulaType === "Math" ? MATH_OPERATORS : GREEK_OPERATORS;
    const reactQuillRef = useRef(null);

    const handleSelectFormulaType = (formulaType) => {
        setSelectedFormulaType(formulaType);
        const mathButton = document.querySelector(".math-btn");
        const greekButton = document.querySelector(".greek-btn");
        mathButton.style.borderBottom = formulaType === "Math" ? "2px solid blue" : "none";
        greekButton.style.borderBottom = formulaType === "Greek" ? "2px solid blue" : "none";
    };

    useEffect(() => {
        // Reinitialize MathQuill formula authoring whenever the selected type changes
        const enableMathQuillFormulaAuthoring = mathquill4quill({ Quill, katex });
        const quill = reactQuillRef.current?.getEditor();
        if (quill) {
            enableMathQuillFormulaAuthoring(quill, {
                operators,
            });
        }
    }, [selectedFormulaType]);

    // Attach the custom handler to the formula button after Quill is initialized
    useEffect(() => {
        const quill = reactQuillRef.current?.getEditor();
        const formulaTooltip = document.querySelector(".ql-tooltip");
        if (quill && formulaTooltip) {
            // Create a container div with a custom class
            const buttonContainer = document.createElement("div");
            buttonContainer.className = "custom-button-container";

            // Create the "Math" button
            const mathButton = document.createElement("button");
            mathButton.innerText = "Math";
            mathButton.className = "math-btn";
            mathButton.style.borderBottom = "2px solid blue";

            mathButton.addEventListener("click", (e) => {
                e.preventDefault();
                handleSelectFormulaType("Math");
            });
            buttonContainer.appendChild(mathButton);

            // Create the "Greek" button
            const greekButton = document.createElement("button");
            greekButton.innerText = "Greek";
            greekButton.className = "greek-btn";
            greekButton.addEventListener("click", (e) => {
                e.preventDefault();
                handleSelectFormulaType("Greek");
            });
            buttonContainer.appendChild(greekButton);

            // Append the container div to the formula tooltip
            formulaTooltip.appendChild(buttonContainer);
        }
    }, []);

    const modules = {
        toolbar: [
            ["bold", "italic", "underline"], // Text formatting buttons
            [{ align: [] }], // Alignment buttons (left, center, right)
            [{ list: "ordered" }, { list: "bullet" }], // List buttons (numbered and dot)
            ["formula"], // Formula button placed at the end
        ],
        formula: true, // Formula button to insert math expressions
    };

    return (
        <ReactQuill
            ref={reactQuillRef}
            modules={modules}
            theme="snow"
            value={value}
            onChange={onChange}
        />
    );
};

export default QuillEditor;
