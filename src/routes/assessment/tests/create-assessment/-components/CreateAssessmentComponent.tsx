import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useState } from "react";

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
    return (
        <>
            {steps.map((step, index) => (
                <div
                    key={index}
                    onClick={() => onStepClick(index)}
                    className={`${
                        index <= currentStep || completedSteps[index - 1]
                            ? "cursor-pointer"
                            : "cursor-not-allowed"
                    } ${
                        currentStep === index
                            ? "bg-blue-500"
                            : completedSteps[index]
                              ? "bg-green-500"
                              : "bg-gray-300"
                    } text-white focus:outline-none`}
                >
                    {step}
                </div>
            ))}
        </>
    );
};

const CreateAssessmentComponent = () => {
    const steps = ["Step 1", "Step 2", "Step 3", "Step 4"];
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
            <h2>{steps[currentStep]}</h2>
            <p>Details for {steps[currentStep]} go here.</p>

            {currentStep < steps.length && (
                <button onClick={completeCurrentStep}>Complete Step</button>
            )}
        </LayoutContainer>
    );
};

export default CreateAssessmentComponent;
