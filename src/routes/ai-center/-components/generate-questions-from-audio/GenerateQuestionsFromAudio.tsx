import { useRef } from "react";
import { GenerateCard } from "../GenerateCard";

export const GenerateQuestionsFromAudio = () => {
    const isUploading = false;
    const handleUploadClick = () => {};
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.files);
    };

    return (
        <div>
            <GenerateCard
                handleUploadClick={handleUploadClick}
                isUploading={isUploading}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                cardTitle="Generate Questions From Audio"
                cardDescription="Upload WAV/FLAC/MP3/AAC/M4A"
                inputFormat=".mp3,.wav,.flac,.aac,.m4a"
            />
        </div>
    );
};
