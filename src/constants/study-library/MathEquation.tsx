// import { YooptaPlugin, SlateElement } from "@yoopta/editor";
// import { useState } from "react";
// import katex from "katex";
// import "katex/dist/katex.min.css";
// import { MathEditor } from "./MathEditor";
// import { useYooptaEditor } from "@yoopta/editor";
// import { Transforms, Editor, Path, Node } from "slate";

// // helper to find element path
// const findElementPathById = (editor: Editor, id: string): Path | null => {
//     for (const [node, path] of Node.nodes(editor)) {
//         if (!Editor.isEditor(node) && (node as any).id === id) {
//             return path;
//         }
//     }
//     return null;
// };

// type MathElement = SlateElement & {
//     type: "math";
//     math: string;
// };

// export const MathBlockPlugin = new YooptaPlugin<{ math: MathElement }, { math?: string }>({
//     type: "math",
//     elements: {
//         math: {
//             render: ({ element, attributes, children }) => {
//                 const editor = useYooptaEditor() as unknown as Editor;
//                 const mathElement = element as MathElement;
//                 const [editing, setEditing] = useState(false);

//                 const handleChange = (newLatex: string) => {
//                     const path = findElementPathById(editor, mathElement.id);
//                     if (path) {
//                         Transforms.setNodes(editor, { math: newLatex } as Partial<MathElement>, {
//                             at: path,
//                         });
//                     }
//                 };

//                 return (
//                     <div
//                         {...attributes}
//                         onClick={() => setEditing(true)}
//                         className="rounded bg-gray-100 p-4"
//                     >
//                         {editing ? (
//                             <MathEditor value={mathElement.math} onChange={handleChange} />
//                         ) : (
//                             <div
//                                 dangerouslySetInnerHTML={{
//                                     __html: katex.renderToString(mathElement.math || "", {
//                                         throwOnError: false,
//                                         displayMode: true,
//                                     }),
//                                 }}
//                             />
//                         )}
//                         {children}
//                     </div>
//                 );
//             },

//             props: {
//                 math: "\\frac{a}{b}",
//             },
//         },
//     },
// });
