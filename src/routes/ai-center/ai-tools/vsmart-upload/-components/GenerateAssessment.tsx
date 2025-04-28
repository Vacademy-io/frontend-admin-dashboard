import { getInstituteId } from "@/constants/helper";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useRef, useState } from "react";
import {
    handleConvertPDFToHTML,
    handleGenerateAssessmentQuestions,
    handleStartProcessUploadedFile,
} from "@/routes/ai-center/-services/ai-center-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import GeneratePageWiseAssessment from "./GeneratePageWiseAssessment";
import { GenerateAssessmentDialog } from "./GenerateAssessmentDialog";
import { GenerateCard } from "@/routes/ai-center/-components/GenerateCard";
import { useAICenter } from "@/routes/ai-center/-contexts/useAICenterContext";
import AITasksList from "@/routes/ai-center/-components/AITasksList";

const GenerateAIAssessmentComponent = () => {
    const queryClient = useQueryClient();
    const [allPagesGenerateQuestionsStatus, setAllPagesGenerateQuestionsStatus] = useState(false);
    const [pageWiseGenerateQuestionsStatus, setPageWiseGenerateQuestionsStatus] = useState(false);
    const [taskName, setTaskName] = useState("");
    const instituteId = getInstituteId();
    const { setLoader, key, setKey } = useAICenter();
    const { uploadFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [openAssessmentDialog, setOpenAssessmentDialog] = useState(false);
    const [uploadedFilePDFId, setUploadedFilePDFId] = useState("");
    const [htmlData, setHtmlData] = useState(null);
    const [openPageWiseAssessmentDialog, setOpenPageWiseAssessmentDialog] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);

    const handleOpenAssessmentDialog = (open: boolean) => {
        setOpenAssessmentDialog(open);
    };

    const handleUploadClick = () => {
        setKey("assessment");
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
                const response = await handleStartProcessUploadedFile(fileId);
                if (response) {
                    setOpenAssessmentDialog(true);
                    setUploadedFilePDFId(response.pdf_id);
                }
            }
            event.target.value = "";
        }
    };

    /* Generate Assessment Complete */
    const generateAssessmentMutation = useMutation({
        mutationFn: ({
            pdfId,
            userPrompt,
            taskName,
        }: {
            pdfId: string;
            userPrompt: string;
            taskName: string;
        }) => {
            setLoader(true);
            setKey("assessment");
            return handleGenerateAssessmentQuestions(pdfId, userPrompt, taskName);
        },
        onSuccess: () => {
            setAllPagesGenerateQuestionsStatus(false);
            setLoader(false);
            setKey(null);
            queryClient.invalidateQueries({ queryKey: ["GET_INDIVIDUAL_AI_LIST_DATA"] });
        },
        onError: (error: unknown) => {
            console.log(error);
        },
    });

    const pollGenerateAssessment = () => {
        generateAssessmentMutation.mutate({
            pdfId: uploadedFilePDFId,
            userPrompt: "",
            taskName,
        });
    };

    const handleConvertPDFToHTMLMutation = useMutation({
        mutationFn: ({ pdfId, taskName }: { pdfId: string; taskName: string }) =>
            handleConvertPDFToHTML(pdfId, taskName),
        onSuccess: async (response) => {
            setPageWiseGenerateQuestionsStatus(false);
            setHtmlData(response?.html);
            setOpenPageWiseAssessmentDialog(true);
        },
        onError: (error: unknown) => {
            console.log(error);
        },
    });

    const pollConvertPDFToHTML = () => {
        handleConvertPDFToHTMLMutation.mutate({ pdfId: uploadedFilePDFId, taskName });
    };

    useEffect(() => {
        if (key === "assessment") {
            if (fileUploading == true) setLoader(true);
        }
    }, [fileUploading, key]);

    return (
        <div className="flex items-center justify-start gap-8">
            <GenerateCard
                handleUploadClick={handleUploadClick}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                cardTitle="Generate Assessment"
                cardDescription="Upload PDF/DOCX/PPT"
                inputFormat=".pdf,.doc,.docx,.ppt,.pptx,.html"
                keyProp="assessment"
                taskName={taskName}
                setTaskName={setTaskName}
            />
            <GenerateAssessmentDialog
                open={openAssessmentDialog}
                handleOpen={handleOpenAssessmentDialog}
                handleGenerateCompleteFile={pollGenerateAssessment}
                handleGeneratePageWise={pollConvertPDFToHTML}
                allPagesGenerateQuestionsStatus={allPagesGenerateQuestionsStatus}
                pageWiseGenerateQuestionsStatus={pageWiseGenerateQuestionsStatus}
            />
            {generateAssessmentMutation.status === "success" && (
                <AITasksList heading="Vsmart Upload" enableDialog={true} />
            )}
            <GeneratePageWiseAssessment
                openPageWiseAssessmentDialog={openPageWiseAssessmentDialog}
                setOpenPageWiseAssessmentDialog={setOpenPageWiseAssessmentDialog}
                htmlData={htmlData}
            />
        </div>
    );
};

export default GenerateAIAssessmentComponent;
