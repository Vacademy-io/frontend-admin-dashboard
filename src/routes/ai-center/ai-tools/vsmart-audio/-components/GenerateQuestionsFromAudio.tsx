import { useEffect, useRef, useState } from "react";
import { GenerateCard } from "../../../-components/GenerateCard";
import { useFileUpload } from "@/hooks/use-file-upload";
import { getInstituteId } from "@/constants/helper";
import {
    handleStartProcessUploadedAudioFile,
    handleGetQuestionsFromAudio,
} from "../../../-services/ai-center-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAICenter } from "../../../-contexts/useAICenterContext";
import GenerateQuestionsFromAudioForm from "./GenerateQuestionsFromAudioForm";
import { QuestionsFromTextData } from "@/routes/ai-center/ai-tools/vsmart-prompt/-components/GenerateQuestionsFromText";

export const GenerateQuestionsFromAudio = () => {
    const [audioId, setAudioId] = useState("");
    const queryClient = useQueryClient();
    const [taskName, setTaskName] = useState("");
    const instituteId = getInstituteId();
    const { uploadFile } = useFileUpload();
    const { setLoader, key, setKey } = useAICenter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileUploading, setFileUploading] = useState(false);

    const handleUploadClick = () => {
        setKey("audio");
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileId = await uploadFile({
                file,
                setIsUploading: setFileUploading,
                userId: "your-user-id",
                source: instituteId,
                sourceId: "STUDENTS",
            });
            if (fileId) {
                const response = await handleStartProcessUploadedAudioFile(fileId);
                if (response) {
                    setAudioId(response.pdf_id);
                }
            }
            event.target.value = "";
        }
    };

    const getQuestionsFromAudioMutation = useMutation({
        mutationFn: async ({
            audioId,
            numQuestions,
            prompt,
            difficulty,
            language,
            taskName,
        }: {
            audioId: string;
            numQuestions: string;
            prompt: string;
            difficulty: string;
            language: string;
            taskName: string;
        }) => {
            setLoader(true);
            setKey("audio");
            return handleGetQuestionsFromAudio(
                audioId,
                numQuestions,
                prompt,
                difficulty,
                language,
                taskName,
            );
        },
        onSuccess: () => {
            setLoader(false);
            setKey(null);
            queryClient.invalidateQueries({ queryKey: ["GET_INDIVIDUAL_AI_LIST_DATA"] });
        },
        onError: (error: unknown) => {
            console.log(error);
        },
    });

    const pollGenerateQuestionsFromAudio = (data: QuestionsFromTextData) => {
        getQuestionsFromAudioMutation.mutate({
            audioId,
            numQuestions: data.num.toString(),
            prompt: data.text,
            difficulty: data.class_level,
            language: data.question_language,
            taskName: data.taskName,
        });
    };

    const handleCallApi = (
        audioId: string,
        numQuestions: string,
        prompt: string,
        difficulty: string,
        language: string,
        taskName: string,
    ) => {
        getQuestionsFromAudioMutation.mutate({
            audioId,
            numQuestions,
            prompt,
            difficulty,
            language,
            taskName,
        });
    };

    useEffect(() => {
        if (key === "audio") {
            if (fileUploading == true) setLoader(true);
        }
    }, [fileUploading, key]);

    return (
        <>
            <GenerateCard
                handleUploadClick={handleUploadClick}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                cardTitle="Generate Questions From Audio"
                cardDescription="Upload WAV/FLAC/MP3/AAC/M4A"
                inputFormat=".mp3,.wav,.flac,.aac,.m4a"
                keyProp="audio"
                taskName={taskName}
                setTaskName={setTaskName}
                pollGenerateQuestionsFromAudio={pollGenerateQuestionsFromAudio}
            />
            {audioId !== "" && (
                <GenerateQuestionsFromAudioForm audioId={audioId} handleCallApi={handleCallApi} />
            )}
        </>
    );
};
