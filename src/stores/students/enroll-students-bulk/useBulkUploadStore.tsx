// stores/students/enroll-students-bulk/useBulkUploadStore.ts
import { create } from "zustand";
// import { SchemaFields, ErrorType } from "@/types/students/bulk-upload-types";

// interface BulkUploadState {
//     csvData: SchemaFields[] | undefined;
//     setCsvData: (csvData: SchemaFields[] | undefined) => void;
//     csvErrors: ErrorType[];
//     setCsvErrors: (errors: ErrorType[]) => void;
//     isEditing: boolean;
//     setIsEditing: (value: boolean) => void;
// }

// stores/students/enroll-students-bulk/useBulkUploadStore.ts
import { BulkUploadStoreState } from "@/types/students/bulk-upload-types";

export const useBulkUploadStore = create<BulkUploadStoreState>((set) => ({
    csvData: undefined,
    csvErrors: [],
    isEditing: false,
    setCsvData: (data) => set({ csvData: data }),
    setCsvErrors: (errors) => set({ csvErrors: errors }),
    setIsEditing: (value) => set({ isEditing: value }),
}));
