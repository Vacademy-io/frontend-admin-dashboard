import { useMemo, useState } from "react";
import YooptaEditor, { createYooptaEditor, YooEditor, YooptaContentValue } from "@yoopta/editor";
import Paragraph from "@yoopta/paragraph";
import Image from "@yoopta/image";

const plugins = [Paragraph, Image];

export const ChapterMaterial = () => {
    const editor: YooEditor = useMemo(() => createYooptaEditor(), []);
    const [value, setValue] = useState<YooptaContentValue>();

    //   const onChange = (value: YooptaContentValue, options: YooptaOnChangeOptions) => {
    //     setValue(value);
    //   };
    const onChange = (value: YooptaContentValue) => {
        setValue(value);
    };

    return (
        <div>
            <YooptaEditor
                editor={editor}
                plugins={plugins}
                placeholder="Type something"
                value={value}
                onChange={onChange}
            />
        </div>
    );
};
