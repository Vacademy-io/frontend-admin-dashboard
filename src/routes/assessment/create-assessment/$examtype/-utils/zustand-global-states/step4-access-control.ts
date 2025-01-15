import { create } from "zustand";

// Define the type for the state
interface AccessControlState {
    status?: string;
    assessment_creation_access?: {
        roles: { roleId: string; roleName: string; isSelected: boolean }[];
        users: { userId: string; email: string }[];
    };
    live_assessment_notification?: {
        roles: { roleId: string; roleName: string; isSelected: boolean }[];
        users: { userId: string; email: string }[];
    };
    assessment_submission_and_report_access?: {
        roles: { roleId: string; roleName: string; isSelected: boolean }[];
        users: { userId: string; email: string }[];
    };
    evaluation_process?: {
        roles: { roleId: string; roleName: string; isSelected: boolean }[];
        users: { userId: string; email: string }[];
    };
    setAccessControlData: (data: Partial<AccessControlState>) => void;
    getAccessControlData: () => AccessControlState;
}

export const useAccessControlStore = create<AccessControlState>((set, get) => ({
    setAccessControlData: (data) => set(() => data),
    getAccessControlData: () => get(),
}));
