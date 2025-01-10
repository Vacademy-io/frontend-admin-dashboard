import { create } from "zustand";

interface BasicInfoState {
    assessmentPreview?: {
        checked: boolean;
        previewTimeLimit?: number; // Ensure this is explicitly a number
    };
    durationDistribution?: string;
    evaluationType?: string;
    raiseReattemptRequest?: boolean;
    raiseTimeIncreaseRequest?: boolean;
    status?: "INCOMPLETE" | "COMPLETE";
    submissionType?: string;
    switchSections?: boolean;
    testCreation?: {
        assessmentInstructions?: string;
        assessmentName?: string;
        liveDateRange?: {
            startDate?: string;
            endDate?: string;
        };
        subject?: string | null;
    };
    testDuration?: {
        entireTestDuration: {
            checked: boolean;
            testDuration: {
                hrs: number;
                min: number;
            };
        };
        questionWiseDuration: boolean;
        sectionWiseDuration: boolean;
    };
    setBasicInfo: (data: Partial<BasicInfoState>) => void;
    getBasicInfo: () => BasicInfoState;
}

export const useBasicInfoStore = create<BasicInfoState>((set, get) => ({
    setBasicInfo: (data) => set((state) => ({ ...state, ...data })),
    getBasicInfo: () => get(),
}));
