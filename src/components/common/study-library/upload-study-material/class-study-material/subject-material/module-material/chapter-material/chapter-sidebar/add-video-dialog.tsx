import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { DialogContent } from "@radix-ui/react-dialog";
import { useState } from "react";

export const AddVideoDialog = () => {
    const [videoUrl, setVideoUrl] = useState("");
    const [title, setTitle] = useState("");

    const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVideoUrl(e.target.value);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    return (
        <DialogContent className="flex flex-col items-center gap-6">
            {/* Add your Video upload form content here */}
            <MyInput
                required={true}
                input={videoUrl}
                label="Video URL"
                placeholder="Enter YouTube video URL here"
                onChangeFunction={handleVideoUrlChange}
            />
            <MyInput
                required={true}
                input={title}
                label="Video URL"
                placeholder="File name"
                onChangeFunction={handleTitleChange}
            />
            <MyButton buttonType="primary" layoutVariant="default" scale="large">
                Add Video
            </MyButton>
        </DialogContent>
    );
};
