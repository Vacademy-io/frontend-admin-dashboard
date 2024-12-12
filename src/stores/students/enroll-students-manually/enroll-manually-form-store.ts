import { create } from "zustand";
import { StepTwoDataType } from "@/components/common/students/enroll-manually/forms/step-two-form";
import { StepThreeDataType } from "@/components/common/students/enroll-manually/forms/step-three-form";
import { StepFourDataType } from "@/components/common/students/enroll-manually/forms/step-four-form";
import { StepFiveDataType } from "@/components/common/students/enroll-manually/forms/step-five-form";

// For step one, since it's just a file upload
type StepOneDataType = {
    profilePicture?: File | null;
};

interface FormStore {
    // Current step
    currentStep: number;

    // Form data using schema types
    stepOneData: StepOneDataType | null;
    stepTwoData: StepTwoDataType | null;
    stepThreeData: StepThreeDataType | null;
    stepFourData: StepFourDataType | null;
    stepFiveData: StepFiveDataType | null;

    // Actions
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    skipStep: () => void;

    // Data setters
    setStepOneData: (data: StepOneDataType) => void;
    setStepTwoData: (data: StepTwoDataType) => void;
    setStepThreeData: (data: StepThreeDataType) => void;
    setStepFourData: (data: StepFourDataType) => void;
    setStepFiveData: (data: StepFiveDataType) => void;

    // Reset form
    resetForm: () => void;
}

export const useFormStore = create<FormStore>((set) => ({
    currentStep: 1,

    // Initialize form data
    stepOneData: null,
    stepTwoData: null,
    stepThreeData: null,
    stepFourData: null,
    stepFiveData: null,

    // Navigation actions
    setStep: (step) => set({ currentStep: step }),
    nextStep: () =>
        set((state) => ({
            currentStep: state.currentStep < 5 ? state.currentStep + 1 : state.currentStep,
        })),
    prevStep: () =>
        set((state) => ({
            currentStep: state.currentStep > 1 ? state.currentStep - 1 : state.currentStep,
        })),
    skipStep: () =>
        set((state) => ({
            currentStep: state.currentStep === 1 ? 2 : state.currentStep,
        })),

    // Data setters
    setStepOneData: (data) => set({ stepOneData: data }),
    setStepTwoData: (data) => set({ stepTwoData: data }),
    setStepThreeData: (data) => set({ stepThreeData: data }),
    setStepFourData: (data) => set({ stepFourData: data }),
    setStepFiveData: (data) => set({ stepFiveData: data }),

    // Reset function
    resetForm: () =>
        set({
            currentStep: 1,
            stepOneData: null,
            stepTwoData: null,
            stepThreeData: null,
            stepFourData: null,
            stepFiveData: null,
        }),
}));
