import { YooptaPlugin, SlateElement } from "@yoopta/editor";
import "katex/dist/katex.min.css";
import { MathBlockComponent } from "./MathBlockComponent";

type MathElement = SlateElement & {
    type: "math";
    math: string;
};

export const MathBlockPlugin = new YooptaPlugin<{ math: MathElement }, { math?: string }>({
    type: "math",
    elements: {
        math: {
            render: MathBlockComponent,
            props: {
                math: "\\frac{a}{b}",
            },
        },
    },
});
