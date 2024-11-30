import { create } from "zustand";

interface FormStore {
    currentStep: number;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    skipStep: () => void;
}

export const useFormStore = create<FormStore>((set) => ({
    currentStep: 1,
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
}));
