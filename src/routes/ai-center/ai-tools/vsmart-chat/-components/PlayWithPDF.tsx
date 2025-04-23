import { MyInput } from "@/components/design-system/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getInstituteId } from "@/constants/helper";
import { useFileUpload } from "@/hooks/use-file-upload";
import { GenerateCard } from "@/routes/ai-center/-components/GenerateCard";
import { useAICenter } from "@/routes/ai-center/-contexts/useAICenterContext";
import { handleStartProcessUploadedFile } from "@/routes/ai-center/-services/ai-center-service";
import { useEffect, useRef, useState } from "react";

interface QuestionWithAnswer {
    id: string;
    question: string;
    answer: string;
}

const PlayWithPDF = () => {
    const instituteId = getInstituteId();
    const { setLoader, key, setKey } = useAICenter();
    const { uploadFile } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploadedFilePDFId, setUploadedFilePDFId] = useState("");
    const [fileUploading, setFileUploading] = useState(false);
    const [open, setOpen] = useState(false);
    const handleUploadClick = () => {
        setKey("chat");
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
                    console.log("response ", response);
                    setUploadedFilePDFId(response.pdf_id);
                    setFileUploading(true);
                    setLoader(false);
                    setOpen(true);
                }
            }
            event.target.value = "";
        }
    };

    const [question, setQuestion] = useState("");
    const [questionsWithAnswers, setQuestionsWithAnswers] = useState<QuestionWithAnswer[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const handleAddQuestions = () => {
        if (question.trim() === "") return;

        setQuestionsWithAnswers((prev) => [
            ...prev,
            {
                id: String(prev.length + 1),
                question: question.trim(),
                answer: String(Math.random()), // Placeholder
            },
        ]);
        setQuestion("");
    };

    useEffect(() => {
        if (key === "chat") {
            if (fileUploading == true) setLoader(true);
        }
    }, [fileUploading, key]);

    // Scroll to bottom on update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [questionsWithAnswers]);

    return (
        <>
            <GenerateCard
                handleUploadClick={handleUploadClick}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                cardTitle="Play With PDF"
                cardDescription="Upload PDF/DOCX/PPT"
                inputFormat=".pdf,.doc,.docx,.ppt,.pptx,.html"
                keyProp="chat"
            />
            {uploadedFilePDFId.length > 0 && (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="!m-0 flex !h-full !w-full !max-w-full flex-col !rounded-none !p-0">
                        {/* Scrollable messages container */}
                        <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-6">
                            <div className="w-full max-w-[800px] space-y-6">
                                {questionsWithAnswers.map((qa) => (
                                    <div key={qa.id} className="flex flex-col gap-2">
                                        <div className="flex justify-end">
                                            <p className="rounded-xl bg-neutral-100 px-4 py-2 text-black">
                                                {qa.question}
                                            </p>
                                        </div>
                                        <div className="flex justify-start">
                                            <p className="rounded-xl bg-blue-100 px-4 py-2 text-black">
                                                {qa.answer}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input at bottom */}
                        <div className="border-t px-4 py-6">
                            <div className="mx-auto flex w-full max-w-[800px] flex-col items-center gap-3">
                                {questionsWithAnswers.length === 0 && (
                                    <>
                                        <h1 className="text-center text-2xl font-semibold">
                                            What can I help with?
                                        </h1>
                                        <div className="space-y-1 text-center text-sm text-neutral-400">
                                            <p>What is the main idea of this pdf?</p>
                                            <p>
                                                Can you explain the concept of topics mentioned in
                                                this pdf?
                                            </p>
                                            <p>
                                                Give a summary of the key points discussed in this
                                                pdf.
                                            </p>
                                        </div>
                                    </>
                                )}
                                <MyInput
                                    inputType="text"
                                    inputPlaceholder="Ask anything"
                                    input={question}
                                    onChangeFunction={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddQuestions();
                                        }
                                    }}
                                    required={true}
                                    size="large"
                                    className="w-[500px] rounded-xl px-6 py-4"
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default PlayWithPDF;
