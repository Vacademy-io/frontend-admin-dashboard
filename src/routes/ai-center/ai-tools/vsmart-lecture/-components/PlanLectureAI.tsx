import { Separator } from "@/components/ui/separator";
import AITasksList from "@/routes/ai-center/-components/AITasksList";
import { AIToolPageData } from "@/routes/ai-center/-constants/AIToolPageData";
import { GetImagesForAITools } from "@/routes/ai-center/-helpers/GetImagesForAITools";
import { StarFour } from "phosphor-react";
import PlanLectureForm from "./PlanLectureForm";

const PlanLectureAI = () => {
    const toolData = AIToolPageData["planLecture"];
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
                        <PlanLectureForm />
                    </div>
                </div>
            )}
        </>
    );
};

export default PlanLectureAI;
