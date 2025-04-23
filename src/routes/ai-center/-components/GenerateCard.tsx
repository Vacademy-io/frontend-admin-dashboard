import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import { Input } from "@/components/ui/input";
import { StarFour, UploadSimple } from "phosphor-react";
import { useAICenter } from "../-contexts/useAICenterContext";
import { AIToolPageData } from "../-constants/AIToolPageData";
import { GetImagesForAITools } from "../-helpers/GetImagesForAITools";
import { Separator } from "@/components/ui/separator";
interface GenerateCardProps {
    handleUploadClick: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    cardTitle: string;
    cardDescription: string;
    inputFormat: string;
    keyProp: string | null;
}
export const GenerateCard = ({
    handleUploadClick,
    fileInputRef,
    handleFileChange,
    inputFormat,
    keyProp,
}: GenerateCardProps) => {
    const { key: keyContext, loader } = useAICenter();
    const toolData = keyProp ? AIToolPageData[keyProp] : null;
    return (
        <>
            {toolData && (
                <div className="flex w-full flex-col gap-4 px-8 text-neutral-600">
                    <div className="flex items-center gap-2 text-h2 font-semibold">
                        <StarFour size={30} weight="fill" className="text-primary-500" />{" "}
                        {toolData.heading}
                    </div>
                    {GetImagesForAITools(toolData.key)}
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
                    <div>
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
                                disable={keyContext !== keyProp && loader && keyContext != null}
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
            )}
        </>
    );
};
