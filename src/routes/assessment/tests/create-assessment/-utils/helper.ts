import { Steps } from "@/types/assessment-data-type";

export function getStepKey({
    assessmentDetails,
    currentStep,
    key,
}: {
    assessmentDetails: Steps;
    currentStep: number;
    key: string;
}) {
    const isExists = assessmentDetails[currentStep]?.step_keys?.some((keyValuePair) =>
        Object.hasOwn(keyValuePair, key),
    );
    return isExists;
}

export const getFieldOptions = ({
    assessmentDetails,
    currentStep,
    key,
    value,
}: {
    assessmentDetails: Steps;
    currentStep: number;
    key: string;
    value: string;
}): boolean => {
    // Safely access the nested array using optional chaining
    return (
        assessmentDetails[currentStep]?.field_options?.[key]?.some(
            (item) => item.value === value,
        ) || false
    );
};
