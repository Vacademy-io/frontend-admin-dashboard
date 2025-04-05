// import { useState } from "react";
// import katex from "katex";
// import "katex/dist/katex.min.css";

// const symbols = [
//     { label: "Fraction", latex: "\\frac{a}{b}" },
//     { label: "Square Root", latex: "\\sqrt{x}" },
//     { label: "Sigma", latex: "\\sum_{i=1}^{n} i" },
//     { label: "Pi", latex: "\\pi" },
// ];

// export const MathEditor = ({
//     value,
//     onChange,
// }: {
//     value: string;
//     onChange: (v: string) => void;
// }) => {
//     const [input, setInput] = useState(value);

//     const insertLatex = (latex: string) => {
//         setInput((prev) => prev + " " + latex);
//         onChange(input + " " + latex);
//     };

//     let rendered = "";
//     try {
//         rendered = katex.renderToString(input, {
//             throwOnError: false,
//             displayMode: true,
//         });
//     } catch (err) {
//         console.log('error ' , err)
//         rendered = "<span style='color:red;'>Invalid LaTeX</span>";
//     }

//     return (
//         <div className="space-y-2">
//             this is rendering or not
//             <div className="flex flex-wrap gap-2">
//                 {symbols.map((s) => (
//                     <button
//                         key={s.label}
//                         className="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300"
//                         onClick={() => insertLatex(s.latex)}
//                     >
//                         {s.label}
//                     </button>
//                 ))}
//             </div>
//             <textarea
//                 className="w-full rounded border p-2"
//                 rows={3}
//                 value={input}
//                 onChange={(e) => {
//                     setInput(e.target.value);
//                     onChange(e.target.value);
//                 }}
//             />
//             <div
//                 className="rounded border bg-gray-50 p-2"
//                 dangerouslySetInnerHTML={{ __html: rendered }}
//             />
//         </div>
//     );
// };
