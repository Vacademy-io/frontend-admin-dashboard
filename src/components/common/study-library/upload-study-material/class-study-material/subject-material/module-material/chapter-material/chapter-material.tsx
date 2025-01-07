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
import { MyButton } from "@/components/design-system/button";
import { DotsThree } from "@phosphor-icons/react";
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
        <div className="flex w-full flex-col" ref={selectionRef}>
            <div className="-mx-8 -my-8 flex items-center justify-between gap-6 border-b border-neutral-300 px-8 py-4">
                <h3 className="text-h3 font-semibold text-neutral-600">
                    Understanding the Human Eye
                </h3>
                <div className="flex items-center gap-6">
                    <MyButton buttonType="primary" scale="large" layoutVariant="default">
                        Stats
                    </MyButton>
                    <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                        Edit
                    </MyButton>
                    <MyButton buttonType="secondary" scale="large" layoutVariant="icon">
                        <DotsThree />
                    </MyButton>
                </div>
            </div>
            <div className="mt-14 h-full w-full px-10">
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
        </div>
    );
};
