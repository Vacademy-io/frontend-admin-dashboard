// import { useMemo, useState } from "react";
// import YooptaEditor, { createYooptaEditor, YooEditor, YooptaContentValue } from "@yoopta/editor";
// import Paragraph from "@yoopta/paragraph";
// import Image from "@yoopta/image";

// const plugins = [Paragraph,
//     Image
// ];

// export const ChapterMaterial = () => {
//     const editor: YooEditor = useMemo(() => createYooptaEditor(), []);
//     const [value, setValue] = useState<YooptaContentValue>();

//     //   const onChange = (value: YooptaContentValue, options: YooptaOnChangeOptions) => {
//     //     setValue(value);
//     //   };

//     const onChange = (value: YooptaContentValue) => {
//         setValue(value);
//     };

//     return (
//         <div>
//             <YooptaEditor
//                 editor={editor}
//                 plugins={plugins}
//                 placeholder="Type something"
//                 value={value}
//                 onChange={onChange}
//             />
//         </div>
//     );
// };

import YooptaEditor, {
    createYooptaEditor,
    // Elements,
    // Blocks,
    // useYooptaEditor,
    // YooptaContentValue,
    // YooptaOnChangeOptions,
} from "@yoopta/editor";

import Paragraph from "@yoopta/paragraph";
import Blockquote from "@yoopta/blockquote";
import Embed from "@yoopta/embed";
import Image from "@yoopta/image";
import Link from "@yoopta/link";
import Callout from "@yoopta/callout";
import Video from "@yoopta/video";
import File from "@yoopta/file";
//   import Accordion from '@yoopta/accordion';
import { NumberedList, BulletedList, TodoList } from "@yoopta/lists";
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from "@yoopta/marks";
import { HeadingOne, HeadingThree, HeadingTwo } from "@yoopta/headings";
import Code from "@yoopta/code";
//   import Table from '@yoopta/table';
import Divider from "@yoopta/divider";
import ActionMenuList, { DefaultActionMenuRender } from "@yoopta/action-menu-list";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import LinkTool, { DefaultLinkToolRender } from "@yoopta/link-tool";

//   import { uploadToCloudinary } from '@/utils/cloudinary';
import { useMemo, useRef } from "react";
//   import { WITH_BASIC_INIT_VALUE } from './initValue';

const plugins = [
    Paragraph,
    // Table,
    Divider,
    // Accordion,
    HeadingOne,
    HeadingTwo,
    HeadingThree,
    Blockquote,
    Callout,
    NumberedList,
    BulletedList,
    TodoList,
    Code,
    Link,
    Embed,
    Image,
    Video,
    File,
];

const TOOLS = {
    ActionMenu: {
        render: DefaultActionMenuRender,
        tool: ActionMenuList,
    },
    Toolbar: {
        render: DefaultToolbarRender,
        tool: Toolbar,
    },
    LinkTool: {
        render: DefaultLinkToolRender,
        tool: LinkTool,
    },
};

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

export const ChapterMaterial = () => {
    // const [value, setValue] = useState();
    const editor = useMemo(() => createYooptaEditor(), []);
    const selectionRef = useRef(null);

    // const onChange = (newValue: YooptaContentValue, options: YooptaOnChangeOptions) => {
    //   setValue(newValue);
    // };

    return (
        <div
            className="flex justify-center bg-primary-50 px-[20px] pb-[40px] pt-[80px] md:py-[100px] md:pl-[200px] md:pr-[80px]"
            ref={selectionRef}
        >
            <YooptaEditor
                editor={editor}
                plugins={plugins}
                tools={TOOLS}
                marks={MARKS}
                selectionBoxRoot={selectionRef}
                //   onChange={onChange}
                autoFocus
            />
        </div>
    );
};
