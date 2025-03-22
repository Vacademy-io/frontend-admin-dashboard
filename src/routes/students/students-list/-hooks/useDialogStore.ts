// stores/useDialogStore.ts
import { create } from "zustand";
import { StudentTable } from "@/types/student-table-types";
import { BulkActionInfo } from "../-types/bulk-actions-types";

interface DialogStore {
    isChangeBatchOpen: boolean;
    isExtendSessionOpen: boolean;
    isReRegisterOpen: boolean;
    isTerminateRegistrationOpen: boolean;
    isDeleteOpen: boolean;
    selectedStudent: StudentTable | null;
    bulkActionInfo: BulkActionInfo | null;
    isBulkAction: boolean;

    // Individual student actions
    openChangeBatchDialog: (student: StudentTable) => void;
    openExtendSessionDialog: (student: StudentTable) => void;
    openReRegisterDialog: (student: StudentTable) => void;
    openTerminateRegistrationDialog: (student: StudentTable) => void;
    openDeleteDialog: (student: StudentTable) => void;

    // Bulk actions
    openBulkChangeBatchDialog: (info: BulkActionInfo) => void;
    openBulkExtendSessionDialog: (info: BulkActionInfo) => void;
    openBulkReRegisterDialog: (info: BulkActionInfo) => void;
    openBulkTerminateRegistrationDialog: (info: BulkActionInfo) => void;
    openBulkDeleteDialog: (info: BulkActionInfo) => void;

    closeAllDialogs: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
    isChangeBatchOpen: false,
    isExtendSessionOpen: false,
    isReRegisterOpen: false,
    isTerminateRegistrationOpen: false,
    isDeleteOpen: false,
    selectedStudent: null,
    bulkActionInfo: null,
    isBulkAction: false,

    // Individual student actions
    openChangeBatchDialog: (student) =>
        set({
            isChangeBatchOpen: true,
            selectedStudent: student,
            bulkActionInfo: null,
            isBulkAction: false,
            isExtendSessionOpen: false,
            isReRegisterOpen: false,
            isTerminateRegistrationOpen: false,
            isDeleteOpen: false,
        }),

    openExtendSessionDialog: (student) =>
        set({
            isExtendSessionOpen: true,
            selectedStudent: student,
            bulkActionInfo: null,
            isBulkAction: false,
            isChangeBatchOpen: false,
            isReRegisterOpen: false,
            isTerminateRegistrationOpen: false,
            isDeleteOpen: false,
        }),

    openReRegisterDialog: (student) =>
        set({
            isReRegisterOpen: true,
            selectedStudent: student,
            bulkActionInfo: null,
            isBulkAction: false,
            isChangeBatchOpen: false,
            isExtendSessionOpen: false,
            isTerminateRegistrationOpen: false,
            isDeleteOpen: false,
        }),

    openTerminateRegistrationDialog: (student) =>
        set({
            isTerminateRegistrationOpen: true,
            selectedStudent: student,
            bulkActionInfo: null,
            isBulkAction: false,
            isChangeBatchOpen: false,
            isExtendSessionOpen: false,
            isReRegisterOpen: false,
            isDeleteOpen: false,
        }),

    openDeleteDialog: (student) =>
        set({
            isDeleteOpen: true,
            selectedStudent: student,
            bulkActionInfo: null,
            isBulkAction: false,
            isChangeBatchOpen: false,
            isExtendSessionOpen: false,
            isReRegisterOpen: false,
            isTerminateRegistrationOpen: false,
        }),

    // Bulk actions
    openBulkChangeBatchDialog: (info) =>
        set({
            isChangeBatchOpen: true,
            bulkActionInfo: info,
            isBulkAction: true,
            selectedStudent: null,
            isExtendSessionOpen: false,
            isReRegisterOpen: false,
            isTerminateRegistrationOpen: false,
            isDeleteOpen: false,
        }),

    openBulkExtendSessionDialog: (info) =>
        set({
            isExtendSessionOpen: true,
            bulkActionInfo: info,
            isBulkAction: true,
            selectedStudent: null,
            isChangeBatchOpen: false,
            isReRegisterOpen: false,
            isTerminateRegistrationOpen: false,
            isDeleteOpen: false,
        }),

    openBulkReRegisterDialog: (info) =>
        set({
            isReRegisterOpen: true,
            bulkActionInfo: info,
            isBulkAction: true,
            selectedStudent: null,
            isChangeBatchOpen: false,
            isExtendSessionOpen: false,
            isTerminateRegistrationOpen: false,
            isDeleteOpen: false,
        }),

    openBulkTerminateRegistrationDialog: (info) =>
        set({
            isTerminateRegistrationOpen: true,
            bulkActionInfo: info,
            isBulkAction: true,
            selectedStudent: null,
            isChangeBatchOpen: false,
            isExtendSessionOpen: false,
            isReRegisterOpen: false,
            isDeleteOpen: false,
        }),

    openBulkDeleteDialog: (info) =>
        set({
            isDeleteOpen: true,
            bulkActionInfo: info,
            isBulkAction: true,
            selectedStudent: null,
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
            bulkActionInfo: null,
            isBulkAction: false,
        }),
}));
