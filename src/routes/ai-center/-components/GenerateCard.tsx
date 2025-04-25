import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import { Input } from "@/components/ui/input";
import { StarFour, UploadSimple } from "phosphor-react";
import { useAICenter } from "../-contexts/useAICenterContext";
import { AIToolPageData } from "../-constants/AIToolPageData";
import { GetImagesForAITools } from "../-helpers/GetImagesForAITools";
import { Separator } from "@/components/ui/separator";
import { MyInput } from "@/components/design-system/input";
import AITasksList from "./AITasksList";
import { Textarea } from "@/components/ui/textarea";
interface GenerateCardProps {
    handleUploadClick: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    cardTitle: string;
    cardDescription: string;
    inputFormat: string;
    keyProp: string | null;
    taskName: string;
    setTaskName: React.Dispatch<React.SetStateAction<string>>;
    prompt?: string;
    setPrompt?: React.Dispatch<React.SetStateAction<string>>;
}
export const GenerateCard = ({
    handleUploadClick,
    fileInputRef,
    handleFileChange,
    inputFormat,
    keyProp,
    taskName,
    setTaskName,
    prompt,
    setPrompt,
}: GenerateCardProps) => {
    const { key: keyContext, loader } = useAICenter();
    const toolData = keyProp ? AIToolPageData[keyProp] : null;
    return (
        <>
            {toolData && (
                <div className="flex w-full flex-col gap-4 px-8 text-neutral-600">
                    <div className="flex w-fit items-center justify-start gap-2">
                        <div className="flex items-center gap-2 text-h2 font-semibold">
                            <StarFour size={30} weight="fill" className="text-primary-500" />{" "}
                            {toolData.heading}
                        </div>
                        <AITasksList heading={toolData.heading} />
                    </div>
                    <div className="flex items-center justify-between">
                        {GetImagesForAITools(toolData.key)}
                        <div className="flex flex-col gap-4">
                            {keyProp !== "audio" && (
                                <MyInput
                                    inputType="text"
                                    inputPlaceholder="Enter Your Task Name"
                                    input={taskName}
                                    onChangeFunction={(e) => setTaskName(e.target.value)}
                                    required={true}
                                    label="Task Name"
                                />
                            )}
                            {(keyProp === "sortSplitPdf" || keyProp === "sortTopicsPdf") && (
                                <div className="flex flex-col gap-2">
                                    <h1>
                                        Prompt <span className="text-red-500">*</span>
                                    </h1>
                                    <Textarea
                                        placeholder="For example, Generate a set of questions covering the key principles of photosynthesis, including the process, factors affecting it, and its importance in the ecosystem. Focus on conceptual understanding and application"
                                        className="h-[100px] w-full"
                                        value={prompt}
                                        onChange={(e) => setPrompt?.(e.target.value)}
                                    />
                                </div>
                            )}
                            {loader && keyContext == keyProp && keyContext != null ? (
                                <MyButton
                                    type="button"
                                    scale="medium"
                                    buttonType="primary"
                                    layoutVariant="default"
                                    className="w-full text-sm"
                                >
                                    <DashboardLoader size={20} color="#ffffff" />
                                </MyButton>
                            ) : (
                                <MyButton
                                    type="button"
                                    scale="medium"
                                    buttonType="primary"
                                    layoutVariant="default"
                                    className="text-sm"
                                    onClick={handleUploadClick}
                                    disable={
                                        (keyContext !== keyProp && loader && keyContext != null) ||
                                        (keyProp !== "audio" && !taskName)
                                    }
                                >
                                    <UploadSimple size={32} />
                                    Upload
                                </MyButton>
                            )}
                            <Input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept={inputFormat}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-h3 font-semibold">How to use {toolData.heading}</p>
                        <p className="text-subtitle">{toolData.instructionsHeading}</p>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-6">
                        {toolData.instructions.map((steps, index) => (
                            <div key={index}>
                                <div className="flex gap-2 text-title font-semibold">
                                    <p className="text-primary-500">Step {index + 1}</p>
                                    <p>{steps.stepHeading}</p>
                                </div>
                                <p>{steps.stepSubHeading}</p>
                                <ul className="flex flex-col text-body">
                                    {steps.steps.map((step, index) => (
                                        <li key={index}>
                                            <p>{step}</p>
                                        </li>
                                    ))}
                                </ul>
                                <p>{steps.stepFooter}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
