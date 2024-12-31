// stores/students/enroll-students-bulk/useBulkUploadStore.ts
import { create } from "zustand";
import { BulkUploadStoreState } from "@/types/students/bulk-upload-types";

export const useBulkUploadStore = create<BulkUploadStoreState>((set) => ({
    csvData: undefined,
    csvErrors: [],
    isEditing: false,
    setCsvData: (data) => set({ csvData: data }),
    setCsvErrors: (errors) => set({ csvErrors: errors }),
    setIsEditing: (value) => set({ isEditing: value }),
}));
