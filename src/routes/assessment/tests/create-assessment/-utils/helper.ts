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
    if (!assessmentDetails[currentStep]?.field_options?.[key]) {
        // Key does not exist in the object
        return false;
    }

    // Check if the value exists in the array for the given key
    return assessmentDetails[currentStep].field_options[key].some((item) => item.value === value);
};
