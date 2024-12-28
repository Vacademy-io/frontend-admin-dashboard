import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useState } from "react";
import { MainStepComponent } from "./StepComponents/MainStepComponent";
import { CheckCircle } from "phosphor-react";
import useSidebarStore from "../-utils/global-states";
// Define interfaces for props
interface CreateAssessmentSidebarProps {
    steps: string[];
    currentStep: number;
    completedSteps: boolean[];
    onStepClick: (index: number) => void;
}

const CreateAssessmentSidebar: React.FC<CreateAssessmentSidebarProps> = ({
    steps,
    currentStep,
    completedSteps,
    onStepClick,
}) => {
    const { sidebarOpen } = useSidebarStore();
    return (
        <>
            {steps.map((step, index) => (
                <div
                    key={index}
                    onClick={() => onStepClick(index)}
                    className={`mx-6 flex items-center justify-between px-6 py-3 ${
                        index <= currentStep || completedSteps[index - 1]
                            ? "cursor-pointer"
                            : "cursor-not-allowed"
                    } ${
                        currentStep === index
                            ? "rounded-lg border-2 bg-white !text-primary-500"
                            : completedSteps[index]
                              ? "bg-transparent text-black"
                              : `bg-transparent ${
                                    index > 0 && completedSteps[index - 1]
                                        ? "text-black"
                                        : "text-gray-300"
                                } `
                    } focus:outline-none`}
                >
                    <div className="flex items-center gap-6">
                        {!sidebarOpen && !completedSteps[index] && (
                            <span className="text-lg font-semibold">{index + 1}</span>
                        )}
                        {sidebarOpen && <span className="text-lg font-semibold">{index + 1}</span>}
                        {sidebarOpen && <span className="font-thin">{step}</span>}
                    </div>

                    {completedSteps[index] && (
                        <CheckCircle size={24} weight="fill" className="!text-green-500" />
                    )}
                </div>
            ))}
        </>
    );
};

const CreateAssessmentComponent = () => {
    const steps = ["Basic Info", "Add Question", "Add Participants", "Access Control"];
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([false, false, false, false]);

    const completeCurrentStep = () => {
        setCompletedSteps((prev) => {
            const updated = [...prev];
            updated[currentStep] = true;
            return updated;
        });
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const goToStep = (index: number) => {
        if (index <= currentStep || completedSteps[index - 1]) {
            setCurrentStep(index);
        }
    };
    return (
        <LayoutContainer
            sidebarComponent={
                <CreateAssessmentSidebar
                    steps={steps}
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    onStepClick={goToStep}
                />
            }
        >
            <MainStepComponent
                currentStep={currentStep}
                handleCompleteCurrentStep={completeCurrentStep}
                completedSteps={completedSteps}
            />
        </LayoutContainer>
    );
};

export default CreateAssessmentComponent;
