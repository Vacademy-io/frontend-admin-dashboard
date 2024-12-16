// stores/useDialogStore.ts
import { create } from "zustand";
import { StudentTable } from "@/schemas/student/student-list/table-schema";

interface DialogStore {
    isChangeBatchOpen: boolean;
    isExtendSessionOpen: boolean;
    isReRegisterOpen: boolean;
    isTerminateRegistrationOpen: boolean;
    isDeleteOpen: boolean;
    selectedStudent: StudentTable | null;
    openChangeBatchDialog: (student: StudentTable) => void;
    openExtendSessionDialog: (student: StudentTable) => void;
    openReRegisterDialog: (student: StudentTable) => void;
    openTerminateRegistrationDialog: (student: StudentTable) => void;
    openDeleteDialog: (student: StudentTable) => void;
    closeAllDialogs: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
    isChangeBatchOpen: false,
    isExtendSessionOpen: false,
    isReRegisterOpen: false,
    isTerminateRegistrationOpen: false,
    isDeleteOpen: false,
    selectedStudent: null,
    openChangeBatchDialog: (student) =>
        set({
            isChangeBatchOpen: true,
            selectedStudent: student,
            isExtendSessionOpen: false,
            isReRegisterOpen: false,
            isTerminateRegistrationOpen: false,
            isDeleteOpen: false,
        }),
    openExtendSessionDialog: (student) =>
        set({
            isExtendSessionOpen: true,
            selectedStudent: student,
            isChangeBatchOpen: false,
            isReRegisterOpen: false,
            isTerminateRegistrationOpen: false,
            isDeleteOpen: false,
        }),
    openReRegisterDialog: (student) =>
        set({
            isReRegisterOpen: true,
            selectedStudent: student,
            isChangeBatchOpen: false,
            isExtendSessionOpen: false,
            isTerminateRegistrationOpen: false,
            isDeleteOpen: false,
        }),
    openTerminateRegistrationDialog: (student) =>
        set({
            isTerminateRegistrationOpen: true,
            selectedStudent: student,
            isChangeBatchOpen: false,
            isExtendSessionOpen: false,
            isReRegisterOpen: false,
            isDeleteOpen: false,
        }),
    openDeleteDialog: (student) =>
        set({
            isDeleteOpen: true,
            selectedStudent: student,
            isChangeBatchOpen: false,
            isExtendSessionOpen: false,
            isReRegisterOpen: false,
            isTerminateRegistrationOpen: false,
        }),
    closeAllDialogs: () =>
        set({
            isChangeBatchOpen: false,
            isExtendSessionOpen: false,
            isReRegisterOpen: false,
            isTerminateRegistrationOpen: false,
            isDeleteOpen: false,
            selectedStudent: null,
        }),
}));
