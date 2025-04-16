import { useEffect, useRef, useState } from "react";
import { GenerateCard } from "../GenerateCard";
import { useFileUpload } from "@/hooks/use-file-upload";
import { getInstituteId } from "@/constants/helper";
import { handleStartProcessUploadedAudioFile } from "../../-services/ai-center-service";

export const GenerateQuestionsFromAudio = () => {
    const instituteId = getInstituteId();
    const { uploadFile } = useFileUpload();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFilePDFId, setUploadedFilePDFId] = useState("");

    useEffect(() => {
        if (uploadedFilePDFId) {
            console.log(uploadedFilePDFId);
        }
    }, [uploadedFilePDFId]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileId = await uploadFile({
                file,
                setIsUploading,
                userId: "your-user-id",
                source: instituteId,
                sourceId: "STUDENTS",
            });
            if (fileId) {
                const response = await handleStartProcessUploadedAudioFile(fileId);
                if (response) {
                    setUploadedFilePDFId(response.pdf_id);
                }
            }
            event.target.value = "";
        }
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
