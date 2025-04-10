import { YooptaPlugin, SlateElement } from "@yoopta/editor";
import "katex/dist/katex.min.css";
import { MathBlockComponent } from "./MathBlockComponent";

export type MathElement = SlateElement & {
    type: "math";
    math: string;
};

export const MathBlockPlugin = new YooptaPlugin<{ math: MathElement }>({
    type: "math",
    elements: {
        math: {
            render: MathBlockComponent,
        },
    },
});
