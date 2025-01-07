import { MyButton } from "@/components/design-system/button";
import { MyDropdown } from "@/components/design-system/dropdown";
import { useSidebar } from "@/components/ui/sidebar";
import { Plus, FilePdf, FileDoc, YoutubeLogo } from "@phosphor-icons/react";

export const ChapterSidebarAddButton = () => {
    const { open } = useSidebar();

    const dropdownList = [
        {
            label: "Pdf",
            value: "pdf",
            icon: <FilePdf className="size-4" />,
        },
        {
            label: "Doc",
            value: "doc",
            icon: <FileDoc className="size-4" />,
            subItems: [
                { label: "Upload from device", value: "upload-doc" },
                { label: "Create new doc", value: "create-doc" },
            ],
        },
        {
            label: "Video",
            value: "video",
            icon: <YoutubeLogo className="size-4" />,
        },
    ];

    const handleSelect = (value: string) => {
        switch (value) {
            case "pdf":
                console.log("Handle PDF upload");
                break;
            case "upload-doc":
                console.log("Handle Doc upload");
                break;
            case "create-doc":
                console.log("Handle Doc creation");
                break;
            case "video":
                console.log("Handle Video upload");
                break;
        }
    };

    return (
        <MyDropdown dropdownList={dropdownList} onSelect={handleSelect}>
            <MyButton
                buttonType="primary"
                scale="large"
                layoutVariant={open ? "default" : "icon"}
                className={`${open ? "" : ""}`}
            >
                <Plus />
                <p className={`${open ? "visible" : "hidden"}`}>Add</p>
            </MyButton>
        </MyDropdown>
    );
};
