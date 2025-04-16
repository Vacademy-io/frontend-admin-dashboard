import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MainViewQuillEditor } from "@/components/quill/MainViewQuillEditor";

export const Route = createFileRoute("/evaluator-ai/assessment/create-assessment/")({
    component: RouteComponent,
});

function RouteComponent() {
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate();

    const steps = ["Basic Info", "Add Questions", "Settings"];

    return (
        <div className="flex h-screen">
            <aside className="w-64 bg-gray-100 p-4">
                <ul className="space-y-2">
                    {steps.map((step, index) => (
                        <li
                            key={index}
                            className={`cursor-pointer ${
                                currentStep === index + 1 ? "font-bold" : ""
                            }`}
                            onClick={() => setCurrentStep(index + 1)}
                        >
                            Step {index + 1}: {step}
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="flex-1 p-6">
                {currentStep === 1 && (
                    <div>
                        Basic Info Component
                        <MainViewQuillEditor value={undefined} onChange={undefined} />
                    </div>
                )}
                {currentStep === 2 && <div>Add Questions Component</div>}
                {currentStep === 3 && <div>Settings Component</div>}
            </main>
        </div>
    );
}
